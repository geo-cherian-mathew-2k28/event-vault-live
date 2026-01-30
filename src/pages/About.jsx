import React, { useState, useEffect } from 'react';
import { Shield, Lock, Globe, HardDrive, Check, ArrowRight, Menu, Activity, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function About() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 font-sans antialiased overflow-x-hidden">

            {/* GRAIN OVERLAY */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[150] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* MOBILE MENU OVERLAY */}
            {menuOpen && (
                <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl animate-fade-in flex flex-col items-center justify-center p-8 text-center">
                    <button onClick={() => setMenuOpen(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl border border-white/10 text-white/40"><X className="h-6 w-6" /></button>
                    <div className="flex flex-col gap-8">
                        <Link to="/" onClick={() => setMenuOpen(false)} className="text-2xl font-black uppercase italic tracking-widest text-white/40 hover:text-white transition-all">Portal</Link>
                        <Link to={user ? "/events" : "/login"} onClick={() => setMenuOpen(false)} className="text-2xl font-black uppercase italic tracking-widest text-white/40 hover:text-white transition-all">Dashboard</Link>
                        <a href="https://geo-cherian-mathew-2k28.github.io/geo-portfolio/" target="_blank" className="text-2xl font-black uppercase italic tracking-widest text-white/40 hover:text-white transition-all">Portfolio</a>
                    </div>
                </div>
            )}

            {/* TOP NAVIGATION BAR */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5' : 'py-8'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all group-hover:bg-primary/5">
                            <Shield className="h-6 w-6 text-white group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic text-white">Memora</span>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        <NavLink to="/">Portal</NavLink>
                        <NavLink to={user ? "/events" : "/login"}>Dashboard</NavLink>
                        <a
                            href="https://geo-cherian-mathew-2k28.github.io/geo-portfolio/"
                            target="_blank"
                            className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-colors italic"
                        >
                            Portfolio
                        </a>
                    </div>

                    <button
                        onClick={() => setMenuOpen(true)}
                        className="md:hidden p-2 text-white/60 hover:text-white transition-colors h-10 w-10 bg-white/5 rounded-xl border border-white/10"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </nav>

            {/* ATMOSPHERIC BACKGROUND */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-white/5 blur-[150px] rounded-full -mr-20 -mt-20 opacity-40 shadow-[0_0_100px_rgba(255,255,255,0.05)]" />
                <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-white/5 blur-[150px] rounded-full -ml-20 -mb-20 opacity-30 shadow-[0_0_100px_rgba(255,255,255,0.02)]" />
            </div>

            <main className="relative z-10 pt-32 pb-32 px-6 max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-12 border border-white/10">
                        <Shield className="h-8 w-8 text-white" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                        Memora
                    </h1>

                    <p className="text-xl text-white/40 mb-20 leading-relaxed font-medium">
                        The modern architecture for capturing, collecting, and preserving your most precious memories in complete security.
                    </p>

                    {/* CORE PILLARS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                        <AboutCard
                            icon={<Lock />}
                            title="Private by Design"
                            desc="Every event is cryptographically isolated. Your data is your own, protected by enterprise-grade access control."
                        />
                        <AboutCard
                            icon={<HardDrive />}
                            title="Eternal Archival"
                            desc="High-fidelity preservation policy. No compression, no data loss. Exactly as it was captured."
                        />
                        <AboutCard
                            icon={<Globe />}
                            title="Frictionless Access"
                            desc="Share instantly via unique codes. No apps required, no login-heavy hurdles for your guests."
                        />
                        <AboutCard
                            icon={<Activity className="text-white" />}
                            title="Real-time Engine"
                            desc="Watch your event grow as it happens. Instant sync across all connected observers."
                        />
                    </div>

                    <div className="mt-24 pt-20 border-t border-white/5 w-full flex flex-col items-center">
                        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight italic">Engineered by</h2>
                        <a
                            href="https://geo-cherian-mathew-2k28.github.io/geo-portfolio/"
                            target="_blank" rel="noopener noreferrer"
                            className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.4em] hover:bg-white/90 transition-all shadow-2xl flex items-center gap-4"
                        >
                            Geo Cherian Mathew <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 py-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <Link to="/" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors">
                        Return to Portal
                    </Link>
                </div>
            </footer>
        </div>
    );
}

function AboutCard({ icon, title, desc }) {
    return (
        <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                {React.cloneElement(icon, { className: 'h-6 w-6 text-white/60' })}
            </div>
            <h3 className="text-xl font-black text-white mb-4 uppercase italic tracking-tight">{title}</h3>
            <p className="text-sm font-bold text-white/20 uppercase tracking-tight leading-relaxed">{desc}</p>
        </div>
    );
}

function NavLink({ to, children }) {
    return (
        <Link
            to={to}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors"
        >
            {children}
        </Link>
    );
}
