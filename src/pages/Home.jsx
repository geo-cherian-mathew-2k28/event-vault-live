import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Lock, User, Globe, Command, Zap, Activity, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [eventCode, setEventCode] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleCodeSubmit = (e) => {
        e.preventDefault();
        if (eventCode.trim()) {
            navigate(`/e/${eventCode.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row overflow-hidden selection:bg-primary/30 font-sans">

            {/* LEFT PANEL: PUBLIC ACCESS (THE KINETIC PORTAL) */}
            <div className="relative w-full md:w-1/2 h-[50vh] md:h-screen border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center justify-center p-8 overflow-hidden group">

                {/* KINETIC BACKGROUND */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.15)_0%,transparent_70%)] animate-pulse" />
                    <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-[0.03] rotate-12 pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}
                    />

                    {/* Kinetic Typography "VAULT" overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
                        <span className="text-[40vw] font-black italic uppercase tracking-tighter leading-none group-hover:scale-110 transition-transform duration-1000">Vault</span>
                    </div>
                </div>

                <div className={`relative z-10 w-full max-w-sm transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="flex flex-col items-center text-center">
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">
                            Access <span className="text-primary">Vault</span>
                        </h1>
                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-12">Authorized Decryption Protocol</p>

                        <form onSubmit={handleCodeSubmit} className="w-full space-y-4">
                            <div className="relative group/input">
                                <input
                                    type="text"
                                    placeholder="VAULT CODE"
                                    className="w-full h-20 bg-white/[0.03] border border-white/10 rounded-2xl px-8 font-mono text-3xl text-primary font-black uppercase tracking-[0.6em] focus:border-primary/50 outline-none transition-all placeholder:text-white/5 text-center"
                                    value={eventCode}
                                    onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                />
                                <div className="absolute inset-0 rounded-2xl border border-primary/0 group-focus-within/input:border-primary/20 transition-all -z-10 blur-xl" />
                            </div>
                            <button
                                type="submit"
                                disabled={eventCode.length < 4}
                                className="w-full h-16 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 transition-all shadow-2xl shadow-primary/20 group/btn"
                            >
                                Establish Link <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: MANAGEMENT (THE COMMAND CENTER) */}
            <div className="relative w-full md:w-1/2 h-[50vh] md:h-screen flex flex-col items-center justify-center p-8 bg-[#020202] group">

                <div className={`relative z-10 w-full max-w-sm transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="flex flex-col items-center text-center">
                        <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                            <Command className="h-7 w-7 text-white/40" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
                            Infrastructure
                        </h2>
                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-12">Command & Archival Unit</p>

                        <div className="w-full flex flex-col gap-4">
                            {user ? (
                                <Link to="/events" className="w-full h-20 bg-white/[0.03] border border-white/10 text-white rounded-2xl flex items-center justify-between px-8 hover:bg-white/[0.06] hover:border-white/20 transition-all group/dash">
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Authenticated</div>
                                        <div className="text-sm font-black uppercase italic tracking-tighter">Open Command Center</div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-white/20 group-hover/dash:text-primary transition-all" />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="w-full h-16 bg-white/[0.03] border border-white/10 text-white rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all shadow-xl">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="w-full h-16 bg-white text-black rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-2xl">
                                        Initialize Vault
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER ELEMENTS */}
                <div className="absolute bottom-12 inset-x-0 flex flex-col items-center gap-8 px-8">
                    <div className="h-px w-24 bg-white/5" />

                    {/* PORTFOLIO LINK */}
                    <a
                        href="https://geo-cherian-mathew-2k28.github.io/geo-portfolio/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5 text-[9px] font-black uppercase tracking-[0.5em] text-white/30 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                    >
                        <ExternalLink className="h-3.5 w-3.5" /> Engineer Signature // Geo Cherian Mathew
                    </a>

                    <div className="flex gap-8 text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">
                        <Link to="/about" className="hover:text-white transition-colors">Manifesto</Link>
                        <span>© 2026 // Memora</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
