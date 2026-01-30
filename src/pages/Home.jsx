import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Folder, Shield, Menu } from 'lucide-react';
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
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 font-sans antialiased overflow-hidden flex flex-col">

            {/* TOP NAVIGATION BAR */}
            <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Memora</span>
                </div>
                <button className="p-2 text-white/60 hover:text-white transition-colors">
                    <Menu className="h-6 w-6" />
                </button>
            </nav>

            {/* MAIN HERO SECTION */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-6 pb-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-[2/1] bg-white/5 blur-[120px] rounded-full opacity-40 mix-blend-screen pointer-events-none" />

                <div className={`max-w-4xl w-full text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h1 className="text-[12vw] md:text-8xl font-black text-white mb-8 tracking-tighter">
                        Memora
                    </h1>

                    <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
                        Capture. Collect. Cherish. The seamless way to gather photos from every guest.
                    </p>

                    {/* CENTRAL INPUT BOX (MATCHING IMAGE) */}
                    <div className="max-w-xl mx-auto w-full mb-12">
                        <form onSubmit={handleCodeSubmit} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-transparent blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <div className="relative bg-[#1a1c22] border border-white/5 rounded-2xl h-20 md:h-24 flex items-center px-8 gap-4 shadow-2xl">
                                <Search className="h-6 w-6 text-white/20" />
                                <input
                                    type="text"
                                    placeholder="ENTER EVENT CODE"
                                    className="flex-1 bg-transparent border-none outline-none text-xl md:text-2xl font-mono uppercase tracking-[0.2em] text-white placeholder:text-white/10"
                                    value={eventCode}
                                    onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                />
                                <button
                                    type="submit"
                                    disabled={eventCode.length < 4}
                                    className="h-12 w-12 md:h-14 md:w-14 bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white rounded-xl flex items-center justify-center transition-all active:scale-95"
                                >
                                    <ArrowRight className="h-6 w-6" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* DASHBOARD LINK (MATCHING IMAGE) */}
                    <Link
                        to={user ? "/events" : "/login"}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full hover:bg-white/5 transition-all group"
                    >
                        <Folder className="h-5 w-5 text-white/20 group-hover:text-white transition-colors" />
                        <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">Go to Dashboard</span>
                    </Link>
                </div>
            </main>

            {/* FOOTER (MATCHING IMAGE) */}
            <footer className="relative z-10 py-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                        SECURE INFRASTRUCTURE • END-TO-END ACCESS CONTROL
                    </p>
                </div>
            </footer>
        </div>
    );
}
