import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ViolationUpload from './components/ViolationUpload';
import { LayoutDashboard, AlertTriangle, Menu, X } from 'lucide-react';

const App = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Report Violation', path: '/report', icon: AlertTriangle },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <nav className="bg-gov-blue text-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white p-1.5 rounded-md">
                                <div className="w-6 h-6 bg-gov-blue rounded-sm flex items-center justify-center font-bold text-xs">EG</div>
                            </div>
                            <span className="text-xl font-bold tracking-tight">EcoGuard AI</span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${location.pathname === link.path ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800'
                                        }`}
                                >
                                    <link.icon size={18} />
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-blue-100 hover:text-white focus:outline-none"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden bg-blue-900 px-2 pt-2 pb-3 space-y-1 border-t border-blue-800">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md ${location.pathname === link.path ? 'bg-blue-800 text-white' : 'text-blue-100'
                                    }`}
                            >
                                <link.icon size={18} />
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/report" element={<div className="max-w-2xl mx-auto"><ViolationUpload /></div>} />
                </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-slate-100 border-t border-slate-200 py-6">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
                    &copy; 2026 Ministry of Environment & Forests. EcoGuard AI Decision Support System.
                </div>
            </footer>
        </div>
    );
};

export default App;
