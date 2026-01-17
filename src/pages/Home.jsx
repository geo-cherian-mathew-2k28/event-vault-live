import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Search, Disc, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [eventCode, setEventCode] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleCodeSubmit = (e) => {
        e.preventDefault();
        if (eventCode.trim()) {
            navigate(`/e/${eventCode.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-bg-base flex flex-col pt-16">

            {/* Hero / Main Action Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 animate-fade-in">

                <div className="w-full max-w-2xl text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-surface border border-border-subtle mb-8">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                        <span className="text-xs font-medium text-text-secondary">System Operational</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-text-primary tracking-tight mb-6">
                        EventVault
                    </h1>
                    <p className="text-xl text-text-secondary font-light max-w-lg mx-auto leading-relaxed">
                        Professional access portal for secure event media.
                        Enter your credentials to proceed.
                    </p>
                </div>

                {/* Primary Action Card */}
                <div className="w-full max-w-md">
                    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-2 shadow-card hover:border-border-highlight transition-colors duration-300">
                        <form onSubmit={handleCodeSubmit} className="relative flex items-center">
                            <Search className="absolute left-4 h-5 w-5 text-text-tertiary" />
                            <input
                                type="text"
                                placeholder="Enter 6-digit Event Code"
                                className="w-full bg-transparent text-lg text-text-primary placeholder-text-tertiary px-12 py-4 outline-none font-mono uppercase tracking-widest"
                                value={eventCode}
                                onChange={(e) => setEventCode(e.target.value)}
                                maxLength={6}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!eventCode}
                                className="absolute right-2 bg-brand text-bg-base p-2.5 rounded-lg hover:bg-brand-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 flex justify-center gap-6">
                        {user ? (
                            <Link to="/events" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" /> Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    Admin Login
                                </Link>
                                <span className="text-border-subtle">|</span>
                                <Link to="/register" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    Create Account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Status */}
            <div className="py-8 text-center bg-bg-base/50 backdrop-blur-sm border-t border-border-subtle flex flex-col items-center gap-4">
                {/* Developer Credit */}
                <p className="text-xs text-text-tertiary">SECURE INFRASTRUCTURE • END-TO-END ACCESS CONTROL</p>
            </div>
        </div>
    );
}
