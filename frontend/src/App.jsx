import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import { LayoutDashboard, AlertTriangle, ShieldCheck, Home } from 'lucide-react';

const App = () => {
    const location = useLocation();
    const isLanding = location.pathname === '/';
    const role = location.pathname.startsWith('/citizen') ? 'citizen' : 'government';

    // Extract base path for links (e.g. /citizen or /government)
    const basePath = `/${role}`;

    if (isLanding) {
        return (
            <Routes>
                <Route path="/" element={<LandingPage />} />
            </Routes>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Dynamic Header based on Role */}
            <nav className={`${role === 'government' ? 'bg-slate-900' : 'bg-gov-blue'} text-white shadow-lg sticky top-0 z-50 transition-colors duration-500`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-3">
                            <Link to="/" className="bg-white p-1.5 rounded-md hover:scale-105 transition-transform">
                                <div className={`${role === 'government' ? 'text-slate-900' : 'text-gov-blue'} font-black text-xs`}>AN</div>
                            </Link>
                            <div>
                                <span className="text-lg font-black tracking-tighter uppercase italic">Aero<span className={role === 'government' ? 'text-blue-400' : 'text-gov-gold'}>Nova</span></span>
                                <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-md text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/10">
                                    {role}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <Link to={basePath} className={`flex items-center space-x-2 text-sm font-bold ${location.pathname === basePath ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                                <LayoutDashboard size={18} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                            <Link to="/" className="text-white/60 hover:text-white transition-colors">
                                <Home size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className={`flex-grow ${role === 'government' ? 'max-w-[1650px]' : 'max-w-7xl'} mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500`}>
                <Routes>
                    <Route path="/citizen" element={<CitizenDashboard />} />
                    <Route path="/government" element={<GovernmentDashboard />} />
                    <Route path="/goverment" element={<GovernmentDashboard />} />
                </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-slate-100 border-t border-slate-200 py-6">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-widest gap-4">
                    <span>&copy; 2026 Ministry of Environment & Forests</span>
                    <div className="flex space-x-6">
                        <span className="flex items-center gap-1"><ShieldCheck size={14} /> Official DSS</span>
                        <span>Version 2.0.0-PRO</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
