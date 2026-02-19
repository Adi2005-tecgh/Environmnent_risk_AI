import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Leaf, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gov-blue via-gov-gold to-gov-blue"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>

            <div className="max-w-4xl w-full text-center z-10">
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-3xl shadow-xl shadow-blue-900/10 border border-slate-100">
                        <Leaf className="text-gov-blue" size={48} />
                    </div>
                </div>

                <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4 italic">
                    Aero<span className="text-gov-blue">Nova</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                    Advanced Environmental Intelligence & Decision Support Platform.
                    Real-time AQI monitoring, predictive modeling, and citizen awareness.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Citizen Option */}
                    <button
                        onClick={() => navigate('/citizen')}
                        className="group relative bg-white p-8 rounded-3xl shadow-xl border border-slate-200 hover:border-gov-blue transition-all duration-300 transform hover:-translate-y-2 text-left"
                    >
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <Users size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Citizen Portal</h3>
                        <p className="text-slate-500 text-sm mb-6">Access public air quality data, health advisories, and report environmental violations.</p>
                        <div className="flex items-center text-gov-blue font-bold text-sm uppercase tracking-widest">
                            Continue as Citizen <ArrowRight className="ml-2" size={16} />
                        </div>
                    </button>

                    {/* Government Option */}
                    <button
                        onClick={() => navigate('/government')}
                        className="group relative bg-white p-8 rounded-3xl shadow-xl border border-slate-200 hover:border-gov-blue transition-all duration-300 transform hover:-translate-y-2 text-left"
                    >
                        <div className="bg-blue-50 text-gov-blue p-3 rounded-2xl w-fit mb-6 group-hover:bg-gov-blue group-hover:text-white transition-colors">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Authority Hub</h3>
                        <p className="text-slate-500 text-sm mb-6">Decision-grade intelligence, cluster analysis, and system-wide monitoring tools.</p>
                        <div className="flex items-center text-gov-blue font-bold text-sm uppercase tracking-widest">
                            Government Login <ArrowRight className="ml-2" size={16} />
                        </div>
                    </button>
                </div>

                <div className="mt-16 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Authorized Access Only • Ministry of Environment & Forests
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
