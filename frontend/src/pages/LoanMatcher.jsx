import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Briefcase, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

const LOAN_PRODUCTS = [
    {
        provider: 'MUDRA Scheme (Govt)',
        name: 'Shishu Micro-Loan',
        targetScore: 50,
        amount: 'Up to ₹50,000',
        interest: '1% - 1.5% per month',
        tenure: 'Max 5 years',
        description: 'Government backed low-interest loans for micro-enterprises and gig workers. Ideal for purchasing vehicle parts or equipment.',
        features: ['No collateral', 'Low interest rate', 'Flexible repayment'],
        color: 'blue'
    },
    {
        provider: 'KreditBee',
        name: 'Gig Worker Instant Line',
        targetScore: 60,
        amount: '₹1,000 to ₹1 Lakh',
        interest: '1.5% - 2.5% per month',
        tenure: '3 to 12 months',
        description: 'Instant credit line designed specifically for platform workers. Approval based on consistent cash flow.',
        features: ['Instant disbursal', '100% Digital', 'Multiple withdrawals'],
        color: 'indigo'
    },
    {
        provider: 'MoneyTap',
        name: 'Credit Line 2.0',
        targetScore: 75,
        amount: 'Up to ₹5 Lakhs',
        interest: '1.08% per month onwards',
        tenure: '2 to 36 months',
        description: 'Flexible credit line. Pay interest only on the used amount. Best for high-scoring individuals with stable earnings.',
        features: ['Pay for what you use', 'Revolving credit', 'Higher amounts'],
        color: 'emerald'
    }
];

export default function LoanMatcher() {
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/score-history').then(res => {
            if (res.data && res.data.length > 0) {
                setScore(res.data[0].total_score);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Finding your best matches...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 lg:pb-10">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 lg:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="relative z-10 md:w-2/3">
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">Curated Loan Matches</h2>
                    <p className="text-blue-100 text-lg">
                        Based on your eligibility score of <span className="font-black text-2xl text-yellow-300 mx-1">{score}</span>, we've found the best micro-loan products tailored for your gig economy profile.
                    </p>
                </div>
                <div className="relative z-10 mt-6 md:mt-0 flex-shrink-0">
                    <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30 text-center shadow-lg">
                        <ShieldCheck className="w-12 h-12 mx-auto text-yellow-300 mb-2" />
                        <div className="text-sm font-medium text-blue-50">Pre-approved checks</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {LOAN_PRODUCTS.map((loan, idx) => {
                    const isEligible = score >= loan.targetScore;

                    return (
                        <div key={idx} className={`bg-white rounded-2xl border transition-all duration-300 ${isEligible ? 'border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1' : 'border-slate-100 opacity-75 grayscale-[0.5]'}`}>
                            {/* Card Header */}
                            <div className={`p-6 border-b border-slate-100 ${isEligible ? `bg-${loan.color}-50` : 'bg-slate-50'} rounded-t-2xl relative overflow-hidden`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{loan.provider}</span>
                                        <h3 className="text-xl font-bold text-slate-900 mt-1">{loan.name}</h3>
                                    </div>
                                    {!isEligible && (
                                        <div className="bg-slate-200 p-2 rounded-lg text-slate-500"><Lock className="w-4 h-4" /></div>
                                    )}
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-sm text-slate-500 font-medium">Credit Limit</div>
                                        <div className="text-2xl font-black text-slate-900">{loan.amount}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 space-y-6">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {loan.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <div className="text-slate-500 mb-1">Interest</div>
                                        <div className="font-semibold text-slate-900">{loan.interest}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 mb-1">Tenure</div>
                                        <div className="font-semibold text-slate-900">{loan.tenure}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {loan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center text-sm font-medium text-slate-700">
                                            <CheckCircle2 className={`w-4 h-4 mr-3 flex-shrink-0 ${isEligible ? 'text-green-500' : 'text-slate-400'}`} />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="p-6 pt-0">
                                {isEligible ? (
                                    <button className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center space-x-2">
                                        <span>Apply Now</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <div className="w-full py-3 border-2 border-dashed border-slate-200 text-center rounded-xl text-sm font-bold text-slate-400">
                                        Requires Score {loan.targetScore}+
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
