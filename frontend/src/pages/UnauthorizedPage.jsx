import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

const UnauthorizedPage = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden text-center">
            <div className="bg-red-700 px-6 py-5 flex items-center justify-center gap-3">
                <ShieldOff size={20} className="text-white" />
                <h1 className="text-white font-black text-sm uppercase tracking-widest">
                    Access Denied
                </h1>
            </div>
            <div className="px-6 py-10">
                <p className="text-slate-600 text-sm font-bold mb-1 uppercase tracking-widest">401 — Unauthorized</p>
                <p className="text-slate-500 text-xs mb-8 leading-relaxed">
                    Your credentials do not permit access to this section.<br />
                    This incident has been logged.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-slate-900 text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
            <p className="text-[9px] text-slate-400 pb-4 font-medium">
                Unauthorized access is monitored and logged.
            </p>
        </div>
    </div>
);

export default UnauthorizedPage;
