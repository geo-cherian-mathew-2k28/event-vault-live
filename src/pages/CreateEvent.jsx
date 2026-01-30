import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Globe, Lock, Sliders, Sparkles, Shield, ChevronRight } from 'lucide-react';

export default function CreateEvent() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_public: false,
        allow_uploads: false,
        event_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        passkey: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error('Authentication required for infrastructure provisioning.');

            const { data, error } = await supabase
                .from('events')
                .insert([
                    {
                        owner_id: user.id,
                        name: formData.name,
                        description: formData.description,
                        is_public: formData.is_public,
                        allow_uploads: formData.allow_uploads,
                        event_code: formData.event_code,
                        passkey: formData.passkey || null
                    }
                ])
                .select();

            if (error) throw error;

            if (data && data[0]) {
                navigate(`/events/${data[0].id}`);
            } else {
                navigate('/events');
            }
        } catch (error) {
            console.error('Provisioning failed:', error);
            alert('Infrastructure Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-base pt-24 pb-24 px-4 selection:bg-primary/20">
            <div className="max-w-xl mx-auto">

                {/* Header Section */}
                <div className="flex items-center gap-5 mb-12">
                    <button
                        onClick={() => navigate('/events')}
                        className="group h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 text-text-secondary group-hover:text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tight italic">
                            Provision <span className="text-primary italic">Vault</span>
                        </h1>
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-1">Initialize Secure Infrastructure</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Identity Sector */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.3em] px-1">Vault Metadata</label>
                        <div className="bg-bg-surface/30 rounded-[2.5rem] border border-white/5 p-6 md:p-10 space-y-8 backdrop-blur-sm shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full -mr-16 -mt-16" />

                            <div className="space-y-4 relative z-10">
                                <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest block pl-1">Name Designation</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-xl font-black text-white outline-none transition-all placeholder:opacity-20 focus:border-primary/50 focus:bg-white/[0.05] shadow-inner"
                                    placeholder="e.g. Q4 PRODUCTION ASSETS"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4 relative z-10">
                                <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block pl-1">Operational Brief</label>
                                <textarea
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm font-medium text-text-secondary outline-none focus:border-primary/30 transition-all resize-none min-h-[120px] shadow-inner"
                                    placeholder="Add context for contributors..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Sector */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.3em] px-1">Access Protocol</label>
                        <div className="bg-bg-surface/30 rounded-[2.5rem] border border-white/5 p-6 md:p-10 backdrop-blur-sm shadow-2xl space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block pl-1">Protocol ID</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 h-14 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-2xl text-primary font-mono font-black text-xl tracking-[0.25em] shadow-inner">
                                            {formData.event_code}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, event_code: Math.random().toString(36).substring(2, 8).toUpperCase() })}
                                            className="h-14 w-14 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-text-tertiary hover:text-white transition-all active:scale-95"
                                        >
                                            <Sliders className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block pl-1">Encrypted Passkey (OPT)</label>
                                    <input
                                        type="text"
                                        className="h-14 w-full bg-white/[0.03] border border-white/10 focus:border-primary/50 rounded-2xl px-6 text-sm font-black text-white outline-none transition-all font-mono shadow-inner tracking-widest placeholder:text-white/5"
                                        placeholder="••••"
                                        value={formData.passkey}
                                        onChange={e => setFormData({ ...formData, passkey: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="space-y-4">
                                <ToggleItem
                                    icon={<Globe className="h-4 w-4" />}
                                    title="Public Visibility"
                                    desc="Permit bypass for read-only link access."
                                    checked={formData.is_public}
                                    onChange={(checked) => setFormData({ ...formData, is_public: checked })}
                                />
                                <ToggleItem
                                    icon={<Sparkles className="h-4 w-4" />}
                                    title="Allow Guest Uploads"
                                    desc="Enable external participants to contribute media."
                                    checked={formData.allow_uploads}
                                    onChange={(checked) => setFormData({ ...formData, allow_uploads: checked })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-white w-full h-16 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 border border-white/10 group"
                        >
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                <>
                                    <span>Deploy Infrastructure</span>
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ToggleItem({ icon, title, desc, checked, onChange }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-4">
                <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${checked ? 'bg-primary/10 text-primary' : 'bg-white/5 text-text-tertiary'}`}>
                    {icon}
                </div>
                <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-tight">{title}</div>
                    <div className="text-[9px] text-text-tertiary uppercase tracking-tighter opacity-60">{desc}</div>
                </div>
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ${checked ? 'bg-primary' : 'bg-white/10'}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all shadow-md ${checked ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
        </div>
    );
}
