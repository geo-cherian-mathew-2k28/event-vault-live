import React from 'react';
import { Linkedin, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-bg-base/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">
                        © {new Date().getFullYear()} Memora
                    </div>

                    <div className="flex items-center justify-center">
                        <a
                            href="https://www.linkedin.com/in/geo-cherian-mathew"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all border border-white/10"
                            style={{ textDecoration: 'none' }}
                        >
                            <span className="text-slate-300 text-sm">Architected by</span>
                            <span className="text-white font-bold text-base tracking-wide flex items-center gap-2">
                                Geo Cherian Mathew
                                <Linkedin className="h-4 w-4 text-blue-400" />
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
