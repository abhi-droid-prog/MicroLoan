import os
import json
from google.generativeai import configure, GenerativeModel
import openai

# Check for API keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if GEMINI_API_KEY:
    configure(api_key=GEMINI_API_KEY)
elif OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

def generate_financial_explanation(score_data: dict) -> dict:
    """
    Given the score breakdown, generates simple explanations in EN, HI, TA
    and provides actionable suggestions.
    Falls back to mock data if no API key is present.
    """
    has_api_key = bool(GEMINI_API_KEY or OPENAI_API_KEY)
    
    if not has_api_key:
        return get_mock_explanation(score_data)
        
    prompt = build_prompt(score_data)
    
    try:
        if GEMINI_API_KEY:
            model = GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return parse_llm_response(response.text)
        elif OPENAI_API_KEY:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            return parse_llm_response(response.choices[0].message.content)
    except Exception as e:
        print(f"LLM Error: {e}")
        return get_mock_explanation(score_data) # Fallback on error


def build_prompt(data: dict) -> str:
    return f"""
    You are a financial advisor for gig workers in India (Swiggy, Ola, etc).
    The user has a loan eligibility score of {data['total_score']}/100.
    
    Score breakdown:
    - Income Stability: {data['income_stability_score']}/40 (Months worked: {data['months_consistent_work']}, Income: ₹{data['monthly_income']})
    - Expense Ratio: {data['expense_ratio_score']}/25 (Expenses: ₹{data['monthly_expenses']})
    - EMI Burden: {data['emi_burden_score']}/20 (EMI: ₹{data['emi_amount']})
    - Digital Payments: {data['digital_payment_score']}/15 (Usage: {data['digital_payment_usage']})
    
    Please provide:
    1. A short, very simple explanation (Class 8 reading level) of why they got this score and what it means for getting a loan.
    2. Translate this exact explanation into Hindi.
    3. Translate this exact explanation into Tamil.
    4. Provide 3-4 short, actionable suggestions to improve their score.
    
    Format the response STRICTLY as valid JSON with these keys:
    "explanation_en", "explanation_hi", "explanation_ta", "suggestions" (array of strings)
    """

def parse_llm_response(text: str) -> dict:
    try:
        # Strip markdown code blocks if present
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        return json.loads(text.strip())
    except:
        return get_mock_explanation({"total_score": 0})

def get_mock_explanation(data: dict) -> dict:
    total = data.get('total_score', 50)
    
    if total >= 80:
        en = "Your financial profile is strong. Stable income and low EMIs make you highly eligible for good loan offers."
        hi = "आपकी वित्तीय प्रोफ़ाइल मजबूत है। स्थिर आय और कम EMI आपको अच्छे ऋण प्रस्तावों के लिए अत्यधिक योग्य बनाते हैं।"
        ta = "உங்கள் நிதி சுயவிவரம் வலுவாக உள்ளது. நிலையான வருமானம் மற்றும் குறைந்த ஈஎம்ஐ உங்களை நல்ல கடன் சலுகைகளுக்கு மிகவும் தகுதியுடையதாக்குகிறது."
        sugg = ["Maintain your current financial habits", "Check out MUDRA loan options for business expansion"]
    elif total >= 50:
        en = "Your score is moderate. You have stable income but your expenses or EMI might be affecting your eligibility."
        hi = "आपका स्कोर मध्यम है। आपकी आय स्थिर है लेकिन आपके खर्च या ईएमआई आपकी पात्रता को प्रभावित कर सकते हैं।"
        ta = "உங்கள் மதிப்பெண் மிதமானது. உங்களுக்கு நிலையான வருமானம் உள்ளது, ஆனால் உங்கள் செலவுகள் அல்லது ஈஎம்ஐ உங்கள் தகுதியை பாதிக்கலாம்."
        sugg = ["Try to reduce your monthly expenses", "Avoid taking any new EMIs", "Keep using digital payments consistently"]
    else:
        en = "Your eligibility is currently low. High EMIs compared to your income or irregular work history is reducing your score."
        hi = "आपकी पात्रता वर्तमान में कम है। आपकी आय की तुलना में उच्च ईएमआई या अनियमित कार्य इतिहास आपके स्कोर को कम कर रहा है।"
        ta = "உங்கள் தகுதி தற்போது குறைவு. உங்கள் வருமானத்துடன் ஒப்பிடும்போது அதிக ஈஎம்ஐகள் அல்லது ஒழுங்கற்ற வேலை வரலாறு உங்கள் மதிப்பெண்ணைக் குறைக்கிறது."
        sugg = ["Focus on clearing existing EMIs", "Try to maintain consistent gig work for 6+ months", "Increase usage of UPI/Digital payments to build a trail"]
        
    return {
        "explanation_en": en,
        "explanation_hi": hi,
        "explanation_ta": ta,
        "suggestions": sugg
    }
