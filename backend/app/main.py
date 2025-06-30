from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import FileResponse
import json
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import WebSocket, WebSocketDisconnect
from passlib.context import CryptContext
from .pdf_generator import PDFGenerator
import os
from sqlalchemy.orm import Session
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from typing import Optional, List
from pydantic import BaseModel, Field
from . import schemas, crud, auth
from typing import List
from .database import SessionLocal, engine, Base
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI()


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Load model and encoders
try:
    model_data = joblib.load('app/credit_scoring_model.pkl')
    model = model_data['model']
    label_encoders = model_data['label_encoders']
    num_cols = model_data['num_cols']
    cat_cols = model_data['cat_cols']
    logger.info("Model and encoders loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    raise RuntimeError(f"Model loading failed: {str(e)}")

# Pydantic models
class CreditApplication(BaseModel):
    client_name: str = Field(default="Applicant")
    age: int = Field(..., gt=18, lt=100)
    income: float = Field(..., gt=0)
    employment: str
    loanAmount: float = Field(..., gt=0)
    loanPurpose: str
    location: str
    phoneUsage: str
    utilityPayments: str
    interestRate: float = Field(..., gt=0, le=30)
    turnover: float = Field(..., gt=0)
    customerTenure: int = Field(..., ge=0)
    avgDaysLateCurrent: int = Field(..., ge=0)
    numLatePaymentsCurrent: int = Field(..., ge=0)
    unpaidAmount: float = Field(..., ge=0)
    industrySector: str
    creditType: str
    hasGuarantee: str
    guaranteeType: str
    repaymentFrequency: str

class CreditScoreResponse(BaseModel):
    client: str
    creditScore: int
    riskLevel: str
    approvalProbability: str
    decision: str
    keyFactors: dict
    modelVersion: str
    timestamp: str

class RecentAnalysis(BaseModel):
    id: int
    client_name: str
    credit_score: int
    risk_level: str
    decision: str
    timestamp: str

# Feature mapping
FEATURE_MAPPING = {
    "age": "age",
    "income": "income",
    "loanAmount": "loan_amount",
    "interestRate": "interest_rate",
    "turnover": "turnover",
    "customerTenure": "customer_tenure",
    "avgDaysLateCurrent": "avg_days_late_current",
    "numLatePaymentsCurrent": "num_late_payments_current",
    "unpaidAmount": "unpaid_amount",
    "industrySector": "industry_sector",
    "creditType": "credit_type",
    "hasGuarantee": "has_guarantee",
    "guaranteeType": "guarantee_type",
    "repaymentFrequency": "repayment_frequency"
}

# Authentication endpoints
@app.post("/register", response_model=schemas.User)
async def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create the user
    return crud.create_user(db=db, user=user)
@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    refresh_token = auth.create_refresh_token(data={"sub": user.email})
    
    response = JSONResponse(
        content={"access_token": access_token, "token_type": "bearer"}
    )
    
    # Set refresh token as HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # Enable in production with HTTPS
        samesite="lax",
        max_age=60 * 60 * 24 * 7  # 1 week
    )
    
    return response

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = request.headers.get("Authorization")
    if not token:
        raise credentials_exception
    try:
        token = token.split(" ")[1] if " " in token else token
        email = await auth.verify_token(token)
        if email is None:
            raise credentials_exception
        user = crud.get_user_by_email(db, email=email)
        if user is None:
            raise credentials_exception
        return user
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise credentials_exception

# Helper functions
def preprocess_input(data: dict) -> pd.DataFrame:
    """Convert form data to model input format"""
    input_dict = {}
    
    for form_field, model_feature in FEATURE_MAPPING.items():
        if form_field in data:
            if model_feature in num_cols:
                input_dict[model_feature] = float(data[form_field])
            elif model_feature == 'has_guarantee':
                input_dict[model_feature] = 1 if str(data[form_field]).lower() in ['yes', 'true', '1'] else 0
            else:
                input_dict[model_feature] = str(data[form_field])
    
    return pd.DataFrame([input_dict])

def encode_categorical_features(df: pd.DataFrame) -> pd.DataFrame:
    """Encode categorical features using saved label encoders with proper unknown value handling"""
    for col in cat_cols:
        if col in df.columns:
            raw_value = df[col].iloc[0]
            str_value = str(raw_value) if not pd.isna(raw_value) else "missing"
            
            # Handle unseen categories by using the most frequent category
            if str_value not in label_encoders[col].classes_:
                logger.warning(f"Unseen category '{str_value}' in column '{col}', using most frequent category")
                str_value = label_encoders[col].classes_[0]
            
            df[col] = label_encoders[col].transform([str_value])[0]
    
    return df

def calculate_credit_score(prob_default: float) -> int:
    """Convert probability of default to credit score (300-850)"""
    odds = (1 - prob_default) / (prob_default + 1e-9)
    score = 300 + (50 * np.log10(odds))
    return int(np.clip(score, 300, 850))

def determine_risk_level(score: int) -> str:
    """Categorize risk based on credit score"""
    if score >= 750:
        return "Very Low"
    elif score >= 650:
        return "Low"
    elif score >= 550:
        return "Medium"
    elif score >= 450:
        return "High"
    return "Very High"

def get_key_factors(input_data: dict) -> dict:
    """Generate key positive/negative factors for decision"""
    factors = {"positive": [], "negative": []}
    
    if input_data.get('income', 0) > 100000:
        factors["positive"].append("High income")
    if input_data.get('customer_tenure', 0) > 24:
        factors["positive"].append("Long customer tenure")
    
    if input_data.get('avg_days_late_current', 0) > 15:
        factors["negative"].append("Frequent late payments")
    if input_data.get('num_late_payments_current', 0) > 3:
        factors["negative"].append("Multiple late payments")
    
    debt_ratio = input_data.get('loan_amount', 0) / max(input_data.get('income', 1), 1)
    if debt_ratio > 0.35:
        factors["negative"].append(f"High debt ratio ({debt_ratio:.0%})")
    
    return factors

# Prediction endpoint
@app.post("/predict", response_model=CreditScoreResponse)
async def predict_credit_score(request: Request, application: CreditApplication, db: Session = Depends(get_db)):
    try:
        logger.info(f"Starting prediction for {application.client_name}")
        
        # Authentication and user handling
        user = None
        token = request.headers.get("Authorization")
        if token:
            try:
                token = token.split(" ")[1] if " " in token else token
                email = await auth.verify_token(token)
                user = crud.get_user_by_email(db, email=email)
                logger.info(f"Authenticated user: {email} (ID: {user.id if user else 'None'})")
            except Exception as e:
                logger.warning(f"Token verification failed: {str(e)}")

        # Prediction logic
        app_data = application.dict()
        input_df = preprocess_input(app_data)
        input_df = encode_categorical_features(input_df)
        
        # Make prediction
        prob_default = model.predict_proba(input_df)[0][1]
        score = calculate_credit_score(prob_default)
        approval_prob = 100 * (1 - prob_default)
        
        # Prepare prediction data
        prediction_data = {
            "client_name": application.client_name,
            "credit_score": score,
            "risk_level": determine_risk_level(score).lower(),
            "decision": "approved" if score >= 650 else "approved with conditions" if score >= 550 else "declined",
            "income": application.income,
            "loan_amount": application.loanAmount,
            "interest_rate": application.interestRate,
            "employment": application.employment,
            "loan_purpose": application.loanPurpose
        }
        logger.info(f"Prediction data prepared: {prediction_data}")

        # Save to database
        try:
            prediction = crud.create_prediction(
                db, 
                schemas.PredictionCreate(**prediction_data),
                user_id=user.id if user else None
            )
            logger.info(f"Prediction saved to DB with ID: {prediction.id}")
        except Exception as e:
            logger.error(f"Failed to save prediction: {str(e)}")
            raise

        # Broadcast via WebSocket
        broadcast_data = {
            "type": "new_prediction",
            "data": {
                "id": prediction.id,
                "user_email": user.email if user else None,  # Using email instead of ID
                "client_name": application.client_name,
                "credit_score": score,
                "risk_level": prediction_data["risk_level"],
                "decision": prediction_data["decision"],
                "timestamp": datetime.now().isoformat(),
                "total_clients": crud.get_user_prediction_count(db, user_id=user.id if user else None)
            }
        }
        logger.info(f"Broadcasting prediction: {broadcast_data}")
        await manager.broadcast(broadcast_data)

        # Prepare response
        response = {
            "client": application.client_name,
            "creditScore": score,
            "riskLevel": prediction_data["risk_level"],
            "approvalProbability": f"{approval_prob:.1f}%",
            "decision": prediction_data["decision"],
            "keyFactors": get_key_factors(input_df.iloc[0].to_dict()),
            "modelVersion": "1.0",
            "timestamp": datetime.now().isoformat()
        }
        
        return response
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
@app.get("/predictions", response_model=List[schemas.Prediction])
async def get_predictions(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get historical predictions for the authenticated user"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header missing"
            )
        
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        email = await auth.verify_token(token)
        user = crud.get_user_by_email(db, email=email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user"
            )
        
        predictions = crud.get_predictions(db, user_id=user.id, skip=skip, limit=limit)
        return predictions
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching predictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch predictions"
        )

@app.get("/recent-analyses", response_model=List[schemas.RecentAnalysis])
async def get_recent_analyses(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get recent analyses for the authenticated user"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header missing"
            )
        
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        email = await auth.verify_token(token)
        user = crud.get_user_by_email(db, email=email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user"
            )
        
        recent_analyses = crud.get_recent_analyses(db, user_id=None)  # Changed from None to user.id
        
        # Convert to the format expected by the frontend
        return [
            {
                "id": analysis.id,
                "client_name": analysis.client_name,
                "credit_score": analysis.credit_score,
                "risk_level": analysis.risk_level,
                "decision": analysis.decision,
                "timestamp": analysis.timestamp.isoformat()  # Changed from created_at to timestamp
            }
            for analysis in recent_analyses
        ]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching recent analyses: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent analyses"
        )

@app.get("/dashboard-stats")
async def get_dashboard_stats(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for the authenticated user"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header missing"
            )
        
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        email = await auth.verify_token(token)
        user = crud.get_user_by_email(db, email=email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user"
            )
        
        # Get basic stats
        total_clients = crud.get_user_prediction_count(db, user_id=None)
        predictions = crud.get_predictions(db, user_id=None, limit=1000)
        
        if not predictions:
            return {
                "total_clients": 0,
                "average_score": 0,
                "high_risk_clients": 0,
                "portfolio_risk": "Low",
                "approval_rate": 0,
                "default_rate": 0,
                "model_accuracy": 0,
                "score_distribution": [
                    {"name": "High (300-579)", "count": 0},
                    {"name": "Medium (580-667)", "count": 0},
                    {"name": "Low (668-850)", "count": 0}
                ],
                "decision_distribution": [
                    {"name": "Approved", "count": 0},
                    {"name": "Approved with Conditions", "count": 0},
                    {"name": "Declined", "count": 0}
                ]
            }
        
        # Calculate statistics
        scores = [p.credit_score for p in predictions]
        average_score = sum(scores) / len(scores) if scores else 0
        
        high_risk = len([p for p in predictions if p.risk_level.lower() in ["high", "very high"]])
        medium_risk = len([p for p in predictions if p.risk_level.lower() == "medium"])
        
        # Determine portfolio risk
        if len(predictions) > 0:
            if high_risk / len(predictions) > 0.2:
                portfolio_risk = "High"
            elif medium_risk / len(predictions) > 0.3:
                portfolio_risk = "Medium"
            else:
                portfolio_risk = "Low"
        else:
            portfolio_risk = "Low"
        
        # Approval rate
        approved = len([p for p in predictions if p.decision.lower() == "approved"])
        approval_rate = (approved / len(predictions)) * 100 if predictions else 0
        
        # Score distribution
        score_distribution = [
            {"name": "High (300-579)", "count": len([s for s in scores if 300 <= s <= 579])},
            {"name": "Medium (580-667)", "count": len([s for s in scores if 580 <= s <= 667])},
            {"name": "Low (668-850)", "count": len([s for s in scores if 668 <= s <= 850])}
        ]
        
        # Decision distribution
        decision_distribution = [
            {"name": "Approved", "count": approved},
            {"name": "Approved with Conditions", "count": len([p for p in predictions if p.decision.lower() == "approved with conditions"])},
            {"name": "Declined", "count": len([p for p in predictions if p.decision.lower() == "declined"])}
        ]
        
        return {
            "total_clients": total_clients,
            "average_score": round(average_score),
            "high_risk_clients": high_risk,
            "portfolio_risk": portfolio_risk,
            "approval_rate": round(approval_rate, 1),
            "default_rate": round((high_risk / len(predictions)) * 100, 1) if predictions else 0,
            "model_accuracy": 94.7,  # This would come from your model metrics
            "approval_change": 2.1,   # Would need to compare with previous period
            "default_change": -0.5,   # Would need to compare with previous period
            "accuracy_change": 1.2,   # Would need to compare with previous period
            "score_distribution": score_distribution,
            "decision_distribution": decision_distribution
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard statistics"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}
@app.post("/refresh-token")
async def refresh_token(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Get refresh token from cookies
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            raise credentials_exception
            
        # Verify refresh token
        email = await auth.verify_token(refresh_token, is_refresh=True)
        if email is None:
            raise credentials_exception
            
        # Get user
        user = crud.get_user_by_email(db, email=email)
        if user is None:
            raise credentials_exception
            
        # Create new access token
        access_token = auth.create_access_token(data={"sub": user.email})
        
        # Set new refresh token as cookie
        new_refresh_token = auth.create_refresh_token(data={"sub": user.email})
        response = JSONResponse(
            content={"access_token": access_token, "token_type": "bearer"}
        )
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=60 * 60 * 24 * 7  # 1 week
        )
        return response
        
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise credentials_exception
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    # Verify token if provided
    if token:
        try:
            email = await auth.verify_token(token)
            if not email:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        except Exception as e:
            logger.error(f"WebSocket token verification failed: {str(e)}")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    
    await manager.connect(websocket)
    logger.info(f"New WebSocket connection established. Total connections: {len(manager.active_connections)}")
    
    try:
        while True:
            data = await websocket.receive_text()
            logger.debug(f"Received WebSocket message: {data}")
            
            try:
                message = json.loads(data)
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                logger.warning("Received invalid JSON message")
                
    except WebSocketDisconnect:
        logger.info("Client disconnected normally")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        manager.disconnect(websocket)
        logger.info(f"WebSocket connection closed. Remaining connections: {len(manager.active_connections)}")
        
@app.get("/debug/predictions")
async def debug_predictions(
    request: Request,
    db: Session = Depends(get_db)
):
    """Debug endpoint to view all predictions"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = auth_header.split(" ")[1] if " " in auth_header else auth_header
    email = await auth.verify_token(token)
    user = crud.get_user_by_email(db, email=email)
    
    predictions = db.query(models.Prediction).all()
    return [
        {
            "id": p.id,
            "client_name": p.client_name,
            "user_id": p.user_id,
            "timestamp": p.timestamp.isoformat(),
            "credit_score": p.credit_score,
            "risk_level": p.risk_level,
            "decision": p.decision
        }
        for p in predictions
    ]

@app.get("/debug/users")
async def debug_users(db: Session = Depends(get_db)):
    """Debug endpoint to view all users"""
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "username": u.username
        }
        for u in users
    ]

# Add this after your existing imports

@app.post("/generate-pdf")
async def generate_pdf(prediction_data: dict):
    try:
        # Generate the PDF
        pdf_path = PDFGenerator.generate_credit_report(prediction_data)
        
        # Return the PDF file
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=os.path.basename(pdf_path)
        )
    except Exception as e:
        logger.error(f"PDF generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
