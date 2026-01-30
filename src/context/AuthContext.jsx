import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Move fetch interceptor outside to prevent redundant overrides in React Strict Mode
let isFetchIntercepted = false;
const setupFetchInterceptor = (projectRef) => {
    if (isFetchIntercepted) return;
    isFetchIntercepted = true;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);
            // Check if it's a Supabase request that failed with specific auth errors
            if (response.status === 400 || response.status === 401) {
                const clone = response.clone();
                try {
                    const errorData = await clone.json();
                    if (errorData?.error_description === 'Invalid refresh token' ||
                        errorData?.msg === 'Invalid refresh token' ||
                        errorData?.message?.includes('Refresh Token Not Found')) {
                        console.warn("Auth session conflict detected. Triggering recovery...");
                        await supabase.auth.signOut();
                        // Optional: clear specific project token
                        if (projectRef) {
                            localStorage.removeItem(`sb-${projectRef}-auth-token`);
                        }
                        window.location.reload(); // Force a fresh state
                    }
                } catch (e) { /* ignore JSON parse errors */ }
            }
            return response;
        } catch (error) {
            // Re-throw AbortError and others so the caller can handle them
            throw error;
        }
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Extract project ref for reliable localStorage cleanup
        const projectRef = supabase.supabaseUrl?.split('.')[0]?.split('//')[1];
        setupFetchInterceptor(projectRef);

        // Check active sessions and sets the user
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                setUser(session?.user ?? null);
            } catch (err) {
                console.error("Auth initialization error:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                setUser(null);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setUser(session?.user ?? null);
            }
            setLoading(false);
        });

        initAuth();

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
