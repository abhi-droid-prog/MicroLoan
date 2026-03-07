import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Profile from './pages/Profile';
import EligibilityCalculator from './pages/EligibilityCalculator';
import ScoreDashboard from './pages/ScoreDashboard';
import LoanMatcher from './pages/LoanMatcher';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
                <Sidebar />
                <main className="flex-1 lg:ml-64 p-4 lg:p-8 ml-0 transition-all duration-300">
                    <div className="max-w-6xl mx-auto">
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/calculator" element={<ProtectedRoute><EligibilityCalculator /></ProtectedRoute>} />
                            <Route path="/dashboard" element={<ProtectedRoute><ScoreDashboard /></ProtectedRoute>} />
                            <Route path="/loans" element={<ProtectedRoute><LoanMatcher /></ProtectedRoute>} />
                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
}

export default App;
