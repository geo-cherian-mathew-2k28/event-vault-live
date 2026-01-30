import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Lock, Unlock, Loader2, Trash2, ArrowRight, Shield, Search, Users, LogOut, Settings, Globe, LayoutGrid, LayoutList } from 'lucide-react';

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

    const handleDelete = async (eventId) => {
        if (!window.confirm('Decommission this vault? All internal assets will be permanently purged.')) return;

        try {
            const { error } = await supabase.from('events').delete().eq('id', eventId);
            if (error) throw error;
            setOwnedEvents(ownedEvents.filter(e => e.id !== eventId));
        } catch (error) {
            alert('Administrative deprovisioning failed.');
        }
    };

    const handleLeave = async (eventId) => {
        if (!window.confirm('Sever connection to this vault? Access code will be required for reconnection.')) return;

        try {
            await supabase.from('event_members').delete().match({ event_id: eventId, user_id: user.id });
            setJoinedEvents(joinedEvents.filter(e => e.id !== eventId));
        } catch (error) {
            alert('Failed to disconnect from vault.');
        }
    };

    const filterFunc = (ev) => {
        const query = searchTerm.toLowerCase();
        return ev.name.toLowerCase().includes(query) || (ev.event_code && ev.event_code.toLowerCase().includes(query));
    };

    const filteredOwned = ownedEvents.filter(filterFunc);
    const filteredJoined = joinedEvents.filter(filterFunc);

    return (
        <div className="min-h-screen bg-bg-base pt-28 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-primary/20">
            <div className="max-w-7xl mx-auto">

                {/* Control Center Header */}
                <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 mb-12 border-white/10 flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -ml-32 -mt-32" />

                    <div className="mr-auto relative z-10">
                        <div className="flex items-center gap-3 mb-1">
                            <Shield className="h-6 w-6 text-primary" />
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Control <span className="text-primary italic">Center</span></h1>
                        </div>
                        <p className="text-text-tertiary text-[10px] font-bold uppercase tracking-[0.4em] ml-1">Managing {ownedEvents.length} Secure Vaults</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
                        <div className="relative group flex-1 sm:flex-initial">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Locate infrastructure..."
                                className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] w-full sm:w-80 transition-all font-medium placeholder:opacity-20 shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Link to="/events/new" className="bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-3 px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-2xl shadow-primary/20 border border-white/10">
                            <Plus className="h-5 w-5" />
                            <span>New Vault</span>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-72 bg-white/[0.02] rounded-[2rem] border border-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-20 pb-24">
                        {filteredOwned.length > 0 && (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-xl text-primary border border-primary/20">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Managed <span className="text-primary italic">Infrastructures</span></h2>
                                    </div>
                                    <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredOwned.map((event) => (
                                        <EventCard key={event.id} event={event} isOwner={true} onDelete={handleDelete} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredJoined.length > 0 && (
                            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center bg-accent/10 rounded-xl text-accent border border-accent/20">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Connected <span className="text-accent italic">Nodes</span></h2>
                                    </div>
                                    <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredJoined.map((event) => (
                                        <EventCard key={event.id} event={event} isOwner={false} onLeave={handleLeave} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {ownedEvents.length === 0 && joinedEvents.length === 0 && (
                            <div className="text-center py-32 glass-panel rounded-[3rem] border-white/5 max-w-2xl mx-auto shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px]" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                        <Shield className="h-10 w-10 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-4">No Vaults Initialized</h3>
                                    <p className="text-text-tertiary text-sm max-w-xs mx-auto mb-10 font-bold uppercase tracking-tight opacity-60">Begin your legacy by provisioning a secure media infrastructure.</p>
                                    <Link to="/events/new" className="bg-primary hover:bg-primary/90 text-white px-12 h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center gap-3">
                                        <Plus className="h-5 w-5" /> Initialize First Vault
                                    </Link>
                                </div>
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
        <div className="group glass-panel rounded-[2rem] p-8 transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative border-white/5 hover:border-primary/30 h-full flex flex-col overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 flex justify-between items-start mb-8">
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md shadow-lg ${event.is_public ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-primary border-primary/20 bg-primary/5'}`}>
                    {event.is_public ? 'Public Node' : 'Encrypted'}
                </div>
                <div className="flex gap-2">
                    {isOwner ? (
                        <>
                            <button onClick={(e) => { e.preventDefault(); navigate(`/events/${event.id}/edit`); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-text-tertiary hover:text-white transition-all border border-white/10">
                                <Settings className="h-4 w-4" />
                            </button>
                            <button onClick={(e) => { e.preventDefault(); onDelete(event.id); }} className="p-3 bg-rose-500/5 hover:bg-rose-500 text-rose-500/60 hover:text-white rounded-xl transition-all border border-rose-500/10">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <button onClick={(e) => { e.preventDefault(); onLeave(event.id); }} className="p-3 bg-rose-500/5 hover:bg-rose-500 text-rose-500/60 hover:text-white rounded-xl transition-all border border-rose-500/10">
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="relative z-10 flex-1">
                <h3 className="text-2xl font-black text-white mb-3 truncate leading-tight italic uppercase tracking-tight group-hover:text-primary transition-colors">{event.name}</h3>
                <p className="text-text-tertiary text-xs line-clamp-2 mb-10 font-bold uppercase tracking-tight opacity-70 leading-relaxed">{event.description || 'Secure media infrastructure.'}</p>
            </div>

            <div className="relative z-10 border-t border-white/5 pt-6 flex items-center justify-between">
                <div>
                    <span className="block text-[8px] font-black text-text-tertiary uppercase tracking-[0.4em] mb-1">Passkey Protocol</span>
                    <span className="block text-sm font-mono font-black text-white/50 tracking-widest">{event.event_code}</span>
                </div>
                <button
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="h-12 w-12 bg-white/5 group-hover:bg-primary group-hover:text-white rounded-2xl flex items-center justify-center transition-all duration-500 border border-white/10 group-hover:border-primary shadow-xl group-hover:scale-110"
                >
                    <ArrowRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
