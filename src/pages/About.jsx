import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
    Shield, Activity, Zap, HardDrive,
    ExternalLink, ArrowRight, Layers,
    Lock, Server, Globe, Fingerprint,
    Command, Box, Database, Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-primary/30 font-sans antialiased overflow-x-hidden" ref={containerRef}>

            {/* PROGRESS GAUGE */}
            <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-[100] origin-left shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]" style={{ scaleX }} />

            {/* ATMOSPHERIC LAYER */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -mr-96 -mt-96 opacity-40" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />
            </div>

            {/* HERO */}
            <section className="relative z-10 pt-32 pb-40 px-6 max-w-7xl mx-auto flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full mb-12 backdrop-blur-md"
                >
                    <Command className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/50">Infrastructure v4.0</span>
                </motion.div>

                <h1 className="text-[12vw] md:text-8xl lg:text-[11rem] font-bold tracking-tighter uppercase italic leading-[0.8] mb-12 text-center">
                    Beyond <br />
                    <span className="text-primary translate-x-12 inline-block">Protocol.</span>
                </h1>

                <p className="text-xl md:text-3xl font-black max-w-4xl mx-auto uppercase italic tracking-tighter text-white/30 leading-tight text-center px-4">
                    Architecting high-fidelity digital sanctuaries. <br />
                    Engineered for zero-leak archival and atomic bandwidth.
                </p>
            </section>

            {/* BENTO TECH GRID */}
            <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    <AboutBento
                        className="md:col-span-8 h-[400px]"
                        icon={<Shield className="text-primary" />}
                        title="Isolation Layer"
                        desc="Native Row Level Security (RLS) handles data isolation at the core database level, ensuring your media is logically invisible to unauthorized vectors."
                        tag="CORE SECURITY"
                    />

                    <AboutBento
                        className="md:col-span-4 h-[400px]"
                        icon={<Zap className="text-amber-500" />}
                        title="Edge Speed"
                        desc="Optimized global retrieval nodes."
                        tag="LATENCY"
                    />

                    <AboutBento
                        className="md:col-span-4 h-[400px]"
                        icon={<HardDrive className="text-blue-500" />}
                        title="1:1 Fidelity"
                        desc="Zero archival compression policy."
                        tag="INTEGRITY"
                    />

                    <AboutBento
                        className="md:col-span-8 h-[400px] bg-primary/5 border-primary/20"
                        icon={<Activity className="text-primary" />}
                        title="Integrity Monitor"
                        desc="Real-time operational health feedback for the Memora production environment."
                        tag="LIVE DIAGNOSTICS"
                    >
                        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 text-left">
                            <StatTile label="DB ENGINE" value="NOMINAL" />
                            <StatTile label="AUTH GATE" value="ACTIVE" />
                            <StatTile label="CDN EDGE" value="READY" />
                            <StatTile label="ENCRYPT" value="AES256" />
                        </div>
                    </AboutBento>
                </div>
            </section>

            {/* SIGNATURE SECTION */}
            <section className="relative z-10 py-64 px-6 overflow-hidden border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-center">
                    <div className="text-left">
                        <div className="text-[10px] font-black text-primary uppercase tracking-[1em] mb-12 italic">Chief Infrastructure Engineer</div>
                        <h2 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter uppercase leading-none mb-12">
                            Geo Cherian <br />Mathew
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <a
                                href="https://geo-cherian-mathew-2k28.github.io/geo-portfolio/"
                                target="_blank" rel="noopener noreferrer"
                                className="h-18 px-12 bg-white text-black flex items-center justify-center gap-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-2xl active:scale-95"
                            >
                                Access Portfolio <ExternalLink className="h-4 w-4" />
                            </a>
                            <Link to="/register" className="h-18 px-12 bg-white/5 border border-white/10 text-white flex items-center justify-center gap-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all active:scale-95">
                                Start Vault <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col gap-12 text-white/5 select-none">
                        <TechLine icon={<Server />} label="INFRASTRUCTURE AS CODE" />
                        <TechLine icon={<Database />} label="POSTGRES SQL CLUSTER" />
                        <TechLine icon={<Cpu />} label="EDGE COMPUTE NODES" />
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-20 px-6 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-[9px] font-black text-white/20 uppercase tracking-[0.6em] italic">
                    <div className="flex gap-12">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Architecture</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Privacy Flow</Link>
                    </div>
                    <span>© 2026 Memora / Secure Data Structures</span>
                </div>
            </footer>
        </div>
    );
}

function AboutBento({ className, icon, title, desc, tag, children }) {
    return (
        <div className={`p-10 md:p-14 rounded-[3.5rem] bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all group flex flex-col justify-between overflow-hidden relative ${className}`}>
            <div className="relative z-10 text-left">
                <div className="flex justify-between items-start mb-12">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                        {React.cloneElement(icon, { size: 24, strokeWidth: 1.5, className: 'group-hover:text-white transition-colors' })}
                    </div>
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] px-4 py-2 bg-primary/5 border border-primary/10 rounded-full">{tag}</span>
                </div>
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none">{title}</h3>
                <p className="text-lg font-bold text-white/30 uppercase italic tracking-tighter leading-snug max-w-sm group-hover:text-white/60 transition-colors uppercase">{desc}</p>
            </div>
            {children}
            <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity">
                {React.cloneElement(icon, { size: 200, strokeWidth: 0.5 })}
            </div>
        </div>
    );
}

function StatTile({ label, value }) {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">{label}</span>
            <span className="text-2xl font-black text-primary italic tracking-widest">{value}</span>
        </div>
    );
}

function TechLine({ icon, label }) {
    return (
        <div className="flex items-center gap-6 group hover:translate-x-4 transition-transform duration-500">
            <div className="h-14 w-14 border border-white/5 rounded-2xl flex items-center justify-center">
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <span className="text-xs font-black uppercase tracking-[0.8em]">{label}</span>
        </div>
    );
}
