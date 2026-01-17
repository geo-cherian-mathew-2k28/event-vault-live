import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Globe, Lock, Sliders, ChevronDown } from 'lucide-react';

export default function CreateEvent() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_public: false,
        allow_uploads: false, // Default to FALSE as requested: creators often want view-only
        event_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        passkey: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('events')
                .insert([
                    {
                        owner_id: user.id,
                        name: formData.name,
                        description: formData.description,
                        is_public: formData.is_public,
                        allow_uploads: formData.allow_uploads, // Include new field
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
            console.error('Error creating event:', error);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-base pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/events')}
                        className="p-2 hover:bg-bg-surface rounded-md text-text-secondary transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-semibold text-text-primary">Create New Workspace</h1>
                </div>

                <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* General Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="input-label">Workspace Name</label>
                                <input
                                    required
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Q4 Marketing Assets"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="input-label">Description (Optional)</label>
                                <textarea
                                    className="input-field min-h-[80px] resize-none"
                                    placeholder="Add context..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="h-px bg-border-subtle" />

                        {/* Access Control */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                                <Lock className="h-4 w-4" /> Access Control
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="input-label">Access Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            type="text"
                                            className="input-field bg-bg-base text-center font-mono tracking-widest text-brand font-bold"
                                            value={formData.event_code}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, event_code: Math.random().toString(36).substring(2, 8).toUpperCase() })}
                                            className="btn-secondary px-3"
                                            title="Regenerate"
                                        >
                                            <Sliders className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Passkey (Optional)</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Secret key"
                                        value={formData.passkey}
                                        onChange={e => setFormData({ ...formData, passkey: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                {/* Public/Private Toggle */}
                                <div className="flex items-center justify-between p-4 bg-bg-base rounded-lg border border-border-subtle">
                                    <div>
                                        <div className="text-sm font-medium text-text-primary mb-1">Public Access</div>
                                        <div className="text-xs text-text-tertiary">Anyone with the link can view this workspace.</div>
                                    </div>
                                    <Toggle
                                        checked={formData.is_public}
                                        onChange={(checked) => setFormData({ ...formData, is_public: checked })}
                                    />
                                </div>

                                {/* Upload Permission Toggle */}
                                <div className="flex items-center justify-between p-4 bg-bg-base rounded-lg border border-border-subtle">
                                    <div>
                                        <div className="text-sm font-medium text-text-primary mb-1">Allow Public Uploads</div>
                                        <div className="text-xs text-text-tertiary">Allow visitors to upload files. Uncheck for View-Only.</div>
                                    </div>
                                    <Toggle
                                        checked={formData.allow_uploads}
                                        onChange={(checked) => setFormData({ ...formData, allow_uploads: checked })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/events')}
                                className="btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Workspace'}
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
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-text-primary' : 'bg-border-highlight'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-bg-base transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
}
