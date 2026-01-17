import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Lock, Trash2, Save } from 'lucide-react';

export default function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_public: false,
        allow_uploads: false,
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
                allow_uploads: data.allow_uploads, // Load setting
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
                    allow_uploads: formData.allow_uploads, // Save setting
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

    const handleDelete = async () => {
        if (!confirm("Are you sure? This will delete all files permanently.")) return;
        try {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
            navigate('/events');
        } catch (err) { alert(err.message); }
    };

    if (loading) return <div className="min-h-screen bg-bg-base flex items-center justify-center"><Loader2 className="animate-spin text-text-primary" /></div>;

    return (
        <div className="min-h-screen bg-bg-base pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(`/events/${id}`)} className="p-2 hover:bg-bg-surface rounded-md text-text-secondary transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-2xl font-semibold text-text-primary">Workspace Settings</h1>
                    </div>
                    <button onClick={handleDelete} className="text-danger hover:text-danger/80 text-sm font-medium flex items-center gap-2 px-3 py-2 hover:bg-danger/10 rounded-md transition-colors">
                        <Trash2 className="h-4 w-4" /> Delete Workspace
                    </button>
                </div>

                <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 shadow-sm">
                    <form onSubmit={handleUpdate} className="space-y-8">
                        {/* Same form structure as CreateEvent, simplified reuse */}
                        <div className="space-y-4">
                            <div>
                                <label className="input-label">Workspace Name</label>
                                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="input-label">Description</label>
                                <textarea className="input-field min-h-[80px] resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>

                        <div className="h-px bg-border-subtle" />

                        <div className="space-y-6">
                            <h3 className="text-sm font-medium text-text-primary">Access Control</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="input-label">Access Code (Immutable)</label>
                                    <input type="text" className="input-field bg-bg-base text-text-tertiary cursor-not-allowed" value={formData.event_code} readOnly />
                                </div>
                                <div>
                                    <label className="input-label">Passkey</label>
                                    <input type="text" className="input-field" value={formData.passkey} onChange={e => setFormData({ ...formData, passkey: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between p-4 bg-bg-base rounded-lg border border-border-subtle">
                                    <div>
                                        <div className="text-sm font-medium text-text-primary mb-1">Public Access</div>
                                        <div className="text-xs text-text-tertiary">Anyone with the link can view this workspace.</div>
                                    </div>
                                    <Toggle checked={formData.is_public} onChange={(c) => setFormData({ ...formData, is_public: c })} />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-bg-base rounded-lg border border-border-subtle">
                                    <div>
                                        <div className="text-sm font-medium text-text-primary mb-1">Allow Public Uploads</div>
                                        <div className="text-xs text-text-tertiary">Allow visitors to upload files. Uncheck for View-Only.</div>
                                    </div>
                                    <Toggle checked={formData.allow_uploads} onChange={(c) => setFormData({ ...formData, allow_uploads: c })} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={saving} className="btn-primary">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-text-primary' : 'bg-border-highlight'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-bg-base transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}
