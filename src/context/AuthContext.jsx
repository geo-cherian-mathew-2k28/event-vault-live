import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                setUser(null);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setUser(session?.user ?? null);
            }
            setLoading(false);
        });

        // Intercept 400 errors for "Refresh Token Not Found" and force signout
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            // Check if it's a Supabase request that failed with specific auth errors
            if (response.status === 400 || response.status === 401) {
                // We can't easily parse the body without consuming it, so we clone
                const clone = response.clone();
                try {
                    const errorData = await clone.json();
                    if (errorData?.error_description === 'Invalid refresh token' ||
                        errorData?.msg === 'Invalid refresh token' ||
                        errorData?.message === 'Invalid Refresh Token: Refresh Token Not Found') {
                        console.warn("Session expired or invalid. Logging out.");
                        await supabase.auth.signOut();
                        setUser(null);
                        // Optional: Clear local storage items related to supabase
                        localStorage.removeItem('sb-bxuzhfcnzuonnwgmgrnv-auth-token');
                    }
                } catch (e) { /* ignore JSON parse errors */ }
            }
            return response;
        };

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-dark-bg flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-slate-400 text-sm animate-pulse">Initializing EventVault...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
