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

        // Safety Timeout: Ensure app loads even if Supabase is slow/blocked
        const safetyTimeout = setTimeout(() => {
            if (loading) {
                console.warn("Auth initialization taking too long. Forcing app mount.");
                setLoading(false);
            }
        }, 3500);

        // Check active sessions and sets the user
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error("Session Error:", error.message);
                }
                setUser(session?.user ?? null);
            } catch (err) {
                console.warn("Auth initializing silently failed - likely network or storage block.");
            } finally {
                setLoading(false);
                clearTimeout(safetyTimeout);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                setUser(null);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setUser(session?.user ?? null);
            }
            // Always ensure loading is false on any auth change
            setLoading(false);
        });

        initAuth();

        return () => {
            subscription.unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, []);

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-[9999]">
                <div className="flex flex-col items-center">
                    <div className="relative h-20 w-20 mb-8">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                        <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Infrastructure</p>
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
