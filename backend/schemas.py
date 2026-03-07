from pydantic import BaseModel, EmailStr
from typing import Optional, List
import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    platform_type: Optional[str] = None
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    emi_amount: Optional[float] = None
    digital_payment_usage: Optional[str] = None
    months_consistent_work: Optional[int] = None

class UserOut(UserBase):
    id: int
    full_name: Optional[str]
    phone_number: Optional[str]
    aadhaar_number: Optional[str]
    pan_number: Optional[str]
    aadhaar_verified: bool
    pan_verified: bool
    platform_type: Optional[str]
    monthly_income: float
    monthly_expenses: float
    emi_amount: float
    digital_payment_usage: str
    months_consistent_work: int

    class Config:
        orm_mode = True
        from_attributes = True

# --- Verification Schemas ---
class AadhaarVerify(BaseModel):
    aadhaar_number: str

class PanVerify(BaseModel):
    pan_number: str

# --- Token Schema ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Scoring Schemas ---
class ScoreInput(BaseModel):
    monthly_income: float
    monthly_expenses: float
    emi_amount: float
    digital_payment_usage: str # Low, Medium, High
    months_consistent_work: int

class ScoreResult(BaseModel):
    total_score: int
    income_stability_score: int
    expense_ratio_score: int
    emi_burden_score: int
    digital_payment_score: int
    
    explanation_en: str
    explanation_hi: str
    explanation_ta: str
    
    suggestions: List[str] # Will be converted to JSON in DB
    
    class Config:
        orm_mode = True
        from_attributes = True

class ScoreHistoryOut(ScoreResult):
    id: int
    calculated_at: datetime.datetime
