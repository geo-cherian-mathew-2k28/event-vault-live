import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
    Shield, Activity, Zap, HardDrive,
    ExternalLink, ArrowRight, Command,
    Lock, Server, Database, Cpu
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
            <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-[100] origin-left shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" style={{ scaleX }} />

            {/* ATMOSPHERIC SYSTEM */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-primary/5 blur-[150px] rounded-full -mr-40 -mt-40 opacity-40 animate-pulse" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />
            </div>

            {/* HERO */}
            <section className="relative z-10 pt-32 md:pt-48 pb-40 px-6 max-w-7xl mx-auto flex flex-col items-center">
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
                    <span className="text-primary translate-x-4 md:translate-x-12 inline-block">Protocol.</span>
                </h1>

                <p className="text-lg md:text-3xl font-black max-w-4xl mx-auto uppercase italic tracking-tighter text-white/30 leading-tight text-center px-4">
                    Architecting high-fidelity digital sanctuaries. <br />
                    Engineered for zero-leak archival and atomic bandwidth.
                </p>
            </section>

            {/* TECH BLUEPRINT GRID */}
            <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

                    <BlueprintCard
                        className="md:col-span-8 h-[380px] md:h-[450px]"
                        icon={<Shield className="text-primary" />}
                        title="Isolation Layer"
                        desc="Native Row Level Security (RLS) handles data isolation at the core database level, ensuring your media is logically invisible to unauthorized vectors."
                        tag="CORE SECURITY"
                    />

                    <BlueprintCard
                        className="md:col-span-4 h-[380px] md:h-[450px]"
                        icon={<Zap className="text-amber-500" />}
                        title="Edge Speed"
                        desc="Optimized global retrieval nodes for instant asset resolution."
                        tag="PERFORMANCE"
                    />

                    <BlueprintCard
                        className="md:col-span-4 h-[380px] md:h-[450px]"
                        icon={<HardDrive className="text-blue-500" />}
                        title="1:1 Fidelity"
                        desc="Zero archival compression policy for original integrity."
                        tag="INTEGRITY"
                    />

                    <BlueprintCard
                        className="md:col-span-8 h-[380px] md:h-[450px] bg-primary/5 border-primary/20"
                        icon={<Activity className="text-primary" />}
                        title="Integrity Monitor"
                        desc="Real-time operational health feedback for the Memora production environment."
                        tag="LIVE DIAGNOSTICS"
                    >
                        <div className="mt-8 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 text-left">
                            <Stat label="DB ENGINE" value="NOMINAL" />
                            <Stat label="ENCRYPTION" value="AES256" />
                            <Stat label="STATUS" value="READY" />
                            <Stat label="SYNC" value="ACTIVE" />
                        </div>
                    </BlueprintCard>
                </div>
            </section>

            {/* ENGINEER SIGNATURE SECTION */}
            <section className="relative z-10 py-64 px-6 overflow-hidden border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-center">
                    <div className="text-left">
                        <div className="text-[10px] font-black text-primary uppercase tracking-[1em] mb-12 italic">Chief Infrastructure Engineer</div>
                        <h2 className="text-[12vw] md:text-9xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-12">
                            Geo Cherian <br />Mathew
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <a
                                href="https://geo-cherian-mathew-2k28.github.io/geo-portfolio/"
                                target="_blank" rel="noopener noreferrer"
                                className="h-20 px-12 bg-white text-black flex items-center justify-center gap-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-3xl active:scale-95 group"
                            >
                                Access Portfolio <ExternalLink className="h-4 w-4" />
                            </a>
                            <Link to="/register" className="h-20 px-12 bg-white/5 border border-white/10 text-white flex items-center justify-center gap-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">
                                Join Network <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col gap-12 text-white/5 select-none opacity-40">
                        <TechnicalLine icon={<Server />} label="INFRASTRUCTURE AS CODE" />
                        <TechnicalLine icon={<Database />} label="POSTGRES SQL CLUSTER" />
                        <TechnicalLine icon={<Cpu />} label="EDGE COMPUTE NODES" />
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-24 px-6 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 text-[10px] font-black text-white/10 uppercase tracking-[0.8em] italic">
                    <div className="flex flex-wrap justify-center gap-16">
                        <Link to="/" className="hover:text-primary transition-colors">Portal</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Architecture</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Security</Link>
                    </div>
                    <span>© 2026 // Geo Cherian Mathew</span>
                </div>
            </footer>
        </div>
    );
}

function BlueprintCard({ className, icon, title, desc, tag, children }) {
    return (
        <div className={`p-10 md:p-16 rounded-[4rem] bg-white/[0.015] border border-white/5 hover:border-primary/20 transition-all duration-700 group flex flex-col justify-between overflow-hidden relative ${className}`}>
            <div className="relative z-10 text-left">
                <div className="flex justify-between items-start mb-12 md:mb-16">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary transition-all duration-700">
                        {React.cloneElement(icon, { size: 24, strokeWidth: 1.5, className: 'group-hover:text-white transition-colors duration-700' })}
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">{tag}</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none group-hover:text-primary transition-colors duration-700">{title}</h3>
                <p className="text-lg font-bold text-white/20 uppercase italic tracking-tighter leading-snug max-w-lg group-hover:text-white/60 transition-colors duration-700">{desc}</p>
            </div>
            {children}
            <div className="absolute -bottom-20 -right-20 opacity-[0.015] group-hover:opacity-[0.05] transition-all duration-1000 rotate-12 group-hover:rotate-0 group-hover:scale-125">
                {React.cloneElement(icon, { size: 400, strokeWidth: 0.2 })}
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">{label}</span>
            <span className="text-2xl font-black text-primary italic tracking-tight">{value}</span>
        </div>
    );
}

function TechnicalLine({ icon, label }) {
    return (
        <div className="flex items-center gap-8 group">
            <div className="h-16 w-16 border border-white/5 rounded-2xl flex items-center justify-center group-hover:border-primary/20 transition-all duration-500">
                {React.cloneElement(icon, { size: 24, strokeWidth: 1, className: 'group-hover:text-primary transition-colors duration-500' })}
            </div>
            <span className="text-xs font-black uppercase tracking-[1em] group-hover:text-white transition-colors duration-500">{label}</span>
        </div>
    );
}
