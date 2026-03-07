import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Settings, ArrowRight } from 'lucide-react';

export default function EligibilityCalculator() {
    const [formData, setFormData] = useState({
        monthly_income: 0,
        monthly_expenses: 0,
        emi_amount: 0,
        digital_payment_usage: 'Medium',
        months_consistent_work: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Pre-fill if user has data
        api.get('/users/me').then(res => {
            const { monthly_income, monthly_expenses, emi_amount, digital_payment_usage, months_consistent_work } = res.data;
            if (monthly_income > 0) {
                setFormData({
                    monthly_income,
                    monthly_expenses,
                    emi_amount,
                    digital_payment_usage: digital_payment_usage || 'Medium',
                    months_consistent_work: months_consistent_work || 0
                });
            }
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'digital_payment_usage' ? value : Number(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/score/calculate', formData);
            navigate('/dashboard'); // Go to results dashboard
        } catch (err) {
            setError(err.response?.data?.detail || 'Calculation failed. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Calculate Eligibility</h2>
                <p className="text-slate-500 mt-2">Enter your financial details to generate your micro-loan eligibility score.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Settings className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Financial Inputs</h3>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">Average Monthly Income (₹)</label>
                            <input
                                type="number"
                                name="monthly_income"
                                required
                                min="0"
                                value={formData.monthly_income || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 text-lg rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="25000"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">Estimated Monthly Expenses (₹)</label>
                            <input
                                type="number"
                                name="monthly_expenses"
                                required
                                min="0"
                                value={formData.monthly_expenses || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 text-lg rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="10000"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">Current Monthly EMIs (₹)</label>
                            <input
                                type="number"
                                name="emi_amount"
                                required
                                min="0"
                                value={formData.emi_amount || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 text-lg rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">Months of Consistent Gig Work</label>
                            <input
                                type="number"
                                name="months_consistent_work"
                                required
                                min="0"
                                value={formData.months_consistent_work || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 text-lg rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="6"
                            />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Digital Payment Usage (UPI/Bank Transfers)</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['Low', 'Medium', 'High'].map((level) => (
                                    <button
                                        type="button"
                                        key={level}
                                        onClick={() => setFormData({ ...formData, digital_payment_usage: level })}
                                        className={`py-3 rounded-xl border-2 font-medium transition-all ${formData.digital_payment_usage === level
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 flex items-center space-x-2"
                        >
                            <span>{loading ? 'Analyzing Profile...' : 'Generate Score'}</span>
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
