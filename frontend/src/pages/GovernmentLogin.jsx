import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const GovernmentLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);

    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/government';

    // Clear any existing session every time this page loads.
    // This ensures that clicking "Government" from the Landing Page
    // always prompts for fresh credentials, even if the user was logged in.
    useEffect(() => {
        localStorage.removeItem('gov_session');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email.trim(), password);
        if (result.ok && result.role === 'government') {
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* ── Card ── */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">

                    {/* Top stripe */}
                    <div className="bg-slate-900 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-700 rounded-lg p-2">
                                <Shield size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-white font-black text-sm uppercase tracking-widest leading-none">
                                    AeroNova Government Access
                                </h1>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                    Secure Environmental Intelligence System
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form body */}
                    <div className="px-6 py-8">
                        <div className="mb-6">
                            <h2 className="text-slate-900 text-lg font-black uppercase tracking-tight">
                                Government Portal
                            </h2>
                            <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">
                                Authorized Personnel Only
                            </p>
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                <p className="text-red-700 text-xs font-bold leading-snug">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                            {/* Email */}
                            <div>
                                <label htmlFor="gov-email" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                    Official Email Address
                                </label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="gov-email"
                                        type="email"
                                        required
                                        autoComplete="off"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="officer@mef.gov.in"
                                        className="w-full pl-9 pr-4 py-2.5 text-sm text-slate-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="gov-password" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="gov-password"
                                        type={showPwd ? 'text' : 'password'}
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-10 py-2.5 text-sm text-slate-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-300 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        tabIndex={-1}
                                    >
                                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-black text-xs uppercase tracking-widest py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Authenticating…
                                    </>
                                ) : (
                                    <>
                                        <Lock size={13} />
                                        Authenticate &amp; Enter
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Security notice */}
                        <p className="mt-6 text-[9px] text-slate-400 text-center font-medium leading-snug">
                            Unauthorized access to this system is monitored and logged.<br />
                            All sessions are subject to audit under applicable law.
                        </p>
                    </div>
                </div>

                {/* Credentials hint (remove in production) */}
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1">⚠ Demo Credentials</p>
                    <p className="text-[10px] text-amber-800 font-mono">admin@aeronova.gov.in / Gov@12345</p>
                    <p className="text-[10px] text-amber-800 font-mono">officer@mef.gov.in / Officer@2026</p>
                </div>
            </div>
        </div>
    );
};

export default GovernmentLogin;
