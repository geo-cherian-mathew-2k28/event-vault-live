import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, Command, Zap, Activity, ExternalLink, Box } from 'lucide-react';
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
        <div className="min-h-screen bg-[#020202] text-white selection:bg-primary/30 font-sans antialiased overflow-x-hidden">

            {/* ATMOSPHERIC LAYER */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(circle_at_50%_40%,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)] opacity-40" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />
            </div>

            <main className="relative z-10 pt-32 md:pt-48 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">

                {/* STATUS BADGE */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full mb-12 backdrop-blur-md"
                >
                    <Command className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/50">System v4.0 Active</span>
                </motion.div>

                {/* HERO AREA */}
                <div className="text-center mb-20 md:mb-32">
                    <h1 className="text-[15vw] md:text-8xl lg:text-[11rem] font-bold tracking-tighter uppercase italic leading-[0.8] mb-8">
                        Vault <br />
                        <span className="text-primary translate-x-8 md:translate-x-12 inline-block">Live.</span>
                    </h1>
                    <p className="text-lg md:text-3xl font-black max-w-2xl mx-auto uppercase italic tracking-tighter text-white/20 leading-tight">
                        High-fidelity media archival. <br />
                        Engineered for zero-leak privacy.
                    </p>
                </div>

                {/* THE COMMAND PORTAL */}
                <div className="w-full max-w-lg mx-auto">
                    <div className="glass-panel p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-white/5 bg-white/[0.01] shadow-2xl relative overflow-hidden backdrop-blur-3xl transition-transform hover:scale-[1.01]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-16 -mt-16" />

                        <div className="flex justify-between items-center mb-8 md:mb-12">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-1">Tunnel Active</div>
                                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Authorized Only</div>
                            </div>
                        </div>

                        <form onSubmit={handleCodeSubmit} className="space-y-4 md:space-y-6">
                            <input
                                type="text"
                                placeholder="VAULT CODE"
                                className="w-full h-20 md:h-24 bg-white/[0.03] border border-white/10 rounded-3xl px-8 font-mono text-3xl md:text-4xl text-primary font-black uppercase tracking-[0.5em] focus:border-primary/50 outline-none transition-all placeholder:text-white/5 text-center"
                                value={eventCode}
                                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                            <button
                                type="submit"
                                disabled={eventCode.length < 4}
                                className="w-full h-16 md:h-20 bg-primary text-white rounded-2xl md:rounded-3xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-0 transition-all shadow-2xl shadow-primary/30"
                            >
                                Enter Vault <ArrowRight className="h-5 w-5" />
                            </button>
                        </form>

                        <div className="mt-8 md:mt-12 pt-8 md:pt-10 border-t border-white/5 flex gap-4">
                            {user ? (
                                <Link to="/events" className="flex-1 h-16 bg-white/[0.03] border border-white/10 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.5em] hover:bg-white/10 transition-all">
                                    Command <Box className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="flex-1 h-14 md:h-16 bg-white/[0.03] border border-white/10 text-white rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="flex-1 h-14 md:h-16 bg-white text-black rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-xl">
                                        Join
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* BENTO TECH PREVIEW (Compact) */}
                <div className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 md:mt-32 px-2">
                    <FeatureItem icon={<Shield className="text-primary" />} label="Zero Leak" />
                    <FeatureItem icon={<Zap className="text-amber-500" />} label="Edge Hub" />
                    <FeatureItem icon={<Activity className="text-emerald-500" />} label="Live Sync" />
                    <FeatureItem icon={<Lock className="text-blue-500" />} label="AES-256" />
                </div>
            </main>

            {/* FOOTER & PORTFOLIO */}
            <footer className="py-20 px-6 border-t border-white/5 relative z-10 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">

                    {/* ENGINEER SIGNATURE */}
                    <a
                        href="https://geo-cherian-mathew-2k28.github.io/geo-portfolio/"
                        target="_blank" rel="noopener noreferrer"
                        className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-full flex items-center gap-4 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                    >
                        <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Infrastructure // Geo Cherian Mathew</span>
                    </a>

                    <div className="flex gap-12 text-[10px] font-black text-white/10 uppercase tracking-[0.6em] italic">
                        <Link to="/about" className="hover:text-primary transition-colors">Architecture</Link>
                        <Link to="/" className="hover:text-primary transition-colors">Portal</Link>
                        <span>© 2026 // Memora</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureItem({ icon, label }) {
    return (
        <div className="p-4 md:p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col items-center gap-3 transition-all hover:bg-white/[0.04]">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 flex items-center justify-center opacity-50">
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{label}</span>
        </div>
    );
}
