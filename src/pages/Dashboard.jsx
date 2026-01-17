import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar, Lock, Unlock, Loader2, Trash2, ArrowRight, Shield } from 'lucide-react';

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user]);

    const fetchEvents = async () => {
        try {
            // Fetch owned events
            const { data: ownedEvents, error: ownedError } = await supabase
                .from('events')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (ownedError) throw ownedError;

            // Also fetching Joined events for completeness?
            // For now just owned events as per original spec, but user mentioned "events section".
            // Let's stick to Owned for "My Events".

            setEvents(ownedEvents || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, eventId) => {
        e.stopPropagation();
        e.preventDefault();
        if (!window.confirm('Delete this event? All files will be lost.')) return;

        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

            if (error) throw error;
            setEvents(events.filter(e => e.id !== eventId));
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-6 sm:mb-10 flex flex-col md:flex-row justify-between items-center gap-6 animate-slide-up relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 mr-auto w-full md:w-auto text-center md:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Command Center</h1>
                        <p className="text-slate-400 mt-1 text-sm sm:text-base">Manage your secure vaults or join others.</p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {/* Join Form */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const code = e.target.code.value.trim().toUpperCase();
                                if (!code) return;
                                navigate(`/e/${code}`);
                            }}
                            className="relative w-full sm:w-auto"
                        >
                            <input
                                name="code"
                                type="text"
                                placeholder="ACCESS CODE"
                                className="w-full sm:w-48 bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all uppercase font-mono text-center sm:text-left"
                                maxLength={6}
                                autoCapitalize="characters"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors">
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>

                        <Link to="/events/new" className="btn-primary flex items-center justify-center gap-2 group w-full sm:w-auto">
                            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                            Create Vault
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-24 glass-panel rounded-2xl border-dashed border-slate-700/50 flex flex-col items-center">
                        <div className="bg-gradient-to-tr from-primary/20 to-accent/20 w-20 h-20 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 animate-float">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Your vault is empty</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mb-8">
                            Create your first secure event to start sharing with confidence.
                        </p>
                        <Link to="/events/new" className="btn-secondary hover:bg-white/10">
                            Initialize Vault
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {events.map((event) => (
                            <Link to={`/events/${event.id}`} key={event.id} className="group glass-panel rounded-2xl p-0 card-hover relative block overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${event.is_public ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'} flex items-center gap-1.5`}>
                                            {event.is_public ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                            {event.is_public ? 'Public' : 'Private'}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/events/${event.id}/edit`);
                                                }}
                                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                title="Settings"
                                            >
                                                <Shield className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, event.id)}
                                                className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{event.name}</h3>
                                    <p className="text-slate-400 text-sm line-clamp-2 mb-8 h-10 leading-relaxed">
                                        {event.description || 'No description provided'}
                                    </p>

                                    <div className="border-t border-white/5 pt-4 mt-auto flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-500">Access Code</span>
                                            <span className="text-sm font-mono text-accent">{event.event_code}</span>
                                        </div>
                                        <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                            Enter Vault <ArrowRight className="h-4 w-4 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
