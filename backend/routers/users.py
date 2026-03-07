from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import json
import jwt

import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except jwt.InvalidTokenError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"email": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserOut)
def update_user_profile(profile_data: schemas.UserProfileUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user_data = profile_data.dict(exclude_unset=True)
    for key, value in user_data.items():
        setattr(current_user, key, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/verify-aadhaar")
def verify_aadhaar(data: schemas.AadhaarVerify, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if len(data.aadhaar_number) != 12 or not data.aadhaar_number.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Aadhaar format")
    
    current_user.aadhaar_number = data.aadhaar_number
    current_user.aadhaar_verified = True # MOCK verification
    
    db.add(current_user)
    db.commit()
    return {"status": "success", "message": "Aadhaar verified successfully"}

@router.post("/verify-pan")
def verify_pan(data: schemas.PanVerify, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if len(data.pan_number) != 10:
        raise HTTPException(status_code=400, detail="Invalid PAN format")
        
    current_user.pan_number = data.pan_number.upper()
    current_user.pan_verified = True # MOCK verification
    
    db.add(current_user)
    db.commit()
    return {"status": "success", "message": "PAN verified successfully"}

@router.get("/score-history", response_model=List[schemas.ScoreHistoryOut])
def get_score_history(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    scores = db.query(models.ScoreHistory).filter(models.ScoreHistory.user_id == current_user.id).order_by(models.ScoreHistory.calculated_at.desc()).all()
    
    # Needs to parse JSON suggestions back out for Pydantic
    results = []
    for s in scores:
        s_dict = {
            "id": s.id,
            "calculated_at": s.calculated_at,
            "total_score": s.total_score,
            "income_stability_score": s.income_stability_score,
            "expense_ratio_score": s.expense_ratio_score,
            "emi_burden_score": s.emi_burden_score,
            "digital_payment_score": s.digital_payment_score,
            "explanation_en": s.explanation_en,
            "explanation_hi": s.explanation_hi,
            "explanation_ta": s.explanation_ta,
            "suggestions": json.loads(s.suggestions_json) if s.suggestions_json else []
        }
        results.append(schemas.ScoreHistoryOut(**s_dict))
    
    return results
