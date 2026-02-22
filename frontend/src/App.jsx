import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import GovernmentLogin from './pages/GovernmentLogin';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { LayoutDashboard, ShieldCheck, Home, LogOut } from 'lucide-react';

const App = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { session, logout } = useAuth();

    // Pages that render their own full-screen layout (no shared nav)
    const standaloneRoutes = ['/government-login', '/unauthorized'];
    const isStandalone = standaloneRoutes.some((r) => location.pathname.startsWith(r));
    const isLanding = location.pathname === '/';

    // Shared nav hides on landing and standalone pages
    if (isLanding) {
        return (
            <Routes>
                <Route path="/" element={<LandingPage />} />
            </Routes>
        );
    }

    if (isStandalone) {
        return (
            <Routes>
                <Route path="/government-login" element={<GovernmentLogin />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Routes>
        );
    }

    const isGov = location.pathname.startsWith('/government');
    const role = isGov ? 'government' : 'citizen';
    const basePath = `/${role}`;

    const handleLogout = () => {
        logout();
        navigate('/government-login', { replace: true });
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* ── Navigation ── */}
            <nav className={`${isGov ? 'bg-slate-900' : 'bg-blue-900'} text-white shadow-lg sticky top-0 z-50`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Brand */}
                        <div className="flex items-center space-x-3">
                            <Link to="/" className="bg-white p-1.5 rounded-md hover:opacity-80 transition-opacity">
                                <div className={`${isGov ? 'text-slate-900' : 'text-blue-900'} font-black text-xs`}>AN</div>
                            </Link>
                            <div>
                                <span className="text-lg font-black tracking-tighter uppercase italic">
                                    Aero<span className={isGov ? 'text-blue-400' : 'text-yellow-300'}>Nova</span>
                                </span>
                                <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-md text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/10">
                                    {role}
                                </span>
                            </div>
                        </div>

                        {/* Nav links */}
                        <div className="flex items-center space-x-4">
                            <Link
                                to={basePath}
                                className={`flex items-center space-x-2 text-sm font-bold ${location.pathname === basePath ? 'text-white' : 'text-white/60 hover:text-white'}`}
                            >
                                <LayoutDashboard size={16} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>

                            <Link to="/" className="text-white/60 hover:text-white transition-colors">
                                <Home size={16} />
                            </Link>

                            {/* Logout — only when authenticated on government routes */}
                            {isGov && session?.token && (
                                <button
                                    onClick={handleLogout}
                                    title="Sign out"
                                    className="flex items-center gap-1.5 text-white/60 hover:text-red-300 text-xs font-black uppercase tracking-widest transition-colors border border-white/10 hover:border-red-400/40 px-3 py-1.5 rounded-lg"
                                >
                                    <LogOut size={14} />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main className={`flex-grow ${isGov ? 'max-w-[1650px]' : 'max-w-7xl'} mx-auto w-full px-4 sm:px-6 lg:px-8 py-8`}>
                <Routes>
                    <Route path="/citizen" element={<CitizenDashboard />} />
                    <Route
                        path="/government"
                        element={
                            <ProtectedRoute requiredRole="government">
                                <GovernmentDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>

            {/* ── Footer ── */}
            <footer className="bg-slate-100 border-t border-slate-200 py-6">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-widest gap-4">
                    <span>&copy; 2026 Ministry of Environment &amp; Forests</span>
                    <div className="flex space-x-6">
                        <span className="flex items-center gap-1">
                            <ShieldCheck size={14} /> Official DSS
                        </span>
                        <span>Version 2.0.0-PRO</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
