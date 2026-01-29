import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Shield, Zap, Lock,
    Globe, HardDrive, Share2, ChevronRight,
    Command, Box, Activity, Sparkles,
    ShieldCheck, Database, Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [eventCode, setEventCode] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleCodeSubmit = (e) => {
        e.preventDefault();
        if (eventCode.trim()) {
            navigate(`/e/${eventCode.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-primary/30 font-sans antialiased overflow-x-hidden">

            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)]" />

                {/* CSS Noise Fallback (No external URL) */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />
            </div>

            <main className="relative z-10 pt-28 md:pt-48 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center">

                {/* HERO SECTION */}
                <div className="text-center mb-20 md:mb-32 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-10 backdrop-blur-xl shadow-lg"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Infrastructure Live</span>
                    </motion.div>

                    <h1 className="text-[14vw] md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.8] mb-12 uppercase italic">
                        Vault <span className="text-primary">Live</span>
                    </h1>

                    <p className="text-lg md:text-2xl font-semibold max-w-2xl mx-auto leading-tight text-white/40 mb-16 px-4">
                        The world's most high-fidelity platform for <br className="hidden md:block" />
                        <span className="text-white italic">private media archival.</span>
                    </p>
                </div>

                {/* THE PORTAL */}
                <div className="w-full max-w-2xl mx-auto mb-48 px-2 md:px-0">
                    <div className="relative group">
                        <div className={`absolute -inset-4 bg-primary/10 blur-[60px] rounded-[3rem] transition-opacity duration-1000 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/[0.02] border border-white/10 p-2 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden"
                        >
                            <div className="bg-[#050505] rounded-[3.3rem] p-8 md:p-14 border border-white/5">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Lock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Authorized Access</div>
                                            <div className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Encrypted Link</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 opacity-20 grayscale">
                                        <div className="h-1.5 w-6 bg-white rounded-full" />
                                        <div className="h-1.5 w-1.5 bg-white rounded-full" />
                                        <div className="h-1.5 w-1.5 bg-white rounded-full" />
                                    </div>
                                </div>

                                <form onSubmit={handleCodeSubmit} className="flex flex-col gap-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="ENTER VAULT CODE"
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                            className="w-full h-20 md:h-24 bg-white/5 border border-white/10 rounded-3xl px-10 font-mono text-3xl md:text-4xl text-primary font-black uppercase tracking-[0.5em] focus:border-primary/50 outline-none transition-all placeholder:text-white/5 text-center md:text-left"
                                            value={eventCode}
                                            onChange={(e) => setEventCode(e.target.value)}
                                            maxLength={6}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={eventCode.length < 4}
                                        className="h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center gap-4 font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-0 transition-all shadow-2xl shadow-primary/40"
                                    >
                                        Establish Link <ArrowRight className="h-5 w-5" />
                                    </button>
                                </form>

                                <div className="mt-12 pt-10 border-t border-white/5 flex flex-wrap gap-4">
                                    {user ? (
                                        <Link to="/events" className="flex-1 h-16 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">
                                            Open Dashboard <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <>
                                            <Link to="/login" className="flex-1 h-16 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">
                                                Sign In
                                            </Link>
                                            <Link to="/register" className="flex-1 h-16 bg-white text-black rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all">
                                                Create Vault
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* BENTO GRID */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
                    <HomeBento
                        className="md:col-span-8 h-[300px]"
                        icon={<ShieldCheck className="text-primary" />}
                        title="Isolation Stack"
                        desc="Native Row Level Security (RLS) handles data isolation at the core database level, ensuring assets remain private."
                    />
                    <HomeBento
                        className="md:col-span-4 h-[300px]"
                        icon={<Zap className="text-amber-500" />}
                        title="Edge Speed"
                        desc="Optimized global retrieval."
                    />
                    <HomeBento
                        className="md:col-span-4 h-[300px]"
                        icon={<HardDrive className="text-blue-500" />}
                        title="Raw Fidelity"
                        desc="Zero compression policy."
                    />
                    <HomeBento
                        className="md:col-span-8 h-[300px]"
                        icon={<Fingerprint className="text-emerald-500" />}
                        title="Signature Encryption"
                        desc="Cryptographically signed links and session-based tokens provide a secure perimeter for your memories."
                    />
                </div>

            </main>

            {/* FOOTER */}
            <footer className="py-20 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] font-black text-white/20 uppercase tracking-[0.6em] italic">
                    <div className="flex gap-10">
                        <Link to="/about" className="hover:text-primary transition-colors">Architecture</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Engineering</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Venture</Link>
                    </div>
                    <span>© 2026 Memora Infrastructure</span>
                </div>
            </footer>
        </div>
    );
}

function HomeBento({ className, icon, title, desc }) {
    return (
        <div className={`p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all group flex flex-col justify-between overflow-hidden relative ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                    {React.cloneElement(icon, { size: 24, strokeWidth: 1.5 })}
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">{title}</h3>
                <p className="text-sm font-bold text-white/30 uppercase tracking-tight leading-relaxed max-w-sm">{desc}</p>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                {React.cloneElement(icon, { size: 160, strokeWidth: 0.5 })}
            </div>
        </div>
    );
}
