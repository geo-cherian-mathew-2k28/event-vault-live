import React from 'react';
import { Linkedin, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-bg-base/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} EventVault. Secure. Shared.
                    </div>

                    <div className="flex items-center gap-6">
                        <a
                            href="https://www.linkedin.com/in/geo-cherian-mathew"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors group"
                        >
                            <span className="text-slate-500 group-hover:text-primary-light">Developed by</span>
                            <span className="font-medium text-slate-300 group-hover:text-white">Geo Cherian Mathew</span>
                            <Linkedin className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
