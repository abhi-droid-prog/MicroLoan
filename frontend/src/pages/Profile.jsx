import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { CheckCircle2, XCircle, AlertCircle, Save } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [aadhaarInput, setAadhaarInput] = useState('');
    const [panInput, setPanInput] = useState('');
    const [verityMsg, setVerifyMsg] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            setUser(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            // Create copy of user that matches UserProfileUpdate schema
            const { full_name, phone_number, platform_type } = user;
            await api.put('/users/me', { full_name, phone_number, platform_type });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const verifyAadhaar = async () => {
        setVerifyMsg('');
        try {
            await api.post('/users/verify-aadhaar', { aadhaar_number: aadhaarInput });
            setUser({ ...user, aadhaar_number: aadhaarInput, aadhaar_verified: true });
            setAadhaarInput('');
        } catch (err) {
            setVerifyMsg(err.response?.data?.detail || 'Aadhaar verification failed');
        }
    };

    const verifyPan = async () => {
        setVerifyMsg('');
        try {
            await api.post('/users/verify-pan', { pan_number: panInput });
            setUser({ ...user, pan_number: panInput, pan_verified: true });
            setPanInput('');
        } catch (err) {
            setVerifyMsg(err.response?.data?.detail || 'PAN verification failed');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading profile data...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h2>
                <p className="text-slate-500 mt-2">Manage your personal information and identity verification.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Details Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-800">Personal Details</h3>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-6">
                            {message && (
                                <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                                    {message}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.full_name || ''}
                                        onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Email Address (Read Only)</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={user?.email || ''}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                    <input
                                        type="text"
                                        value={user?.phone_number || ''}
                                        onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="+91 "
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Gig Platform Type</label>
                                    <select
                                        value={user?.platform_type || ''}
                                        onChange={(e) => setUser({ ...user, platform_type: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select Platform</option>
                                        <option value="Swiggy">Swiggy</option>
                                        <option value="Zomato">Zomato</option>
                                        <option value="Ola">Ola</option>
                                        <option value="Uber">Uber</option>
                                        <option value="Urban Company">Urban Company</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Identity Verification Panel */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-800">Identity Verification</h3>
                            <p className="text-sm text-slate-500 mt-1">Required for loan matching</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {verityMsg && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{verityMsg}</div>}

                            {/* Aadhaar */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-700">Aadhaar Card</span>
                                    {user?.aadhaar_verified ? (
                                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified</span>
                                    ) : (
                                        <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Pending</span>
                                    )}
                                </div>
                                {user?.aadhaar_verified ? (
                                    <div className="text-slate-500 text-sm font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        XXXX-XXXX-{user.aadhaar_number?.slice(-4) || '1234'}
                                    </div>
                                ) : (
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="12 digit number"
                                            value={aadhaarInput}
                                            onChange={e => setAadhaarInput(e.target.value)}
                                            className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                        />
                                        <button onClick={verifyAadhaar} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">Verify</button>
                                    </div>
                                )}
                            </div>

                            {/* PAN */}
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-700">PAN Card</span>
                                    {user?.pan_verified ? (
                                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified</span>
                                    ) : (
                                        <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Pending</span>
                                    )}
                                </div>
                                {user?.pan_verified ? (
                                    <div className="text-slate-500 text-sm font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        {user.pan_number?.slice(0, 2) || 'AB'}XXXX{user.pan_number?.slice(-1) || 'C'}
                                    </div>
                                ) : (
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="10 digit alphanumeric"
                                            value={panInput}
                                            onChange={e => setPanInput(e.target.value)}
                                            className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-blue-500 outline-none uppercase"
                                        />
                                        <button onClick={verifyPan} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">Verify</button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
