import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Camera, Save, Loader2, Edit3 } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        full_name: '',
        avatar_url: '',
        email: ''
    });

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    avatar_url: data.avatar_url || '',
                    email: user.email
                });
            } else {
                // Fallback if profile missing
                setProfile({ ...profile, email: user.email });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // 1. Update public profile table
            const updates = {
                id: user.id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                email: user.email,
                updated_at: new Date()
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            // 2. Sync with Auth Metadata (Critical for Navbar/Session updates)
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: profile.full_name,
                    avatar_url: profile.avatar_url
                }
            });

            if (authError) throw authError;

            alert('Profile updated and synced successfully!');
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-bg pt-24 px-4 pb-12">
            <div className="max-w-xl mx-auto">
                <div className="glass-panel rounded-2xl p-8 animate-slide-up">
                    <div className="text-center mb-8 relative">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-primary to-accent p-1">
                            <div className="w-full h-full rounded-full bg-dark-card overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                        <User className="h-10 w-10" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mt-4 text-white">Your Profile</h1>
                        <p className="text-slate-400">Manage your identity and preferences</p>
                    </div>

                    <form onSubmit={updateProfile} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    disabled
                                    value={profile.email}
                                    className="glass-input w-full pl-10 opacity-50 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Edit3 className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                    className="glass-input w-full pl-10"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Avatar URL</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Camera className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="url"
                                    value={profile.avatar_url}
                                    onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
                                    className="glass-input w-full pl-10"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Paste a direct link to an image.</p>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary w-full"
                            >
                                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
