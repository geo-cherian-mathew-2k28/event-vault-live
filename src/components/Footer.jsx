import React from 'react';
import { Linkedin, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-bg-base/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-slate-500 text-sm font-medium">
                        © {new Date().getFullYear()} EventVault
                    </div>

                    <div className="flex items-center">
                        <a
                            href="https://www.linkedin.com/in/geo-cherian-mathew"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Architected by</span>
                            <span className="text-white font-semibold tracking-wide group-hover:text-primary transition-colors flex items-center gap-2">
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
