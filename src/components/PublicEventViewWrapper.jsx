import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function PublicEventViewWrapper() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [debugError, setDebugError] = useState(null);

    useEffect(() => {
        const resolveCode = async () => {
            if (!code) return;

            try {
                // Try V4 Lookup (Robust, Case-Insensitive)
                const { data, error } = await supabase.rpc('get_event_id_by_code', { code_input: code });

                if (error) {
                    console.error("Lookup Error:", error);
                    setDebugError(`System Error: ${error.message}`);
                    return;
                }

                if (data && data.length > 0) {
                    // Success: Redirect to the event ID
                    const eventId = data[0].id;
                    console.log(`Resolved code ${code} to ID ${eventId}`);
                    navigate(`/events/${eventId}`, { replace: true });
                    return;
                }

                // Fallback: If not found
                console.warn(`Code ${code} yielded no results.`);
                setDebugError(`Invalid Event Code: "${code}". Please check the link.`);

            } catch (err) {
                console.error("Unexpected:", err);
                setDebugError(`Network Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        resolveCode();
    }, [code, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-bg-surface border border-rose-500/30 rounded-xl p-6 shadow-2xl">
                <h1 className="text-xl font-bold text-rose-500 mb-2">Connection Issue</h1>
                <p className="text-text-secondary mb-4">We couldn't find this event.</p>
                <div className="bg-black/30 p-3 rounded font-mono text-xs text-rose-300 break-all">
                    {debugError}
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 w-full btn-secondary"
                >
                    Return Home
                </button>
            </div>
        </div>
    );
}
