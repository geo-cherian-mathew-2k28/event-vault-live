import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function PublicEventViewWrapper() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Resolve code to ID
        const resolveCode = async () => {
            console.log("Resolving code:", code);
            try {
                // Use RPC to bypass RLS for lookups
                const { data, error } = await supabase.rpc('get_event_by_code', { _code: code });

                if (error) {
                    console.error("RPC Error:", error);
                }

                // RPC returns an array/setof, check if found
                if (data && data.length > 0) {
                    navigate(`/events/${data[0].id}`, { replace: true });
                    return;
                }

                // Retry Uppercase
                console.log("Retrying uppercase:", code.toUpperCase());
                const { data: dataUpper } = await supabase.rpc('get_event_by_code', { _code: code.toUpperCase() });

                if (dataUpper && dataUpper.length > 0) {
                    navigate(`/events/${dataUpper[0].id}`, { replace: true });
                    return;
                }

                // If truly not found
                console.error("Event not found for code:", code);
                alert('Event not found. Please check the code.');
                navigate('/');
            } catch (err) {
                console.error("Unexpected error resolving code:", err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        resolveCode();
    }, [code, navigate]);

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}
