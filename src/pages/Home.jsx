import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Shield, Zap, Lock,
    Globe, HardDrive, Share2, ChevronRight,
    Command, Box, Activity, Sparkles,
    ShieldCheck, Database, Fingerprint,
    Cpu, Layers, Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [eventCode, setEventCode] = useState('');
    const [isFocused, setIsFocused] = useState(false);
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
        <div className="min-h-screen bg-[#020202] text-white selection:bg-primary/30 font-sans antialiased overflow-x-hidden">

            {/* CINEMATIC BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(circle_at_50%_40%,rgba(var(--primary-rgb),0.15)_0%,transparent_70%)] opacity-60" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />

                {/* Dynamic Floating Nodes */}
                <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-primary/5 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <main className="relative z-10 pt-32 md:pt-56 pb-32 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center">

                    {/* STATUS INDICATOR */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-3 px-5 py-2 bg-white/[0.03] border border-white/10 rounded-full mb-12 backdrop-blur-2xl shadow-2xl"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">System Live // V4.2 Protocol</span>
                    </motion.div>

                    {/* HERO HEADLINE */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        <h1 className="text-[14vw] md:text-[11rem] font-bold tracking-tighter leading-[0.75] mb-12 uppercase italic relative">
                            Vault <span className="text-primary block md:inline translate-x-4 md:translate-x-0">Live.</span>
                            <div className="absolute -top-10 -right-10 hidden lg:block">
                                <Sparkles className="h-16 w-16 text-primary/20 animate-pulse" />
                            </div>
                        </h1>

                        <p className="text-xl md:text-3xl font-black max-w-3xl mx-auto leading-tight text-white/30 mb-20 px-4 uppercase italic tracking-tighter">
                            High-fidelity <span className="text-white">Media Archival</span> with <br className="hidden md:block" />
                            Atomic Privacy Layer.
                        </p>
                    </motion.div>

                    {/* THE COMMAND PORTAL */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="w-full max-w-xl mx-auto mb-48 group px-2"
                    >
                        <div className={`absolute -inset-8 bg-primary/20 blur-[100px] rounded-[4rem] transition-all duration-1000 ${isFocused ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`} />

                        <div className="glass-panel p-2 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-white/10 relative overflow-hidden backdrop-blur-3xl">
                            <div className="bg-[#050505] rounded-[3.3rem] p-8 md:p-14 border border-white/5 relative z-10 transition-transform duration-700 group-hover:scale-[0.995]">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <Fingerprint className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-1">Encrypted Tunnel</div>
                                        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">TLS 1.3 Active</div>
                                    </div>
                                </div>

                                <form onSubmit={handleCodeSubmit} className="flex flex-col gap-6">
                                    <div className="relative group/input">
                                        <input
                                            type="text"
                                            placeholder="VAULT CODE"
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                            className="w-full h-20 md:h-24 bg-white/[0.03] border border-white/10 rounded-3xl px-10 font-mono text-3xl md:text-4xl text-primary font-black uppercase tracking-[0.6em] focus:border-primary/50 outline-none transition-all placeholder:text-white/5 text-center"
                                            value={eventCode}
                                            onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                                            maxLength={6}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={eventCode.length < 4}
                                        className="h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center gap-4 font-black text-sm uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-0 transition-all shadow-2xl shadow-primary/40 group/btn"
                                    >
                                        Establish Link <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-2" />
                                    </button>
                                </form>

                                <div className="mt-12 pt-10 border-t border-white/5 flex flex-wrap gap-4">
                                    {user ? (
                                        <Link to="/events" className="flex-1 h-16 bg-white/[0.03] border border-white/10 text-white rounded-2xl flex items-center justify-center gap-4 font-black text-[10px] uppercase tracking-[0.5em] hover:bg-white/10 transition-all">
                                            Command Center <Box className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <>
                                            <Link to="/login" className="flex-1 h-16 bg-white/[0.03] border border-white/10 text-white rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.5em] hover:bg-white/10 transition-all">
                                                Sign In
                                            </Link>
                                            <Link to="/register" className="flex-1 h-16 bg-white text-black rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.5em] hover:bg-primary hover:text-white transition-all">
                                                New Vault
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* INFRASTRUCTURE GRID (Bento) */}
                    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mb-32">
                        <FeatureCard
                            className="md:col-span-8 h-[350px]"
                            icon={<ShieldCheck className="text-primary" />}
                            title="Zero-Leak Isolation"
                            desc="Native PostgreSQL RLS ensures data is cryptographically isolated. Your media is logically invisible to anyone without explicit authorization."
                        />
                        <FeatureCard
                            className="md:col-span-4 h-[350px]"
                            icon={<Zap className="text-amber-500" />}
                            title="Atomic Bandwidth"
                            desc="Optimized global CDN edge nodes for instant retrieval."
                        />
                        <FeatureCard
                            className="md:col-span-4 h-[350px]"
                            icon={<Smartphone className="text-blue-500" />}
                            title="Frictionless Access"
                            desc="One-tap sharing with QR and session-based decryption."
                        />
                        <FeatureCard
                            className="md:col-span-8 h-[350px]"
                            icon={<Layers className="text-emerald-500" />}
                            title="Engineered Fidelity"
                            desc="Zero compression archival policy. Every pixel is preserved exactly as captured, backed by enterprise-grade storage schemas."
                        />
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="py-24 px-6 border-t border-white/5 relative z-10 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 mb-20 text-[10px] font-black text-white/20 uppercase tracking-[0.6em] italic">
                        <Link to="/about" className="hover:text-primary transition-colors">Manifesto</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Architecture</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Security Audit</Link>
                    </div>

                    <div className="w-full h-px bg-white/5 mb-20" />

                    <div className="flex flex-col md:flex-row justify-between w-full items-center gap-12 text-[10px] font-black text-white/10 uppercase tracking-[0.8em]">
                        <span>© 2026 // Memora Infrastructure</span>
                        <div className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                            <Activity className="h-4 w-4 text-primary animate-pulse" />
                            <span>Operational Nominal</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ className, icon, title, desc }) {
    return (
        <div className={`p-12 rounded-[3.5rem] bg-white/[0.015] border border-white/5 hover:border-primary/20 transition-all duration-700 group flex flex-col justify-between overflow-hidden relative ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-12 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                    {React.cloneElement(icon, { size: 28, strokeWidth: 1.5 })}
                </div>
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-base font-bold text-white/20 uppercase tracking-tight leading-relaxed max-w-sm group-hover:text-white/50 transition-colors uppercase italic">{desc}</p>
            </div>
            <div className="absolute -bottom-16 -right-16 opacity-[0.02] group-hover:opacity-[0.08] transition-all duration-1000 rotate-12 group-hover:rotate-0 group-hover:scale-110">
                {React.cloneElement(icon, { size: 280, strokeWidth: 0.5 })}
            </div>
        </div>
    );
}
