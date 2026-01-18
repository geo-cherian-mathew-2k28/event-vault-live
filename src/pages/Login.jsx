import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [message, setMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('message') === 'check-email') {
            setMessage('Account created successfully. You can now sign in.');
        }
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error("LOGIN ERROR DETAILS:", error); // Debug log
                // Parse Supabase errors for friendliness
                if (error.message.includes("Email not confirmed")) {
                    throw new Error("Account pending verification. Run the SQL script provided.");
                }
                if (error.message.includes("Invalid login")) {
                    throw new Error("Incorrect email or password.");
                }
                throw error;
            }

            const from = location.state?.from?.pathname || '/events';
            navigate(from, { replace: true });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full max-w-md mx-auto">
                <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <Shield className="h-8 w-8 text-brand" />
                    <span className="text-2xl font-bold text-text-primary tracking-tight">Memora</span>
                </Link>

                <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 shadow-card">
                    <div className="mb-8 text-center">
                        <h2 className="text-xl font-semibold text-text-primary mb-2">Welcome back</h2>
                        <p className="text-text-secondary text-sm">Sign in to your account.</p>
                    </div>

                    {error && (
                        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 flex items-start gap-3 text-danger text-sm mb-6">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-start gap-3 text-success text-sm mb-6">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="font-medium">{message}</span>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div>
                            <label className="input-label">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-brand transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="input-label mb-0">Password</label>
                                <Link to="/forgot-password" className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    Reset?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-brand transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-border-subtle pt-6">
                        <p className="text-text-secondary text-sm">
                            No access credentials?{' '}
                            <Link to="/register" className="font-medium text-brand hover:underline underline-offset-4">
                                Request account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
