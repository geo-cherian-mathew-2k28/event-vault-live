import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Lock, Unlock, Loader2, Trash2, ArrowRight, Shield, Search, Users, LogOut, Settings } from 'lucide-react';

export default function Dashboard() {
    const [ownedEvents, setOwnedEvents] = useState([]);
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data: owned, error: ownedError } = await supabase
                .from('events')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (ownedError) throw ownedError;

            const { data: joined, error: joinedError } = await supabase
                .from('event_members')
                .select('role, events (*)')
                .eq('user_id', user.id);

            if (joinedError) throw joinedError;

            setOwnedEvents(owned || []);
            const filteredJoined = (joined || [])
                .map(item => item.events)
                .filter(ev => ev && ev.owner_id !== user.id);

            setJoinedEvents(filteredJoined);
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
            const { error } = await supabase.from('events').delete().eq('id', eventId);
            if (error) throw error;
            setOwnedEvents(ownedEvents.filter(e => e.id !== eventId));
        } catch (error) {
            alert('Failed to delete event');
        }
    };

    const handleLeave = async (e, eventId) => {
        e.stopPropagation();
        e.preventDefault();
        if (!window.confirm('Leave this event? You will need the passcode to join again.')) return;

        try {
            await supabase.from('event_members').delete().match({ event_id: eventId, user_id: user.id });
            setJoinedEvents(joinedEvents.filter(e => e.id !== eventId));
        } catch (error) {
            alert('Failed to leave event');
        }
    };

    const filterFunc = (ev) => {
        const query = searchTerm.toLowerCase();
        return ev.name.toLowerCase().includes(query) || (ev.event_code && ev.event_code.toLowerCase().includes(query));
    };

    const filteredOwned = ownedEvents.filter(filterFunc);
    const filteredJoined = joinedEvents.filter(filterFunc);

    return (
        <div className="min-h-screen bg-dark-bg pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="glass-panel rounded-2xl p-6 mb-10 border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="mr-auto">
                        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                        <p className="text-slate-400 text-sm">Manage your secure workspaces.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search workspace..."
                                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-full sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Link to="/events/new" className="btn-primary flex items-center justify-center gap-2 px-4 py-2 h-10">
                            <Plus className="h-4 w-4" />
                            <span>Create</span>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12 pb-24">
                        {filteredOwned.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-6 ml-1">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-bold text-white tracking-wide">Managed Workspaces</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredOwned.map((event) => (
                                        <EventCard key={event.id} event={event} isOwner={true} onDelete={handleDelete} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredJoined.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-6 ml-1">
                                    <Users className="h-5 w-5 text-accent" />
                                    <h2 className="text-lg font-bold text-white tracking-wide">Shared with Me</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredJoined.map((event) => (
                                        <EventCard key={event.id} event={event} isOwner={false} onLeave={handleLeave} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {ownedEvents.length === 0 && joinedEvents.length === 0 && (
                            <div className="text-center py-24 glass-panel rounded-2xl">
                                <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white">No workspaces yet</h3>
                                <p className="text-slate-500 mb-6">Create your first secure vault to get started.</p>
                                <Link to="/events/new" className="btn-primary px-6 py-2">Create Workspace</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function EventCard({ event, isOwner, onDelete, onLeave }) {
    const navigate = useNavigate();
    return (
        <div className="group glass-panel rounded-2xl p-6 card-hover relative transition-all border border-white/5">
            <Link to={`/events/${event.id}`} className="absolute inset-0 z-0" />

            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className={`px-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${event.is_public ? 'text-emerald-400 border-emerald-400/20' : 'text-rose-400 border-rose-400/20'}`}>
                    {event.is_public ? 'Public' : 'Protected'}
                </div>
                <div className="flex gap-1">
                    {isOwner ? (
                        <>
                            <button onClick={(e) => { e.preventDefault(); navigate(`/events/${event.id}/edit`); }} className="p-2 text-slate-400 hover:text-white">
                                <Settings className="h-4 w-4" />
                            </button>
                            <button onClick={(e) => onDelete(e, event.id)} className="p-2 text-slate-400 hover:text-rose-400">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <button onClick={(e) => onLeave(e, event.id)} className="p-2 text-slate-400 hover:text-rose-400">
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 truncate relative z-10">{event.name}</h3>
            <p className="text-slate-400 text-sm line-clamp-2 mb-8 relative z-10">{event.description || 'Secure workspace.'}</p>

            <div className="flex items-center justify-between border-t border-white/5 pt-4 relative z-10">
                <div className="text-[10px] uppercase font-bold text-slate-500">Access Code: {event.event_code}</div>
                <ArrowRight className="h-4 w-4 text-primary" />
            </div>
        </div>
    );
}
