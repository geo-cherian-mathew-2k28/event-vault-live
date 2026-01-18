import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if we have a hash (Supabase usually sends #access_token=...)
        // or code (PKCE)
        const hash = location.hash;
        const query = new URLSearchParams(location.search);

        if (!hash && !query.get('code')) {
            // No token found, redirect only if we are sure (some flows use query params)
            console.warn("No recovery token found in URL");
        }
    }, [location]);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage("Password updated successfully!");
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl p-8 shadow-card">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                        <Shield className="h-8 w-8 text-brand" />
                        <span className="text-2xl font-bold text-text-primary">Memora</span>
                    </Link>
                    <h2 className="text-xl font-semibold text-text-primary">Set New Password</h2>
                    <p className="text-text-secondary text-sm mt-2">Secure your account with a new credential.</p>
                </div>

                {error && (
                    <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {message ? (
                    <div className="bg-success/10 text-success p-4 rounded-lg text-center flex flex-col items-center gap-2">
                        <CheckCircle className="h-8 w-8" />
                        <p className="font-medium">{message}</p>
                        <p className="text-xs">Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <div>
                            <label className="input-label">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                                <input
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
