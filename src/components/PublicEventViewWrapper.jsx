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
            try {
                // Use RPC (V3 is case insensitive)
                const { data, error } = await supabase.rpc('get_event_by_code', { _code: code });

                if (error) {
                    console.error("RPC Error:", error);
                    setDebugError(`Database Error: ${error.message} (Code: ${error.code})`);
                    return;
                }

                if (data && data.length > 0) {
                    navigate(`/events/${data[0].id}`, { replace: true });
                    return;
                }

                setDebugError(`Event not found. Scanned for code: "${code}". please check the URL.`);
            } catch (err) {
                setDebugError(`Unexpected Error: ${err.message}`);
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
