import logging
from sqlalchemy.orm import Session
from sqlalchemy import desc
from passlib.context import CryptContext
from datetime import datetime
from . import models, schemas
from typing import List, Optional

# Configure logging
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User CRUD operations
def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(
    db: Session, 
    user_id: int, 
    user_update: schemas.UserUpdate
) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.dict(exclude_unset=True)
        if "password" in update_data:
            hashed_password = pwd_context.hash(update_data["password"])
            db_user.hashed_password = hashed_password
        db.commit()
        db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user

# Prediction CRUD operations
def create_prediction(db: Session, prediction_data: schemas.PredictionCreate, user_id: int):
    logger.info(f"Creating prediction for user {user_id}")
    db_prediction = models.Prediction(
        **prediction_data.dict(),
        user_id=user_id,
        timestamp=datetime.utcnow()
    )
    db.add(db_prediction)
    try:
        db.commit()
        db.refresh(db_prediction)
        logger.info(f"Prediction created successfully: {db_prediction.id}")
        return db_prediction
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create prediction: {str(e)}")
        raise

def get_prediction(db: Session, prediction_id: int) -> Optional[models.Prediction]:
    return db.query(models.Prediction).filter(models.Prediction.id == prediction_id).first()

def get_predictions(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100,
    order_by: str = "timestamp",
    order_direction: str = "desc"
) -> List[models.Prediction]:
    query = db.query(models.Prediction).filter(models.Prediction.user_id == user_id)
    
    # Apply ordering
    order_column = getattr(models.Prediction, order_by, models.Prediction.timestamp)
    if order_direction.lower() == "desc":
        query = query.order_by(desc(order_column))
    else:
        query = query.order_by(order_column)
    
    return query.offset(skip).limit(limit).all()

def get_user_prediction_count(db: Session, user_id: Optional[int] = None):
    if user_id is not None:
        return db.query(models.Prediction).filter(models.Prediction.user_id == user_id).count()
    else:
        return db.query(models.Prediction).count()

def delete_prediction(db: Session, prediction_id: int, user_id: int) -> bool:
    db_prediction = db.query(models.Prediction).filter(
        models.Prediction.id == prediction_id,
        models.Prediction.user_id == user_id
    ).first()
    if db_prediction:
        db.delete(db_prediction)
        db.commit()
        return True
    return False

def get_recent_analyses(
    db: Session, 
    user_id: int, 
    limit: int = 5
) -> List[models.Prediction]:
    return (
        db.query(models.Prediction)
        .filter(models.Prediction.user_id == user_id)
        .order_by(models.Prediction.timestamp.desc())
        .limit(limit)
        .all()
    )
    
def create_test_predictions(db: Session, user_id: int, count: int = 10):
    import random
    from datetime import datetime, timedelta
    
    risk_levels = ["very low", "low", "medium", "high", "very high"]
    decisions = ["approved", "approved with conditions", "declined"]
    
    for i in range(count):
        score = random.randint(300, 850)
        risk = random.choice(risk_levels)
        decision = random.choice(decisions)
        
        db_prediction = models.Prediction(
            client_name=f"Test Client {i+1}",
            credit_score=score,
            risk_level=risk,
            decision=decision,
            income=random.uniform(1000, 10000),
            loan_amount=random.uniform(500, 5000),
            interest_rate=random.uniform(5, 20),
            employment=random.choice(["employed", "self-employed", "unemployed"]),
            loan_purpose=random.choice(["business", "education", "home"]),
            user_id=user_id,
            timestamp=datetime.now() - timedelta(days=random.randint(0, 30))
        )
        db.add(db_prediction)
    
    db.commit()