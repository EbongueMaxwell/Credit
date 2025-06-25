from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Relationship to predictions
    predictions = relationship("Prediction", back_populates="user")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, index=True)
    credit_score = Column(Integer)
    risk_level = Column(String)
    decision = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Additional fields for more detailed prediction storage
    income = Column(Float, nullable=True)
    loan_amount = Column(Float, nullable=True)
    interest_rate = Column(Float, nullable=True)
    employment = Column(String, nullable=True)
    loan_purpose = Column(String, nullable=True)
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationship to user
    user = relationship("User", back_populates="predictions")