import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Shield, Zap, Lock, Globe, HardDrive, Activity, ExternalLink, ArrowRight, Server, Database, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
    const { scrollY } = useScroll();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 3D KINETIC TRANSFORMS
    const calculate3D = (offset, factor = 0.8) => {
        // This simulates a 3D depth effect as you scroll
        const scrollVal = scrollY.get();
        const relativeScroll = scrollVal - offset;
        const z = Math.max(-1000, -relativeScroll * factor);
        const opacity = relativeScroll < -200 ? 0 : relativeScroll > 800 ? Math.max(0, 1 - (relativeScroll - 800) / 400) : 1;
        const scale = relativeScroll < 0 ? 1 : 1 + relativeScroll * 0.0005;

        return {
            transform: `translateZ(${z}px) translateY(${-relativeScroll * 0.1}px)`,
            opacity: opacity,
        };
    };

    return (
        <div className="bg-black text-white min-h-[400vh] selection:bg-primary/30 perspective-1000">

            {/* FIXED ATMOSPHERE */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-primary/5 blur-[150px] rounded-full -mr-40 -mt-40 animate-pulse" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />
            </div>

            {/* SCENE 1: THE MANIFESTO */}
            <Scene offset={0}>
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/10 rounded-full mb-12 backdrop-blur-md"
                    >
                        <Activity className="h-3 w-3 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40">Core Protocol v4.0</span>
                    </motion.div>

                    <h1 className="text-[12vw] md:text-[8rem] font-black italic tracking-tighter uppercase leading-[0.7] mb-12">
                        Beyond <br />
                        <span className="text-primary translate-x-12 inline-block">Archival.</span>
                    </h1>

                    <p className="text-xl md:text-3xl font-black text-white/30 uppercase italic tracking-tighter leading-tight max-w-2xl mx-auto">
                        We build for <span className="text-white">Absolute Zero.</span> <br />
                        High-fidelity digital sanctuaries engineered for zero-leak privacy.
                    </p>
                </div>
            </Scene>

            {/* SCENE 2: THE BLUEPRINT */}
            <Scene offset={1000}>
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-left space-y-12">
                        <h2 className="text-7xl font-black uppercase italic tracking-tighter leading-none">
                            Relational <br />Integrity.
                        </h2>
                        <p className="text-lg font-bold text-white/30 uppercase tracking-tight leading-relaxed max-w-md">
                            Utilizing native PostgreSQL Row Level Security (RLS) to ensure data is logically invisible to unauthorized vectors.
                        </p>
                        <div className="flex gap-4">
                            <Stat label="DB ENGINE" value="POSTGRES" />
                            <Stat label="ENCRYPTION" value="AES-256" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Bento icon={<Shield />} label="Security" />
                        <Bento icon={<Zap />} label="Bandwidth" />
                        <Bento icon={<Globe />} label="Edge" />
                        <Bento icon={<HardDrive />} label="Archival" />
                    </div>
                </div>
            </Scene>

            {/* SCENE 3: THE ENGINEER */}
            <Scene offset={2000}>
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="text-[10px] font-black text-primary uppercase tracking-[1em] mb-12 opacity-50 italic">Chief Infrastructure Engineer</div>
                    <h2 className="text-[10vw] font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-16">
                        Geo Cherian <br />Mathew
                    </h2>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <a
                            href="https://geo-cherian-mathew-2k28.github.io/geo-portfolio/"
                            target="_blank" rel="noopener noreferrer"
                            className="h-20 px-16 bg-white text-black flex items-center justify-center gap-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary hover:text-white transition-all shadow-3xl active:scale-95 group"
                        >
                            Open Portfolio <ExternalLink className="h-4 w-4" />
                        </a>
                        <Link to="/" className="h-20 px-16 bg-white/[0.03] border border-white/10 text-white flex items-center justify-center gap-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">
                            Access Portal <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-20 filter grayscale group-hover:grayscale-0 transition-all">
                        <IconLabel icon={<Server />} text="Infra" />
                        <IconLabel icon={<Database />} text="Storage" />
                        <IconLabel icon={<Code />} text="Interface" />
                        <IconLabel icon={<Lock />} text="Auth" />
                    </div>
                </div>
            </Scene>

            {/* PROGRESS BAR */}
            <motion.div
                className="fixed bottom-0 left-0 h-1.5 bg-primary z-[100] origin-left shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
                style={{ scaleX: useSpring(useTransform(scrollY, [0, 2500], [0, 1]), { stiffness: 100, damping: 30 }) }}
            />
        </div>
    );
}

function Scene({ offset, children }) {
    const { scrollY } = useScroll();
    const [y, setY] = useState(0);

    useEffect(() => {
        return scrollY.onChange((latest) => setY(latest));
    }, [scrollY]);

    const relativeScroll = y - offset;
    const progress = relativeScroll;

    // Simulate 3D Depth
    const z = Math.max(-1000, -progress * 0.8);
    const opacity = progress < -300 ? 0 : progress > 600 ? Math.max(0, 1 - (progress - 600) / 400) : 1;
    const translateY = -progress * 0.1;

    if (opacity <= 0 && progress > 500) return null;
    if (opacity <= 0 && progress < -400) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
                className="w-full transition-transform duration-100 ease-out pointer-events-auto"
                style={{
                    transform: `translateZ(${z}px) translateY(${translateY}px)`,
                    opacity: opacity,
                    visibility: opacity > 0 ? 'visible' : 'hidden'
                }}
            >
                {children}
            </div>
        </div>
    );
}

function Bento({ icon, label }) {
    return (
        <div className="glass-panel p-8 rounded-[2rem] border-white/5 bg-white/[0.01] flex flex-col items-center justify-center gap-4 hover:border-primary/20 hover:bg-primary/5 transition-all">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</span>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">{label}</span>
            <span className="text-xl font-black text-primary italic tracking-tight">{value}</span>
        </div>
    );
}

function IconLabel({ icon, text }) {
    return (
        <div className="flex items-center justify-center gap-3">
            {React.cloneElement(icon, { size: 16 })}
            <span className="text-[10px] font-black uppercase tracking-widest">{text}</span>
        </div>
    );
}
