import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ShieldCheck, Activity } from 'lucide-react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Senior Developer Guard: Prevents redundant interceptors and memory leaks
let isFetchIntercepted = false;
const setupFetchInterceptor = (projectRef) => {
    if (isFetchIntercepted) return;
    isFetchIntercepted = true;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);
            // Critical Recovery Logic: Catches stale session tokens before they crash the UI
            if (response.status === 400 || response.status === 401) {
                const clone = response.clone();
                try {
                    const errorData = await clone.json();
                    if (errorData?.error_description === 'Invalid refresh token' ||
                        errorData?.msg === 'Invalid refresh token' ||
                        errorData?.message?.includes('Refresh Token Not Found')) {
                        console.warn("Auth session conflict detected. Triggering recovery...");
                        await supabase.auth.signOut();
                        if (projectRef) {
                            localStorage.removeItem(`sb-${projectRef}-auth-token`);
                        }
                        // Redirect to home for a clean state instead of infinite reload
                        window.location.href = '/';
                    }
                } catch (e) { /* silent parse fail */ }
            }
            return response;
        } catch (error) {
            throw error;
        }
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initializationStage, setInitializationStage] = useState('Booting');

    useEffect(() => {
        const projectRef = supabase.supabaseUrl?.split('.')[0]?.split('//')[1];
        setupFetchInterceptor(projectRef);

        // Fail-Safe: Absolute maximum wait time for infrastructure initialization
        const safetyTimeout = setTimeout(() => {
            if (loading) {
                console.warn("Infrastructure initialization timed out. Forcing interface mount.");
                setLoading(false);
            }
        }, 4500);

        const initAuth = async () => {
            try {
                setInitializationStage('Verifying Session');
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                setUser(session?.user ?? null);
                setInitializationStage('Finalizing Interface');
            } catch (err) {
                console.warn("Auth initialization handshake failed. Proceeding as guest.");
            } finally {
                // Ensure atomic state update
                setTimeout(() => {
                    setLoading(false);
                    clearTimeout(safetyTimeout);
                }, 400);
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
            <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-[9999] selection:bg-primary/30">
                <div className="relative flex flex-col items-center">
                    {/* Atmospheric Glow */}
                    <div className="absolute inset-x-[-100px] inset-y-[-100px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                    <div className="relative h-24 w-24 mb-10">
                        <div className="absolute inset-0 rounded-full border border-white/5" />
                        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ animationDuration: '0.8s' }} />
                        <div className="absolute inset-2 rounded-full border border-primary/10 animate-pulse" />
                        <ShieldCheck className="absolute inset-0 m-auto h-8 w-8 text-primary/40" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">Initializing Infrastructure</p>
                        <div className="flex items-center gap-2 text-white/20 text-[8px] font-bold uppercase tracking-[0.4em]">
                            <Activity className="h-3 w-3 text-primary/40 animate-pulse" />
                            <span>{initializationStage}</span>
                        </div>
                    </div>
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
