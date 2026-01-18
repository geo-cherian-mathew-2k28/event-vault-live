import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, LogIn, LogOut, LayoutDashboard, Plus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 w-full z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/50 blur-lg rounded-full opacity-0 group-hover:opacity-50 transition-opacity" />
                                <div className="bg-white/10 p-2 rounded-xl border border-white/10 relative z-10 group-hover:scale-110 transition-transform duration-300">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                EventVault
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center space-x-8">
                            <NavLink to="/about" active={isActive('/about')}>About</NavLink>
                            {user ? (
                                <>
                                    <NavLink to="/events" active={isActive('/events')}>Dashboard</NavLink>
                                    <div className="h-6 w-px bg-white/10" />
                                    <Link
                                        to="/events/new"
                                        className="flex items-center gap-2 text-sm font-medium text-primary-light hover:text-white transition-colors group"
                                    >
                                        <div className="bg-primary/20 p-1 rounded-md group-hover:bg-primary transition-colors">
                                            <Plus className="h-3.5 w-3.5" />
                                        </div>
                                        <span>Create</span>
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 p-1 pl-2 pr-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                                    >
                                        {user.user_metadata?.avatar_url ? (
                                            <img
                                                src={user.user_metadata.avatar_url}
                                                alt="Profile"
                                                className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-lg bg-bg-surface"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}

                                        <div
                                            className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold text-white shadow-lg"
                                            style={{ display: user.user_metadata?.avatar_url ? 'none' : 'flex' }}
                                        >
                                            {user.email[0].toUpperCase()}
                                        </div>

                                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="text-slate-500 hover:text-rose-400 transition-colors p-2"
                                        title="Sign Out"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="btn-primary py-2.5 px-5 text-sm">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-bg-surface border-b border-white/10 shadow-2xl z-[99999] animate-fade-in">
                    <div className="px-4 py-6 space-y-4">
                        <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>About Platform</MobileNavLink>
                        {user ? (
                            <>
                                <MobileNavLink to="/profile" onClick={() => setIsOpen(false)}>My Profile</MobileNavLink>
                                <MobileNavLink to="/events" onClick={() => setIsOpen(false)}>Dashboard</MobileNavLink>
                                <MobileNavLink to="/events/new" onClick={() => setIsOpen(false)}>Create New Event</MobileNavLink>
                                <div className="h-px bg-white/10 my-2"></div>
                                <button
                                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                                    className="w-full text-left block px-3 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-white/5 transition-colors"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <MobileNavLink to="/login" onClick={() => setIsOpen(false)}>Log in</MobileNavLink>
                                <MobileNavLink to="/register" onClick={() => setIsOpen(false)} highlight>Get Started</MobileNavLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

function NavLink({ to, children, active }) {
    return (
        <Link
            to={to}
            className={`text-sm font-medium transition-colors duration-200 ${active ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ to, children, onClick, highlight }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`block px-3 py-2 rounded-md text-base font-medium ${highlight
                ? 'bg-primary/20 text-primary border border-primary/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
        >
            {children}
        </Link>
    );
}
