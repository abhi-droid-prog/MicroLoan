from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Profile Data
    full_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    aadhaar_number = Column(String, nullable=True)
    pan_number = Column(String, nullable=True)
    
    # Verification Status
    aadhaar_verified = Column(Boolean, default=False)
    pan_verified = Column(Boolean, default=False)
    
    # Financial Data
    platform_type = Column(String, nullable=True) # Swiggy / Ola / Urban Company / Other
    monthly_income = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)
    emi_amount = Column(Float, default=0.0)
    digital_payment_usage = Column(String, default="Medium") # Low / Medium / High
    months_consistent_work = Column(Integer, default=0)

    scores = relationship("ScoreHistory", back_populates="user")


class ScoreHistory(Base):
    __tablename__ = "score_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    total_score = Column(Integer)
    income_stability_score = Column(Integer)
    expense_ratio_score = Column(Integer)
    emi_burden_score = Column(Integer)
    digital_payment_score = Column(Integer)
    
    explanation_en = Column(String, nullable=True)
    explanation_hi = Column(String, nullable=True)
    explanation_ta = Column(String, nullable=True)
    
    suggestions_json = Column(String, nullable=True) # Store JSON string of suggestions
    
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scores")
