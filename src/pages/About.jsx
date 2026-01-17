import React from 'react';
import { Shield, Users, Database, Lock, Zap, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="min-h-screen bg-dark-bg text-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 animate-slide-up">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Reimagining <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Secure Sharing</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed">
                        EventVault was built to solve a simple problem: sharing memories shouldn't mean compromising privacy.
                        We combine enterprise-grade security with consumer-grade simplicity.
                    </p>
                </div>

                {/* Mission Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <AboutCard
                        icon={<Lock className="h-6 w-6 text-blue-400" />}
                        title="Privacy First"
                        desc="Your data is yours. We use Row Level Security ensuring only authorized eyes see your content."
                    />
                    <AboutCard
                        icon={<Zap className="h-6 w-6 text-yellow-400" />}
                        title="Lightning Fast"
                        desc="Built on modern edge infrastructure for global low-latency access to your media."
                    />
                    <AboutCard
                        icon={<Globe className="h-6 w-6 text-green-400" />}
                        title="Universal Access"
                        desc="Share with anyone, anywhere. No account required for public events, secure codes for private ones."
                    />
                </div>

                {/* Story Section */}
                <div className="bg-dark-card rounded-3xl p-8 md:p-12 border border-slate-800 relative overflow-hidden mb-20">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Why EventVault?</h2>
                            <div className="space-y-6 text-slate-300">
                                <p>
                                    Generic cloud drives are messy. Folders get lost, permissions get broken, and links expire.
                                    Social media compresses your photos and mines your data.
                                </p>
                                <p>
                                    <strong className="text-white">EventVault is different.</strong> We built an event-centric model
                                    that treats your gathering—whether it's a wedding, conference, or trip—as a first-class citizen.
                                </p>
                                <div className="pt-4">
                                    <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                                        Start Your Vault <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard number="100%" label="Encrypted" />
                            <StatCard number="0" label="Ads" />
                            <StatCard number="24/7" label="Access" />
                            <StatCard number="∞" label="Memories" />
                        </div>
                    </div>
                </div>

                {/* Developer Credit */}
                <div className="text-center pb-8 animate-fade-in delay-100">
                    <p className="text-slate-500 mb-2">Designed & Developed by</p>
                    <a
                        href="https://www.linkedin.com/in/geo-cherian-mathew"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xl font-semibold text-white hover:text-primary transition-colors hover:scale-105 transform duration-200"
                    >
                        Geo Cherian Mathew
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                </div>

            </div>
        </div>
    );
}

function AboutCard({ icon, title, desc }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors">
            <div className="bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-slate-400">{desc}</p>
        </div>
    );
}

function StatCard({ number, label }) {
    return (
        <div className="bg-slate-900/50 p-6 rounded-2xl text-center border border-white/5">
            <div className="text-3xl font-bold text-primary mb-1">{number}</div>
            <div className="text-sm text-slate-400">{label}</div>
        </div>
    );
}
