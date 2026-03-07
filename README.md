# Micro-Loan Eligibility Explainer for Gig Workers

A full-stack fintech web application designed for gig workers (delivery, ride-sharing, freelance) to understand their loan eligibility using alternative data like digital payments and platform income. 

## Hackathon Features
- **Modern Fintech Dashboard:** Tailwind CSS, responsive design, interactive charts (Recharts).
- **Rule-based & AI Scoring:** Real-time 100-point algorithm evaluating Income Stability, Expense Ratio, EMI Burden, and Digital Payments.
- **Multilingual AI Explainer:** Integrates LLM (Gemini/OpenAI) with local mocked fallback for generating Class-8 reading level explanations in English, Hindi, and Tamil.
- **What-If Simulator:** Sliders to adjust expenses and EMIs, recalculating scores dynamically.
- **Micro-Loan Matcher:** Recommends targeted loans (like MUDRA or KreditBee) based on eligibility score.

## Folder Structure
```
micro-loan-explainer/
├── backend/                  # FastAPI Python Backend
│   ├── database.py           # SQLite connection
│   ├── models.py             # SQLAlchemy models
│   ├── schemas.py            # Pydantic validation
│   ├── auth.py               # JWT and Bcrypt
│   ├── llm_service.py        # OpenAI/Gemini wrapper & Mock fallback
│   ├── main.py               # API Entry point
│   ├── routers/              # API Endpoints (users, scoring)
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + Vite Frontend
│   ├── index.html            # HTML Entry point
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Styling config
│   └── src/
│       ├── main.jsx          # React app mount
│       ├── App.jsx           # React Router
│       ├── index.css         # Global styles
│       ├── lib/api.js        # Axios configuration
│       ├── components/       # Sidebar
│       └── pages/            # Login, Profile, EligibilityCalculator, ScoreDashboard, LoanMatcher
└── README.md
```

## How to Run Locally

### Prerequisites
1. **Python 3.9+**
2. **Node.js 18+**

### 1. Start the Backend
Open a terminal and run:
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The API will run at `http://localhost:8000`. 
*(Optional)* Create a `.env` file in the `backend` folder and add `GEMINI_API_KEY=your_key` or `OPENAI_API_KEY=your_key` for real AI responses. If omitted, the app securely falls back to high-quality mock explanations for hackathon safety!

### 2. Start the Frontend
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
The React app will run at `http://localhost:5173`. 
Open your browser and sign up as a new gig worker!

## Deployment Instructions

**Backend (Render / Railway / Heroku):**
1. Create a PostgreSQL database and update `database.py` DB URL.
2. Deploy the `backend` folder using a Python ASGI environment.
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Update `frontend/src/lib/api.js` to point to your deployed backend URL instead of localhost.

**Frontend (Vercel / Netlify):**
1. Connect your GitHub repository to Vercel.
2. Set Root Directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
