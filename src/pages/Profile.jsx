import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Camera, Save, Loader2, Edit3, Check } from 'lucide-react';

const DEFAULT_AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Cookie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Ginger"
];

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profile, setProfile] = useState({
        full_name: '',
        avatar_url: '',
        email: ''
    });

    const fileInputRef = useRef(null);

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

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    avatar_url: data.avatar_url || '',
                    email: user.email
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
        } catch (error) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                email: user.email,
                updated_at: new Date()
            });

            if (error) throw error;
            alert('Profile updated');
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-dark-bg pt-24 px-4 pb-12">
            <div className="max-w-xl mx-auto">
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <div className="text-center mb-8">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-primary/20 overflow-hidden flex items-center justify-center mx-auto">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-10 w-10 text-slate-500" />
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full border-4 border-dark-bg hover:scale-110 shadow-lg"
                                title="Upload Photo"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileUpload} />
                        </div>
                        <h1 className="text-xl font-bold mt-4 text-white">Profile Settings</h1>
                        <p className="text-slate-500 text-sm">{profile.email}</p>
                    </div>

                    <form onSubmit={updateProfile} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 block">Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={profile.full_name}
                                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                placeholder="Display Name"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3 block">Quick Avatars</label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                                {DEFAULT_AVATARS.map((url, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setProfile({ ...profile, avatar_url: url })}
                                        className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all ${profile.avatar_url === url ? 'border-primary scale-110 shadow-xl' : 'border-white/5 hover:border-white/20'}`}
                                    >
                                        <img src={url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={saving || uploading} className="btn-primary w-full py-3 h-12">
                            {saving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Save Profile Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
