import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    },
                },
            });

            if (error) {
                if (error.message.includes("already registered")) {
                    throw new Error("This email is already connected to an account. Please log in.");
                }
                throw error;
            };

            // With the auto-confirm trigger, we can just redirect to login immediately
            navigate('/login?message=check-email');
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
                    <span className="text-2xl font-bold text-text-primary tracking-tight">EventVault</span>
                </Link>

                <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 shadow-card">
                    <div className="mb-8 text-center">
                        <h2 className="text-xl font-semibold text-text-primary mb-2">Create Account</h2>
                        <p className="text-text-secondary text-sm">Start sharing securely today.</p>
                    </div>

                    {error && (
                        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 flex items-start gap-3 text-danger text-sm mb-6">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleRegister}>
                        <div>
                            <label className="input-label">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-brand transition-colors" />
                                <input
                                    name="fullName"
                                    type="text"
                                    required
                                    className="input-field pl-10"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-brand transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-brand transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-brand transition-colors" />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center mt-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-border-subtle pt-6">
                        <p className="text-text-secondary text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-brand hover:underline underline-offset-4">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
