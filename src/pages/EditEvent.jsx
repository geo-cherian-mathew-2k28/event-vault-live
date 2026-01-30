import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Lock, Trash2, Save, UserMinus, ShieldCheck, Download, Upload, Info, Globe, ChevronRight } from 'lucide-react';

export default function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [revoking, setRevoking] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_public: false,
        allow_uploads: false,
        allow_downloads: true,
        passkey: '',
        event_code: ''
    });

    useEffect(() => {
        loadEvent();
    }, [id, user]);

    const loadEvent = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data.owner_id !== user.id) {
                alert('Unauthorized');
                navigate('/events');
                return;
            }

            setFormData({
                name: data.name,
                description: data.description || '',
                is_public: data.is_public,
                allow_uploads: data.allow_uploads,
                allow_downloads: data.allow_downloads ?? true,
                passkey: data.passkey || '',
                event_code: data.event_code
            });
        } catch (error) {
            console.error(error);
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('events')
                .update({
                    name: formData.name,
                    description: formData.description,
                    is_public: formData.is_public,
                    allow_uploads: formData.allow_uploads,
                    allow_downloads: formData.allow_downloads,
                    passkey: formData.passkey || null
                })
                .eq('id', id);

            if (error) throw error;
            alert('Settings updated successfully');
            navigate(`/events/${id}`);
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRevokeAll = async () => {
        if (!confirm("Revoke access for all members? Everyone except you will need to re-authenticate with the passkey.")) return;
        setRevoking(true);
        try {
            const { error } = await supabase
                .from('event_members')
                .delete()
                .eq('event_id', id);
            if (error) throw error;
            alert('Success: All member sessions have been terminated.');
        } catch (error) {
            alert(error.message);
        } finally {
            setRevoking(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Permanently delete this vault and all its contents? This cannot be undone.")) return;
        try {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
            navigate('/events');
        } catch (err) { alert(err.message); }
    };

    if (loading) return (
        <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-text-tertiary">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Synchronizing Security</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-base pt-24 pb-24 px-4 font-sans selection:bg-primary/20">
            <div className="max-w-xl mx-auto">

                {/* Header - Designer Standard */}
                <div className="flex items-center gap-5 mb-12">
                    <button
                        onClick={() => navigate(`/events/${id}`)}
                        className="group h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 text-text-secondary group-hover:text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tight italic">
                            Vault <span className="text-primary italic">Settings</span>
                        </h1>
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-1">Manage Access & Metadata</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">

                    {/* General Sector */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.3em] px-1">Identity Profile</label>
                        <div className="bg-bg-surface/30 rounded-[2.5rem] border border-white/5 p-6 md:p-10 space-y-8 backdrop-blur-sm shadow-2xl">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest block pl-1">Vault Designation</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-xl font-black text-white outline-none transition-all placeholder:opacity-20 focus:border-primary/50 focus:bg-white/[0.05] shadow-inner"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Enter vault name..."
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block pl-1">Operational Context</label>
                                <textarea
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm font-medium text-text-secondary outline-none focus:border-primary/30 transition-all resize-none min-h-[120px] shadow-inner"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief context for this vault..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Permissions Sector */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.3em] px-1">Security Protocols</label>
                        <div className="bg-bg-surface/30 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-sm">
                            <PermissionItem
                                icon={<Globe />}
                                title="Public Access"
                                desc="Bypass passkey for read-only link viewing."
                                checked={formData.is_public}
                                onChange={(val) => setFormData({ ...formData, is_public: val })}
                            />
                            <div className="h-px bg-white/5 mx-6" />
                            <PermissionItem
                                icon={<Upload />}
                                title="Allow Uploads"
                                desc="Enable contributors to add media content."
                                checked={formData.allow_uploads}
                                onChange={(val) => setFormData({ ...formData, allow_uploads: val })}
                            />
                            <div className="h-px bg-white/5 mx-6" />
                            <PermissionItem
                                icon={<Download />}
                                title="Allow Downloads"
                                desc="Permit high-resolution asset extraction."
                                checked={formData.allow_downloads}
                                onChange={(val) => setFormData({ ...formData, allow_downloads: val })}
                            />
                        </div>
                    </div>

                    {/* Credentials Sector */}
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.3em] px-1">Critical Credentials</label>
                        <div className="bg-bg-surface/30 rounded-[2rem] border border-white/5 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 backdrop-blur-sm">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-secondary/60 uppercase tracking-widest block pl-1">Protocol Identifier</label>
                                <div className="h-14 flex items-center px-6 bg-white/[0.03] rounded-2xl text-primary font-mono font-black text-xl border border-white/5 tracking-[0.3em] shadow-inner">
                                    {formData.event_code}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-secondary/60 uppercase tracking-widest block pl-1">Security Passkey</label>
                                <input
                                    type="text"
                                    className="h-14 w-full bg-white/[0.03] border border-white/10 focus:border-primary/50 rounded-2xl px-6 text-sm font-black text-white outline-none transition-all font-mono shadow-inner text-center tracking-[0.2em]"
                                    value={formData.passkey}
                                    onChange={e => setFormData({ ...formData, passkey: e.target.value })}
                                    placeholder="NONE"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-12 space-y-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary hover:bg-primary/90 text-white w-full h-16 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 border border-white/10"
                        >
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Save Configuration</>}
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleRevokeAll}
                                disabled={revoking}
                                className="h-14 rounded-2xl bg-white/[0.03] border border-white/5 text-rose-500/80 hover:text-white hover:bg-rose-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                <UserMinus className="h-4 w-4" /> <span>Purge Records</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="h-14 rounded-2xl bg-white/[0.02] border border-white/10 text-text-tertiary hover:text-white hover:bg-rose-600 hover:border-rose-600 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
                            >
                                <Trash2 className="h-4 w-4" /> <span>Decommission</span>
                            </button>
                        </div>
                    </div>
                </form>

            </div>
        </div>
    );
}

function PermissionItem({ icon, title, desc, checked, onChange }) {
    return (
        <div className="flex items-center justify-between p-5 md:p-6 group transition-colors hover:bg-white/[0.02]">
            <div className="flex items-center gap-5 min-w-0 pr-4">
                <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-xl transition-all ${checked ? 'bg-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'bg-white/5 text-text-tertiary'}`}>
                    {React.cloneElement(icon, { size: 18 })}
                </div>
                <div className="min-w-0">
                    <h3 className="text-xs font-black text-white uppercase tracking-tight mb-0.5">{title}</h3>
                    <p className="text-[10px] text-text-tertiary font-medium opacity-60 leading-tight uppercase tracking-tighter truncate">{desc}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-all duration-500 ease-in-out focus:outline-none ${checked ? 'bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]' : 'bg-white/10'}`}
            >
                <div className={`absolute left-0 w-12 flex justify-center transition-all duration-300 ${checked ? 'opacity-0 scale-50' : 'opacity-20 scale-100'}`}>
                    <div className="h-1 w-1 rounded-full bg-white" />
                </div>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );
}
