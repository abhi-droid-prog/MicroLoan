@echo off
set "PATH=%PATH%;C:\Program Files\nodejs\"
echo Starting Micro-Loan Explainer Frontend...
cd frontend
call npm install
call npm run dev
pause
