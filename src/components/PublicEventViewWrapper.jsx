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
            // Use RPC to bypass RLS for lookups
            const { data, error } = await supabase.rpc('get_event_by_code', { _code: code });

            // RPC returns an array/setof, so check if data[0] exists
            if (data && data.length > 0) {
                navigate(`/events/${data[0].id}`, { replace: true });
                return;
            }

            // Retry Uppercase (common user behavior)
            const { data: dataUpper } = await supabase.rpc('get_event_by_code', { _code: code.toUpperCase() });
            if (dataUpper && dataUpper.length > 0) {
                navigate(`/events/${dataUpper[0].id}`, { replace: true });
                return;
            }

            // If truly not found
            alert('Event not found or invalid code.');
            navigate('/');
            setLoading(false);
        };

        resolveCode();
    }, [code, navigate]);

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}
