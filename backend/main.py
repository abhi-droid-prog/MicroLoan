from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

import models

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Micro-Loan Eligibility API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Micro-Loan Eligibility API is running!"}
    
# Routers will be included here
from routers import users, scoring

app.include_router(users.router)
app.include_router(scoring.router)
