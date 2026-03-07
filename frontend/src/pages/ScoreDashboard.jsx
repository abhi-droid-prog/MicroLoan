import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function ScoreDashboard() {
    const [scoreData, setScoreData] = useState(null);
    const [userInputs, setUserInputs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState('en'); // 'en', 'hi', 'ta'
    const navigate = useNavigate();

    // What-if simulator states
    const [simExpenses, setSimExpenses] = useState(0);
    const [simEmi, setSimEmi] = useState(0);
    const [simMode, setSimMode] = useState(false);
    const [simScoreData, setSimScoreData] = useState(null);
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const historyRes = await api.get('/users/score-history');
            const userRes = await api.get('/users/me');

            const userData = userRes.data;
            setUserInputs({
                monthly_income: userData.monthly_income,
                monthly_expenses: userData.monthly_expenses,
                emi_amount: userData.emi_amount,
                digital_payment_usage: userData.digital_payment_usage,
                months_consistent_work: userData.months_consistent_work,
            });

            setSimExpenses(userData.monthly_expenses || 0);
            setSimEmi(userData.emi_amount || 0);

            if (historyRes.data && historyRes.data.length > 0) {
                setScoreData(historyRes.data[0]); // Latest score
                setSimScoreData(historyRes.data[0]);
            } else {
                navigate('/calculator');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const runSimulation = async (expenses, emi) => {
        setSimulating(true);
        try {
            const payload = { ...userInputs, monthly_expenses: expenses, emi_amount: emi };
            const res = await api.post('/score/simulate', payload);
            setSimScoreData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setSimulating(false);
        }
    };

    const handleSimExpenses = (e) => {
        const val = Number(e.target.value);
        setSimExpenses(val);
        setSimMode(true);
        runSimulation(val, simEmi);
    };

    const handleSimEmi = (e) => {
        const val = Number(e.target.value);
        setSimEmi(val);
        setSimMode(true);
        runSimulation(simExpenses, val);
    };

    if (loading) return <div className="p-8 text-center">Loading your personalized dashboard...</div>;
    if (!scoreData) return null;

    const currentView = simMode ? simScoreData : scoreData;
    const score = currentView.total_score;

    // Determine color based on score
    let scoreColor = 'text-red-500';
    let gaugeColor = '#ef4444';
    if (score >= 80) { scoreColor = 'text-green-500'; gaugeColor = '#10b981'; }
    else if (score >= 50) { scoreColor = 'text-yellow-500'; gaugeColor = '#f59e0b'; }

    const pieData = [
        { name: 'Income Stability', value: currentView.income_stability_score },
        { name: 'Expense Ratio', value: currentView.expense_ratio_score },
        { name: 'EMI Burden', value: currentView.emi_burden_score },
        { name: 'Digital Payments', value: currentView.digital_payment_score },
    ];

    const financialData = [
        { name: 'Income', amount: userInputs.monthly_income },
        { name: 'Expenses', amount: simExpenses },
        { name: 'EMI', amount: simEmi },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header & Language Toggle */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Your Eligibility Hub</h2>
                    <p className="text-slate-500 mt-1">See your score breakdown and AI-driven insights.</p>
                </div>
                <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                    {[{ id: 'en', label: 'English' }, { id: 'hi', label: 'हिंदी' }, { id: 'ta', label: 'தமிழ்' }].map(l => (
                        <button
                            key={l.id}
                            onClick={() => setLang(l.id)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${lang === l.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Score Gauge */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1" style={{ backgroundColor: gaugeColor }}></div>
                    <h3 className="text-slate-500 font-semibold mb-6">Total Eligibility Score</h3>

                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {/* Simple CSS Circular indicator */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" strokeWidth="12" stroke="#f1f5f9" fill="none" />
                            <circle
                                cx="96" cy="96" r="88"
                                strokeWidth="12"
                                stroke={gaugeColor}
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${(score / 100) * 553} 553`}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-6xl font-black ${scoreColor}`}>{score}</span>
                            <span className="text-slate-400 font-medium text-sm mt-1">/ 100</span>
                        </div>
                    </div>

                    <div className={`mt-6 inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${score >= 80 ? 'bg-green-50 text-green-700' : score >= 50 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {score >= 80 ? 'High Eligibility' : score >= 50 ? 'Moderate Eligibility' : 'Low Eligibility'}
                    </div>
                </div>

                {/* AI Explanation & Factors */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                        <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-blue-500 opacity-10" />
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="p-2 bg-blue-600 rounded-lg text-white"><Sparkles className="w-4 h-4" /></div>
                            <h3 className="font-bold text-slate-900 text-lg">AI Financial Coach</h3>
                        </div>
                        <p className="text-slate-700 text-lg leading-relaxed mix-blend-multiply">
                            {currentView[`explanation_${lang}`]}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                                Score Breakdown
                            </h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                {pieData.map((d, i) => (
                                    <div key={d.name} className="flex items-center"><div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }}></div>{d.name}</div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-blue-500" /> Cash Flow vs EMI</h3>
                            <div className="flex-1 h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={financialData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Row: What-If Simulator & Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Simulator */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center"><Calculator className="w-5 h-5 mr-2 text-indigo-500" /> What-If Simulator</h3>
                        {simulating && <span className="text-xs text-blue-500 font-medium animate-pulse">Calculating...</span>}
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <label className="font-semibold text-slate-700">Adjust Monthly Expenses</label>
                                <span className="font-bold text-slate-900">₹{simExpenses}</span>
                            </div>
                            <input
                                type="range" min="0" max={userInputs.monthly_income * 1.5} step="500"
                                value={simExpenses} onChange={handleSimExpenses}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <label className="font-semibold text-slate-700">Adjust EMI Payments</label>
                                <span className="font-bold text-slate-900">₹{simEmi}</span>
                            </div>
                            <input
                                type="range" min="0" max={userInputs.monthly_income} step="500"
                                value={simEmi} onChange={handleSimEmi}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {simMode && (
                            <div className="p-4 bg-indigo-50 text-indigo-800 rounded-xl text-sm flex items-start mt-4">
                                <Lightbulb className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <p>By adjusting these values, your potential score goes {simScoreData.total_score >= scoreData.total_score ? 'up' : 'down'} to <strong className="text-lg mx-1">{simScoreData.total_score}</strong>. See if you can reach a score of 80 to unlock better loan matches!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actionable Suggestions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 flex items-center mb-6"><TrendingUp className="w-5 h-5 mr-2 text-green-500" /> Recommendations to Improve</h3>

                    <div className="space-y-4">
                        {scoreData.suggestions && scoreData.suggestions.length > 0 ? (
                            scoreData.suggestions.map((sug, i) => (
                                <div key={i} className="flex p-4 rounded-xl border border-slate-100 bg-slate-50">
                                    <div className="bg-green-100 text-green-600 p-1.5 rounded-full h-fit mr-3">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <p className="text-sm text-slate-700 font-medium">{sug}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-500 text-sm">No suggestions available at this time.</div>
                        )}

                        {simMode && (
                            <button onClick={() => navigate('/loans')} className="w-full mt-4 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 mt-6">
                                View Loan Matches
                            </button>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}

// Quick icons missing import fix
import { Calculator, CheckCircle2 } from 'lucide-react';
