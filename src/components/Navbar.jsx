import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, LogOut, Plus, User, Info, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, type = 'danger' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900/90 border border-white/10 p-8 md:p-12 rounded-[2.5rem] w-full max-w-sm relative text-center shadow-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 ${type === 'danger' ? 'bg-rose-500/10' : 'bg-primary/10'}`} />
                <h3 className="text-xl font-black text-white mb-4 uppercase italic tracking-tighter relative z-10">{title}</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed mb-10 relative z-10">{message}</p>
                <div className="flex gap-4 relative z-10">
                    <button onClick={onClose} className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-white border border-white/5 hover:bg-white/10 transition-all">Cancel</button>
                    <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'danger' ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/20' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAvatar();
            const channel = supabase
                .channel('navbar-profile-sync')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                }, (payload) => {
                    if (payload.new && payload.new.avatar_url) {
                        setAvatarUrl(payload.new.avatar_url);
                    }
                })
                .subscribe();
            return () => { supabase.removeChannel(channel); };
        }
    }, [user]);

    const fetchAvatar = async () => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single();
            if (data) setAvatarUrl(data.avatar_url);
        } catch (e) { }
    };

    return (
        <nav className="fixed top-0 w-full z-[100] bg-dark-bg/80 backdrop-blur-xl border-b border-white/5 h-16 md:h-20 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">
                    {/* Brand */}
                    <Link to="/" className="flex items-center space-x-2.5 group">
                        <div className="bg-white/10 p-2 rounded-xl border border-white/10 group-hover:bg-primary/20 transition-all">
                            <Shield className="h-6 w-6 text-white group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                            Memora
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink to="/about" active={location.pathname === '/about'}>About</NavLink>
                        {user ? (
                            <>
                                <NavLink to="/events" active={location.pathname === '/events'}>Dashboard</NavLink>
                                <div className="h-4 w-px bg-white/10" />
                                <Link
                                    to="/events/new"
                                    className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="uppercase tracking-widest text-[11px]">Create</span>
                                </Link>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 p-1 pl-1 pr-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-surface flex items-center justify-center border border-white/10">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-4 w-4 text-slate-400" />
                                        )}
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Profile</span>
                                </Link>
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="text-slate-500 hover:text-rose-500 transition-colors p-2"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors">
                                    Log in
                                </Link>
                                <Link to="/register" className="btn-primary py-2.5 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white bg-white/5 rounded-lg border border-white/5 transition-all active:scale-95">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* HIGH-END MOBILE OVERLAY MENU */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 z-[-1] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)} />
            )}

            <div className={`md:hidden absolute top-16 left-0 w-full z-50 transition-all duration-300 ease-out overflow-hidden ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
                <div className="mx-4 mt-2">
                    <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 shadow-2xl space-y-2">
                        <MobileLink to="/about" icon={<Info className="h-5 w-5" />} label="About" onClick={() => setIsOpen(false)} active={location.pathname === '/about'} />
                        {user ? (
                            <>
                                <MobileLink to="/events" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" onClick={() => setIsOpen(false)} active={location.pathname === '/events'} />
                                <MobileLink to="/profile" icon={<User className="h-5 w-5" />} label="Profile" onClick={() => setIsOpen(false)} active={location.pathname === '/profile'} />
                                <div className="h-px bg-white/5 my-2" />
                                <button
                                    onClick={() => { setShowLogoutConfirm(true); setIsOpen(false); }}
                                    className="flex items-center w-full p-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    Terminate Session
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Link to="/login" className="flex items-center justify-center h-14 rounded-2xl bg-white/5 border border-white/5 text-white text-[10px] font-black uppercase tracking-widest" onClick={() => setIsOpen(false)}>Log In</Link>
                                <Link to="/register" className="flex items-center justify-center h-14 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={() => setIsOpen(false)}>Join Now</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={async () => { await signOut(); navigate('/'); }}
                title="Terminate Session?"
                message="Are you sure you want to log out? You will need to re-authenticate to access your private vaults."
                confirmText="Sign Out"
            />
        </nav>
    );
}

function NavLink({ to, children, active }) {
    return (
        <Link
            to={to}
            className={`text-xs font-black uppercase tracking-widest transition-colors ${active ? 'text-white' : 'text-slate-500 hover:text-white'}`}
        >
            {children}
        </Link>
    );
}

function MobileLink({ to, icon, label, onClick, active }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center p-4 rounded-2xl transition-all duration-200 ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-300 border border-white/5'}`}
        >
            <div className={`${active ? 'text-white' : 'text-primary'} mr-4`}>{icon}</div>
            <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
        </Link>
    );
}
