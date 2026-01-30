import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
    Shield, Activity, Zap, HardDrive,
    ExternalLink, ArrowRight, Layers,
    Lock, Server, Globe, Fingerprint,
    Command, Box, Database, Cpu,
    Code, Brackets, Wind
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

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-primary/30 font-sans antialiased overflow-x-hidden" ref={containerRef}>

            {/* PROGRESS MONITOR */}
            <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-[110] origin-left shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" style={{ scaleX }} />

            {/* ATMOSPHERIC SYSTEM */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full opacity-40 animate-pulse" />
                <div className="absolute bottom-[10%] left-[5%] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full opacity-30" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />
            </div>

            {/* HERO SECTION */}
            <section className="relative z-10 pt-48 pb-64 px-6 max-w-7xl mx-auto flex flex-col items-center">
                <motion.div
                    style={{ opacity, y }}
                    className="flex flex-col items-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-5 py-2 bg-white/[0.03] border border-white/10 rounded-full mb-16 backdrop-blur-3xl shadow-2xl"
                    >
                        <Wind className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Infrastructure Manifesto</span>
                    </motion.div>

                    <h1 className="text-[15vw] md:text-[13rem] font-bold tracking-[ -0.05em] uppercase italic leading-[0.7] mb-20 text-center">
                        Memora <br />
                        <span className="text-primary translate-x-12 inline-block">Vaults.</span>
                    </h1>

                    <p className="text-2xl md:text-5xl font-black max-w-5xl mx-auto uppercase italic tracking-tighter text-white/20 leading-[0.9] text-center px-4">
                        We build for <span className="text-white">Absolute Zero.</span> <br />
                        Zero-leak archival. Zero-friction access. <br />
                        <span className="text-primary">Atomic privacy.</span>
                    </p>
                </motion.div>
            </section>

            {/* TECHNICAL BLUEPRINT GRID */}
            <section className="relative z-10 px-6 py-40 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    <ManifestoCard
                        className="md:col-span-8 h-[450px]"
                        icon={<Shield className="text-primary" />}
                        title="Isolation Stack"
                        desc="Utilizing native PostgreSQL Row Level Security (RLS) to enforce data boundaries at the kernel level. Every vault is its own cryptographically contained silo."
                        tag="PROTOCOL"
                    />

                    <ManifestoCard
                        className="md:col-span-4 h-[450px]"
                        icon={<Zap className="text-amber-500" />}
                        title="Edge Speed"
                        desc="Deployment across a global cluster of compute nodes for instant asset resolution."
                        tag="PERFORMANCE"
                    />

                    <ManifestoCard
                        className="md:col-span-4 h-[450px]"
                        icon={<HardDrive className="text-blue-500" />}
                        title="Raw Fidelity"
                        desc="A strict no-compression policy for original archival integrity."
                        tag="STORAGE"
                    />

                    <ManifestoCard
                        className="md:col-span-8 h-[450px] bg-primary/10 border-primary/20"
                        icon={<Activity className="text-primary" />}
                        title="Integrity Pulse"
                        desc="Real-time monitoring of the archival infrastructure and vault health."
                        tag="MONITORING"
                    >
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 text-left">
                            <Stat label="Uptime" value="100%" />
                            <Stat label="Encryption" value="AES256" />
                            <Stat label="Sync" value="RT" />
                            <Stat label="Status" value="Ready" />
                        </div>
                    </ManifestoCard>
                </div>
            </section>

            {/* CHIEF ENGINEER SECTION */}
            <section className="relative z-10 py-72 px-6 overflow-hidden border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-32 items-center">
                    <div className="text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-[10px] font-black text-primary uppercase tracking-[1em] mb-12 italic"
                        >
                            Lead Architect & Chief Engineer
                        </motion.div>
                        <h2 className="text-[12vw] md:text-9xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-16">
                            Geo <br />Cherian <br />Mathew
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-8">
                            <a
                                href="https://geo-cherian-mathew-2k28.github.io/geo-portfolio/"
                                target="_blank" rel="noopener noreferrer"
                                className="h-20 px-16 bg-white text-black flex items-center justify-center gap-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-3xl active:scale-95 group"
                            >
                                Portfolio Access <ExternalLink className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                            </a>
                            <Link to="/register" className="h-20 px-16 bg-white/[0.03] border border-white/10 text-white flex items-center justify-center gap-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all active:scale-95">
                                Join Network <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col gap-12 text-white/5 select-none opacity-40">
                        <TechnicalLine icon={<Code />} label="CORE DB ARCHITECTURE" />
                        <TechnicalLine icon={<Database />} label="RELATIONAL MAPPING" />
                        <TechnicalLine icon={<Server />} label="INFRASTRUCTURE AS CODE" />
                        <TechnicalLine icon={<Brackets />} label="REACT UI ENGINE" />
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-24 px-6 bg-black relative z-10 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <div className="flex flex-wrap justify-center gap-16 mb-24 text-[10px] font-black text-white/10 uppercase tracking-[0.8em] italic">
                        <Link to="/" className="hover:text-primary transition-colors">Portal</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Integrity</Link>
                    </div>
                    <span className="text-[10px] font-black text-white/5 uppercase tracking-[1em]">© 2026 // Geo Cherian Mathew</span>
                </div>
            </footer>
        </div>
    );
}

function ManifestoCard({ className, icon, title, desc, tag, children }) {
    return (
        <div className={`p-14 md:p-20 rounded-[4rem] bg-white/[0.015] border border-white/5 hover:border-primary/20 transition-all duration-700 group flex flex-col justify-between overflow-hidden relative ${className}`}>
            <div className="relative z-10 text-left">
                <div className="flex justify-between items-start mb-16">
                    <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary transition-all duration-700">
                        {React.cloneElement(icon, { size: 32, strokeWidth: 1, className: 'group-hover:text-white transition-colors duration-700' })}
                    </div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] px-5 py-2 bg-primary/5 border border-primary/20 rounded-full">{tag}</span>
                </div>
                <h3 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none group-hover:text-primary transition-colors duration-700">{title}</h3>
                <p className="text-xl font-bold text-white/20 uppercase italic tracking-tighter leading-snug max-w-lg group-hover:text-white/60 transition-colors duration-700">{desc}</p>
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
        <div className="flex flex-col gap-2">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic">{label}</div>
            <div className="text-3xl font-black text-primary uppercase italic tracking-tighter">{value}</div>
        </div>
    );
}

function TechnicalLine({ icon, label }) {
    return (
        <div className="flex items-center gap-10 group cursor-default">
            <div className="h-20 w-20 border border-white/5 rounded-3xl flex items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-500">
                {React.cloneElement(icon, { size: 32, strokeWidth: 1, className: 'group-hover:text-primary transition-colors duration-500' })}
            </div>
            <span className="text-xs font-black uppercase tracking-[1em] group-hover:text-white transition-colors duration-500">{label}</span>
        </div>
    );
}
