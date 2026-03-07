from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

import models, schemas
from database import get_db
from routers.users import get_current_user
from llm_service import generate_financial_explanation

router = APIRouter(prefix="/score", tags=["Scoring"])

def calculate_score(data: schemas.ScoreInput):
    # Fraud Risk Check (Very basic mock)
    if data.monthly_expenses + data.emi_amount > data.monthly_income * 1.5:
         raise HTTPException(status_code=400, detail="Fraud Risk: Inputs appear inconsistent. Expenses and EMI exceed 150% of income.")
         
    # 1. Income Stability (40 points)
    # Give points for regular work and higher income thresholds
    income_pts = min(20, (data.monthly_income / 30000) * 20) # max 20 pts for 30k+
    months_pts = min(20, (data.months_consistent_work / 12) * 20) # max 20 pts for 12+ months
    income_score = int(income_pts + months_pts)

    # 2. Expense Ratio (25 points)
    # Lower is better (Expense / Income)
    expense_ratio = data.monthly_expenses / max(1, data.monthly_income)
    if expense_ratio <= 0.3:
        expense_score = 25
    elif expense_ratio <= 0.6:
        expense_score = int(25 - (expense_ratio - 0.3) * (20 / 0.3))
    else:
        expense_score = max(0, int(5 - (expense_ratio - 0.6) * 10))
        
    # 3. EMI Burden (20 points)
    # Lower is better (EMI / Income)
    emi_ratio = data.emi_amount / max(1, data.monthly_income)
    if emi_ratio == 0:
        emi_score = 20
    elif emi_ratio <= 0.2:
        emi_score = 15
    elif emi_ratio <= 0.4:
        emi_score = 10
    elif emi_ratio <= 0.5:
        emi_score = 5
    else:
        emi_score = 0
        
    # 4. Digital Payments (15 points)
    if data.digital_payment_usage.lower() == "high":
        digital_score = 15
    elif data.digital_payment_usage.lower() == "medium":
        digital_score = 8
    else:
        digital_score = 0
        
    total_score = min(100, income_score + expense_score + emi_score + digital_score)
    
    return {
        "total_score": total_score,
        "income_stability_score": income_score,
        "expense_ratio_score": expense_score,
        "emi_burden_score": emi_score,
        "digital_payment_score": digital_score
    }

@router.post("/calculate", response_model=schemas.ScoreResult)
def evaluate_eligibility(data: schemas.ScoreInput, save: bool = True, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Calculates the score and fetches explanations from the LLM.
    If save=True, the result is saved to the DB history.
    """
    scores = calculate_score(data)
    
    # Fetch Explanations & Suggestions via LLM (or mock fallback)
    llm_resp = generate_financial_explanation({**scores, **data.dict()})
    
    result = {
        **scores,
        "explanation_en": llm_resp.get("explanation_en", ""),
        "explanation_hi": llm_resp.get("explanation_hi", ""),
        "explanation_ta": llm_resp.get("explanation_ta", ""),
        "suggestions": llm_resp.get("suggestions", [])
    }
    
    if save:
        db_score = models.ScoreHistory(
            user_id=current_user.id,
            total_score=result["total_score"],
            income_stability_score=result["income_stability_score"],
            expense_ratio_score=result["expense_ratio_score"],
            emi_burden_score=result["emi_burden_score"],
            digital_payment_score=result["digital_payment_score"],
            explanation_en=result["explanation_en"],
            explanation_hi=result["explanation_hi"],
            explanation_ta=result["explanation_ta"],
            suggestions_json=json.dumps(result["suggestions"])
        )
        # Update user's latest financials as well
        current_user.monthly_income = data.monthly_income
        current_user.monthly_expenses = data.monthly_expenses
        current_user.emi_amount = data.emi_amount
        current_user.digital_payment_usage = data.digital_payment_usage
        current_user.months_consistent_work = data.months_consistent_work

        db.add(db_score)
        db.add(current_user)
        db.commit()
    
    return result

@router.post("/simulate", response_model=schemas.ScoreResult)
def simulate_score(data: schemas.ScoreInput):
    """
    For the What-If Simulator: does NOT save to database, just returns instantly.
    Saves LLM call latency by only running rule-based calculation and appending a dummy explanation.
    """
    scores = calculate_score(data)
    
    # Return quick dummy data for slider dragging performance
    return {
        **scores,
        "explanation_en": "Simulated score based on adjusted sliders.",
        "explanation_hi": "समायोजित स्लाइडर्स के आधार पर सिम्युलेटेड स्कोर।",
        "explanation_ta": "சரிசெய்யப்பட்ட ஸ்லைடர்களின் அடிப்படையில் உருவகப்படுத்தப்பட்ட மதிப்பெண்.",
        "suggestions": []
    }
