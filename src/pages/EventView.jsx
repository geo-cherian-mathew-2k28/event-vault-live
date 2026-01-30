import React, { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
    Loader2, Lock, Upload, File, Trash2, Download,
    Settings, Share2, Copy, Check, X, Heart,
    Folder, ChevronRight, CheckSquare, Plus,
    PlayCircle, Edit, Clipboard, ChevronLeft, RefreshCw, AlertTriangle, Globe
} from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useUploads } from '../context/UploadContext';

// --- ATOMIC COMPONENTS ---

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, type = 'danger' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-bg-base/90 backdrop-blur-2xl animate-fade-in" onClick={onClose}>
            <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] w-full max-w-sm relative text-center border-white/10 shadow-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 ${type === 'danger' ? 'bg-rose-500/20' : 'bg-primary/20'}`} />
                <div className={`h-16 w-16 mx-auto mb-8 rounded-2xl flex items-center justify-center border ${type === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase italic tracking-tighter relative z-10">{title}</h3>
                <p className="text-[11px] text-text-tertiary font-bold uppercase tracking-tight leading-relaxed mb-10 relative z-10">{message}</p>
                <div className="flex gap-4 relative z-10">
                    <button onClick={onClose} className="btn-secondary flex-1 h-14 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/5 hover:bg-white/10 transition-all">Cancel</button>
                    <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'danger' ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/20 hover:scale-[1.02]' : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]'}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FileCard = memo(({ file, isSelected, isSelecting, onToggle, onPreview, isLiked, onLike, onDelete, isOwner, socialEnabled }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            await onDelete(file.id, file.storage_path);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            onClick={(e) => onPreview(file, e)}
            className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 ${isSelected
                ? 'border-primary ring-4 ring-primary/20 scale-[0.98] shadow-2xl z-20'
                : 'border-white/5 active:scale-95 md:hover:border-white/20 bg-bg-surface/30'
                }`}
        >
            {/* Deleting Overlay */}
            {isDeleting && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
            )}

            {/* Selection Indicator */}
            <div
                className={`absolute top-3 left-3 z-30 h-6 w-6 rounded-lg flex items-center justify-center transition-all duration-300 border ${isSelected
                    ? 'bg-primary border-primary opacity-100 scale-100'
                    : (isSelecting ? 'opacity-100 scale-100 bg-white/10 border-white/20' : 'opacity-100 md:opacity-0 scale-90 md:scale-50 bg-black/20 border-white/10 lg:group-hover:opacity-100 lg:group-hover:scale-100')
                    }`}
                onClick={(e) => { e.stopPropagation(); onToggle(file.id); }}
            >
                <Check className={`h-4 w-4 text-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            {/* Like Button & Count (PERSISTENT & ACTIONABLE) */}
            {socialEnabled && (
                <div className="absolute top-3 right-3 z-30 flex flex-col items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onLike(file.id); }}
                        className={`h-9 w-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all duration-300 shadow-xl ${isLiked ? 'bg-primary text-white scale-110' : 'bg-black/40 text-white/80 hover:bg-white/10'}`}
                    >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    {(file.like_count !== undefined && file.like_count > 0) && (
                        <span className="text-[10px] font-black text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/5">
                            {file.like_count}
                        </span>
                    )}
                </div>
            )}

            {/* Administrative Quick Actions (Persistent for Admins) */}
            {isOwner && !isSelecting && (
                <div className="absolute bottom-3 right-3 z-40 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            saveAs(file.file_url, file.file_name);
                        }}
                        className="h-10 w-10 rounded-2xl bg-white/10 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-all shadow-2xl"
                        title="Download Asset"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Permanently purge this item from the vault?')) {
                                handleDelete(e);
                            }
                        }}
                        className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-500 backdrop-blur-xl border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
                        title="Purge Asset"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="w-full h-full flex items-center justify-center relative bg-bg-base/40">
                {(file.file_type === 'image' || (file.file_name && file.file_name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|heic)$/))) ? (
                    <img
                        src={file.file_url}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        alt=""
                    />
                ) : (file.file_type === 'video' || (file.file_name && file.file_name.toLowerCase().match(/\.(mp4|webm|mov|ogg|m4v)$/))) ? (
                    <div className="w-full h-full relative">
                        <video
                            src={file.file_url + "#t=0.5"}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                            onMouseOver={e => { try { e.currentTarget.play(); } catch (err) { } }}
                            onMouseOut={e => { try { e.currentTarget.pause(); e.currentTarget.currentTime = 0.5; } catch (err) { } }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:opacity-0 transition-opacity">
                                <PlayCircle className="h-6 w-6 md:h-8 md:w-8 text-white/80" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                            <File className="h-8 w-8 text-text-tertiary" />
                        </div>
                        <span className="text-[10px] text-text-secondary font-black uppercase tracking-widest truncate w-full px-4 text-center">{file.file_name}</span>
                    </div>
                )}
            </div>

            {/* Hover Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
});

// --- MAIN PAGE ---

export default function EventView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { uploadFiles } = useUploads();

    // Data State
    const [event, setEvent] = useState(null);
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    // UI Engine State
    const [loading, setLoading] = useState(true);
    const [networkError, setNetworkError] = useState(false);
    const [componentError, setComponentError] = useState(null);
    const [joinCode, setJoinCode] = useState('');
    const [joinPasskey, setJoinPasskey] = useState('');
    const [joining, setJoining] = useState(false);

    // Process State
    const [operation, setOperation] = useState(null);

    // Multi-select & Clipboard Logic
    const [selectedFiles, setSelectedFiles] = useState(new Set());
    const [selectedFolders, setSelectedFolders] = useState(new Set());

    // Modals & Navigation
    const [previewFile, setPreviewFile] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [copied, setCopied] = useState(false);
    const [likedFiles, setLikedFiles] = useState(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // Definitive Social Gate: If storage marks as unprovisioned, we never even TRY.
    const [socialProvisioned, setSocialProvisioned] = useState(() => {
        try {
            const stored = window.sessionStorage?.getItem('social_provisioned');
            return stored !== 'false';
        } catch (e) {
            return true; // Default to true if storage is blocked
        }
    });

    // Access Layer State
    const [hasGuestAccess, setHasGuestAccess] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const fileInputRef = useRef(null);

    // Derived State
    const isOwner = useMemo(() => {
        if (!user || !event) return false;
        const userId = user.id || user.sub; // Handle various ID formats
        const ownerId = event.owner_id;
        return (userId && ownerId && userId.toString() === ownerId.toString()) || userRole === 'owner';
    }, [user, event, userRole]);

    const isAdmin = useMemo(() => {
        return isOwner || userRole === 'admin' || userRole === 'owner';
    }, [isOwner, userRole]);

    const canDelete = isAdmin;

    const canView = useMemo(() => {
        if (isAdmin) return true;
        if (isMember) return true;
        if (event?.is_public) return true;
        if (hasGuestAccess) return true;
        // Check session storage for existing grant
        try {
            const granted = window.sessionStorage?.getItem(`vault_access_${id}`);
            if (granted === 'true') return true;
        } catch (e) {
            // Storage blocked or unavailable
        }
        return false;
    }, [isAdmin, isMember, event, hasGuestAccess, id]);

    const canUpload = useMemo(() => isAdmin || (event?.allow_uploads && canView), [isAdmin, event, canView]);
    const canDownload = useMemo(() => isAdmin || (event?.allow_downloads && canView), [isAdmin, event, canView]);
    const isSelecting = useMemo(() => selectedFiles.size > 0 || selectedFolders.size > 0, [selectedFiles, selectedFolders]);

    const handleSelectAll = useCallback(() => {
        const allFilesSelected = files.every(f => selectedFiles.has(f.id));
        const allFoldersSelected = folders.every(f => selectedFolders.has(f.id));

        if (allFilesSelected && allFoldersSelected) {
            setSelectedFiles(new Set());
            setSelectedFolders(new Set());
        } else {
            setSelectedFiles(new Set(files.map(f => f.id)));
            setSelectedFolders(new Set(folders.map(f => f.id)));
        }
    }, [files, folders, selectedFiles, selectedFolders]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            setNetworkError(false);
            const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();

            if (error) {
                setNetworkError(true);
                return;
            }
            if (data) {
                setEvent(data);
                if (!joinCode) setJoinCode(data.event_code);

                if (user) {
                    const { data: member } = await supabase
                        .from('event_members')
                        .select('role')
                        .eq('event_id', id)
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (member) {
                        setIsMember(true);
                        setUserRole(member.role);
                    } else if (data.is_public) {
                        await supabase.from('event_members').insert({
                            event_id: id,
                            user_id: user.id,
                            role: 'viewer'
                        });
                        setIsMember(true);
                        setUserRole('viewer');
                    }
                }
            }
        } catch (err) {
            console.error("Event fetch failed:", err);
            setNetworkError(true);
        } finally {
            setLoading(false);
        }
    };

    const loadContent = useCallback(async () => {
        try {
            let fQuery = supabase.from('folders').select('*').eq('event_id', id);
            let mQuery = supabase.from('media_files').select('*').eq('event_id', id);

            if (currentFolderId) {
                fQuery = fQuery.eq('parent_id', currentFolderId);
                mQuery = mQuery.eq('folder_id', currentFolderId);
            } else {
                fQuery = fQuery.is('parent_id', null);
                mQuery = mQuery.is('folder_id', null);
            }

            const [foldersRes, filesRes] = await Promise.all([
                fQuery.order('name'),
                mQuery.order('created_at', { ascending: false })
            ]);

            setFolders(foldersRes.data || []);
            setFiles(filesRes.data || []);

            if (socialProvisioned) {
                try {
                    // Optimized social resolution: Works for both guests and authenticated users
                    const currentId = user?.id || localStorage.getItem('guest_id');
                    if (currentId) {
                        const { data: likes } = await supabase
                            .from('media_likes')
                            .select('file_id')
                            .eq('user_id', currentId);
                        if (likes) setLikedFiles(new Set(likes.map(l => l.file_id)));
                    }
                } catch (e) {
                    console.warn("Social context resolution failed.");
                }
            }

            if (currentFolderId) {
                const { data: curr } = await supabase.from('folders').select('name').eq('id', currentFolderId).single();
                if (curr) setBreadcrumbs([{ id: currentFolderId, name: curr.name }]);
            } else {
                setBreadcrumbs([]);
            }
        } catch (err) {
            console.error("Content fetch failed", err);
        }
    }, [id, currentFolderId, user, socialProvisioned]);

    const handleDeleteFile = async (fileId, storagePath) => {
        // Optimistic UI: Hide immediately
        const originalFiles = [...files];
        setFiles(prev => prev.filter(f => f.id !== fileId));

        try {
            if (storagePath) {
                try { await supabase.storage.from('media').remove([storagePath]); } catch (se) { }
            }
            const { error } = await supabase.from('media_files').delete().eq('id', fileId);
            if (error) throw error;
        } catch (e) {
            console.error("Delete failed:", e);
            setFiles(originalFiles); // Rollback on error
            alert("Administrative protocol failure. Item could not be purged.");
        }
    };

    const handleDeleteFolder = async (folderId) => {
        const originalFolders = [...folders];
        setFolders(prev => prev.filter(f => f.id !== folderId));

        try {
            const { error } = await supabase.from('folders').delete().eq('id', folderId);
            if (error) throw error;
        } catch (e) {
            console.error("Delete failed:", e);
            setFolders(originalFolders); // Rollback
            alert("Delete failed");
        }
    };

    const handleBulkDelete = async () => {
        const originalFiles = [...files];
        const originalFolders = [...folders];

        // Optimistic UI update
        setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
        setFolders(prev => prev.filter(f => !selectedFolders.has(f.id)));
        const fileIds = Array.from(selectedFiles);
        const folderIds = Array.from(selectedFolders);

        // Reset selection immediately
        setSelectedFiles(new Set());
        setSelectedFolders(new Set());

        try {
            if (fileIds.length) {
                const itemsToDelete = originalFiles.filter(f => selectedFiles.has(f.id));
                const paths = itemsToDelete.map(f => f.storage_path).filter(Boolean);
                if (paths.length > 0) {
                    try { await supabase.storage.from('media').remove(paths); } catch (se) { }
                }
                const { error } = await supabase.from('media_files').delete().in('id', fileIds);
                if (error) throw error;
            }
            if (folderIds.length) {
                const { error } = await supabase.from('folders').delete().in('id', folderIds);
                if (error) throw error;
            }
        } catch (e) {
            console.error("Bulk delete failed:", e);
            setFiles(originalFiles);
            setFolders(originalFolders);
            alert("Bulk purge failed. System restored to previous state.");
        }
    };

    const handleNav = useCallback((direction) => {
        const idx = files.findIndex(f => f.id === previewFile?.id);
        if (idx === -1) return;
        const next = direction === 'next' ? (idx + 1) % files.length : (idx - 1 + files.length) % files.length;
        setPreviewFile(files[next]);
    }, [files, previewFile]);

    const handleJoin = async (e) => {
        e.preventDefault();
        setJoining(true);
        try {
            if (joinPasskey.trim() === event?.passkey) {
                setHasGuestAccess(true);
                try { window.sessionStorage?.setItem(`vault_access_${id}`, 'true'); } catch (e) { }
                if (user && !isMember) {
                    await supabase.from('event_members').insert({ event_id: id, user_id: user.id, role: 'viewer' });
                    setIsMember(true);
                    setUserRole('viewer');
                }
            } else {
                throw new Error("Invalid Vault Passkey");
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setJoining(false);
        }
    };

    const handleFileUpload = async (e) => {
        const fileList = Array.from(e.target.files);
        if (!fileList.length || !user) return;
        uploadFiles(fileList, id, currentFolderId, user.id);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toggleLike = async (fileId) => {
        if (!socialProvisioned) return;

        // Handle Guest Identity if not logged in
        let currentUserId = user?.id;
        if (!currentUserId) {
            currentUserId = localStorage.getItem('guest_id');
            if (!currentUserId) {
                currentUserId = `guest_${Math.random().toString(36).substring(2)}${Date.now()}`;
                localStorage.setItem('guest_id', currentUserId);
            }
        }

        const isLiked = likedFiles.has(fileId);
        const newLikes = new Set(likedFiles);
        if (isLiked) newLikes.delete(fileId); else newLikes.add(fileId);
        setLikedFiles(newLikes);

        setFiles(currentFiles => currentFiles.map(f => {
            if (f.id === fileId) {
                const currentCount = f.like_count || 0;
                return { ...f, like_count: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1 };
            }
            return f;
        }));

        if (previewFile?.id === fileId) {
            setPreviewFile(prev => ({
                ...prev,
                like_count: isLiked ? Math.max(0, (prev.like_count || 0) - 1) : (prev.like_count || 0) + 1
            }));
        }

        try {
            if (isLiked) await supabase.from('media_likes').delete().eq('file_id', fileId).eq('user_id', currentUserId);
            else await supabase.from('media_likes').insert({ file_id: fileId, user_id: currentUserId });
        } catch (e) {
            // Rollback on absolute failure
            loadContent();
        }
    };

    const downloadSelection = async () => {
        if (selectedFiles.size === 0 && selectedFolders.size === 0) return;
        setOperation({ type: 'Preparing', progress: 10, count: selectedFiles.size + selectedFolders.size });
        try {
            const zip = new JSZip();
            const filesToDownload = files.filter(f => selectedFiles.has(f.id));
            for (let i = 0; i < filesToDownload.length; i++) {
                const f = filesToDownload[i];
                const res = await fetch(f.file_url);
                const blob = await res.blob();
                zip.file(f.file_name, blob);
                setOperation(prev => ({ ...prev, progress: 10 + Math.floor((i / filesToDownload.length) * 40) }));
            }
            const foldersToDownload = folders.filter(f => selectedFolders.has(f.id));
            for (let i = 0; i < foldersToDownload.length; i++) {
                const folder = foldersToDownload[i];
                const folderZip = zip.folder(folder.name);
                const { data: folderFiles } = await supabase.from('media_files').select('*').eq('folder_id', folder.id);
                if (folderFiles) {
                    for (const f of folderFiles) {
                        const res = await fetch(f.file_url);
                        const blob = await res.blob();
                        folderZip.file(f.file_name, blob);
                    }
                }
            }
            setOperation({ type: 'Archiving', progress: 80, count: 1 });
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `memora-export-${Date.now()}.zip`);
            setOperation(null);
        } catch (e) {
            setOperation(null);
        }
    };

    useEffect(() => {
        if (location.state?.code) setJoinCode(location.state.code);
        const probeSocial = async () => {
            try {
                // Persistent check: If we previously determined social is missing, don't ping again
                if (window.sessionStorage?.getItem('social_provisioned') === 'false') {
                    setSocialProvisioned(false);
                    return;
                }

                // Active probe: Check if the table is accessible
                const { error } = await supabase.from('media_likes').select('id').limit(1);

                // Only disable if the table literally doesn't exist (404/42P01)
                if (error && (error.status === 404 || error.code === '42P01')) {
                    setSocialProvisioned(false);
                    try { window.sessionStorage?.setItem('social_provisioned', 'false'); } catch (e) { }
                } else {
                    setSocialProvisioned(true);
                    window.sessionStorage?.setItem('social_provisioned', 'true');
                }
            } catch (e) {
                setSocialProvisioned(false);
            }
        };
        probeSocial();
        loadEvent();
    }, [id, user]);

    useEffect(() => {
        if (event && canView) loadContent();
    }, [currentFolderId, event, canView, loadContent]);

    useEffect(() => {
        if (!event || !canView) return;
        const channel = supabase.channel(`vault-sync-${id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'media_files', filter: `event_id=eq.${id}` }, () => loadContent())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'folders', filter: `event_id=eq.${id}` }, () => loadContent())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [id, event, canView, loadContent]);

    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key === 'Escape') {
                if (previewFile) setPreviewFile(null);
                else if (isSelecting) { setSelectedFiles(new Set()); setSelectedFolders(new Set()); }
            }
            if (e.key === 'ArrowLeft') if (previewFile) handleNav('prev');
            if (e.key === 'ArrowRight') if (previewFile) handleNav('next');
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                handleSelectAll();
            }
            if (e.key === 'Delete' && isSelecting && isAdmin) setShowDeleteConfirm(true);
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [previewFile, isSelecting, handleSelectAll, isAdmin, files, handleNav]);


    if (loading) return (
        <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest animate-pulse">Loading Vault...</span>
        </div>
    );

    if (networkError || componentError) return (
        <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-8 text-center space-y-8 pt-24">
            <div className="bg-rose-500/10 p-8 rounded-xl border border-rose-500/20 shadow-2xl shadow-rose-900/10">
                <AlertTriangle className="h-16 w-16 text-rose-500" />
            </div>
            <div className="space-y-3">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">System Fragmented</h2>
                <p className="text-xs text-text-tertiary max-w-xs mx-auto leading-relaxed font-bold uppercase tracking-tight">
                    {componentError ? "A critical runtime error has occurred in the UI engine. This session has been isolated." : "Vault connection failed. Check your network protocol."}
                </p>
            </div>
            <button onClick={() => window.location.reload()} className="btn-primary px-10 h-14 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <RefreshCw className="h-5 w-5 mr-1" /> Reboot Interface
            </button>
        </div>
    );

    if (!event) return (
        <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-8 text-center space-y-8 pt-24">
            <div className="bg-amber-500/10 p-8 rounded-xl border border-amber-500/20 shadow-2xl shadow-amber-900/10 relative">
                <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full" />
                <Lock className="h-16 w-16 text-amber-500 relative z-10" />
            </div>
            <div className="space-y-3">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Vault Isolated</h2>
                <p className="text-xs text-text-tertiary max-w-xs mx-auto leading-relaxed font-bold uppercase tracking-tight">
                    {user ? "This cryptographic vault does not exist or has been permanently deprovisioned." : "Secure connection restricted. If you were sent a link, please ensure you have the correct access parameters."}
                </p>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-xs">
                {!user && (
                    <button onClick={() => navigate('/login')} className="btn-primary h-14 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
                        Sign In for Access
                    </button>
                )}
                <button onClick={() => navigate('/')} className="btn-secondary h-14 font-black text-xs uppercase tracking-[0.2em] border-white/5 bg-white/5">
                    Return to Home
                </button>
            </div>
        </div>
    );

    if (!canView) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Atmosphere */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-primary/20 blur-[120px] rounded-full opacity-50" />
                </div>

                <div className="max-w-xs w-full glass-panel p-10 rounded-[3rem] text-center border-white/5 shadow-3xl animate-fade-in relative z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-16 -mt-16" />

                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter relative z-10">Vault Protection</h2>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-10">Shared via {event?.event_code || 'Secure Link'}</p>

                    <form onSubmit={handleJoin} className="space-y-4 relative z-10">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-4">Access Passkey</label>
                            <input
                                className="input-field h-16 text-center text-xl font-mono bg-white/5 border-white/10 tracking-[0.5em] rounded-2xl focus:border-primary/50"
                                type="password"
                                placeholder="••••"
                                value={joinPasskey}
                                onChange={e => setJoinPasskey(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" disabled={joining} className="btn-primary w-full h-16 font-black uppercase text-xs tracking-[0.3em] mt-6 shadow-2xl shadow-primary/30 rounded-2xl">
                            {joining ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Decrypt & Enter'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-tight">Access is granted for this session only.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-base flex flex-col font-sans selection:bg-primary/30 pt-16 md:pt-20">

            {/* STICKY TOOLBAR - Offset to clear Navbar perfectly */}
            <div className="sticky top-16 md:top-20 z-[60] w-full">
                <div className="absolute inset-0 bg-bg-base border-b border-white/5 shadow-xl" />

                <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 md:h-16 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <button
                            onClick={() => setCurrentFolderId(null)}
                            className={`flex items-center gap-2 p-2 rounded-xl transition-all ${!currentFolderId ? 'text-primary bg-primary/10 border border-primary/20' : 'text-text-tertiary hover:text-white hover:bg-white/5 border border-transparent'}`}
                        >
                            <Folder className="h-4 w-4 md:h-5 md:w-5" />
                        </button>

                        <div className="hidden lg:flex items-center gap-2 border-l border-white/10 pl-4 ml-1">
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-tighter truncate max-w-[120px]">{event?.name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 ml-auto">
                        <button onClick={loadContent} className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-text-tertiary hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <RefreshCw className="h-4 w-4 md:h-5 md:w-5" />
                        </button>

                        {isSelecting ? (
                            <div className="flex items-center gap-2 p-1 bg-white/10 rounded-2xl border border-white/10 animate-in slide-in-from-right-4 duration-500 max-w-[calc(100vw-60px)] sm:max-w-none overflow-x-auto scrollbar-hide">
                                <button
                                    onClick={handleSelectAll}
                                    className="flex items-center gap-2 h-8 px-4 rounded-xl transition-all bg-primary/20 hover:bg-primary/30 group shrink-0"
                                >
                                    <CheckSquare className="h-4 w-4 text-primary group-active:scale-90 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary whitespace-nowrap">
                                        {files.length + folders.length === selectedFiles.size + selectedFolders.size ? 'Deselect All' : 'Select All'}
                                    </span>
                                </button>

                                <div className="h-6 w-px bg-white/10 shrink-0" />

                                <div className="px-2 shrink-0">
                                    <div className="bg-white/10 text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10">
                                        {selectedFiles.size + selectedFolders.size}
                                    </div>
                                </div>

                                <div className="h-6 w-px bg-white/10 shrink-0" />

                                {(isAdmin || isOwner || (user && event && String(user.id) === String(event.owner_id))) && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="h-9 w-9 shrink-0 flex items-center justify-center text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all shadow-xl border border-rose-500/20 group scale-110"
                                        title="Delete Selection"
                                    >
                                        <Trash2 className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                                    </button>
                                )}

                                <button
                                    onClick={downloadSelection}
                                    className="h-8 w-8 flex-shrink-0 flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all shadow-lg"
                                    title="Download Zip"
                                >
                                    <Download className="h-4 w-4" />
                                </button>

                                <div className="h-6 w-px bg-white/10 shrink-0" />

                                <button
                                    onClick={() => { setSelectedFiles(new Set()); setSelectedFolders(new Set()); }}
                                    className="h-8 w-8 flex-shrink-0 flex items-center justify-center text-text-tertiary hover:text-white rounded-xl transition-all"
                                    title="Clear Selection"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 md:gap-3">
                                <button onClick={() => setShowShareModal(true)} className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center text-text-tertiary hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5"><Share2 className="h-5 w-5" /></button>
                                {isOwner && (
                                    <>
                                        <button onClick={() => navigate(`/events/${id}/edit`)} className="hidden sm:flex h-11 w-11 items-center justify-center text-text-tertiary hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5"><Settings className="h-5 w-5" /></button>
                                        <button onClick={() => { setEditingFolder(null); setNewFolderName(''); setShowFolderModal(true); }} className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center text-text-tertiary hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5"><Plus className="h-5 w-5" /></button>
                                    </>
                                )}
                                {canUpload && (
                                    <button onClick={() => fileInputRef.current?.click()} className="btn-primary h-10 md:h-11 px-4 md:px-8 flex items-center justify-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-2xl shadow-primary/20 border border-white/10 ml-2 rounded-[1.25rem]">
                                        <Upload className="h-4 w-4" />
                                        <span className="hidden xs:inline">Deploy Media</span>
                                        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 md:px-8 pt-6 md:pt-10 pb-40">
                <div className="max-w-7xl mx-auto">
                    {/* Visual Folders Grid - Premium Density */}
                    {folders.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12">
                            {folders.map(f => (
                                <div
                                    key={f.id}
                                    onClick={() => setCurrentFolderId(f.id)}
                                    className={`group relative glass-panel p-4 md:p-6 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer border transition-all duration-500 ${selectedFolders.has(f.id)
                                        ? 'border-primary bg-primary/10 ring-4 ring-primary/10 scale-[0.98] shadow-2xl z-20'
                                        : 'border-white/5 active:scale-[0.98] md:hover:border-white/20 bg-bg-surface/30'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-3 left-3 z-10 h-5 w-5 rounded-lg flex items-center justify-center transition-all border ${selectedFolders.has(f.id) ? 'bg-primary border-primary scale-100 shadow-lg' : (isSelecting ? 'opacity-100 scale-100 bg-white/10 border-white/20' : 'opacity-100 md:opacity-0 scale-90 md:scale-50 bg-black/20 border-white/10 lg:group-hover:opacity-100 lg:group-hover:scale-100')}`}
                                        onClick={e => { e.stopPropagation(); const n = new Set(selectedFolders); if (n.has(f.id)) n.delete(f.id); else n.add(f.id); setSelectedFolders(n); }}
                                    >
                                        <Check className={`h-3 w-3 text-white transition-opacity ${selectedFolders.has(f.id) ? 'opacity-100' : 'opacity-0'}`} />
                                    </div>
                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${selectedFolders.has(f.id) ? 'bg-primary/20' : 'bg-primary/5 group-hover:bg-primary/10'}`}>
                                        <Folder className={`h-6 w-6 md:h-8 md:w-8 transition-colors ${selectedFolders.has(f.id) ? 'text-primary' : 'text-text-tertiary group-hover:text-primary'}`} />
                                    </div>
                                    <span className="text-[11px] font-black text-white uppercase tracking-tight truncate w-full text-center px-1">{f.name}</span>
                                    {isAdmin && (
                                        <div className="absolute bottom-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-30">
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    const fakeSelected = new Set([f.id]);
                                                    const filesInFolder = files.filter(file => file.folder_id === f.id);
                                                    // This is a shortcut for the user to download the folder they are looking at
                                                    // For a more robust solution, we'd trigger a specific folder-zip logic
                                                    alert("Starting Folder Archive...");
                                                    // Trigger bulk logic with just this folder
                                                    const origFileSelection = new Set(selectedFiles);
                                                    const origFolderSelection = new Set(selectedFolders);
                                                    setSelectedFolders(new Set([f.id]));
                                                    setSelectedFiles(new Set());
                                                    setTimeout(() => {
                                                        downloadSelection();
                                                        setSelectedFiles(origFileSelection);
                                                        setSelectedFolders(origFolderSelection);
                                                    }, 100);
                                                }}
                                                className="p-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all border border-primary/20 shadow-xl"
                                                title="Download Folder"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); setEditingFolder(f); setNewFolderName(f.name); setShowFolderModal(true); }} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all shadow-xl"><Edit className="h-3.5 w-3.5 text-text-tertiary" /></button>
                                            <button onClick={e => { e.stopPropagation(); if (window.confirm('Delete this folder and all contents?')) handleDeleteFolder(f.id); }} className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/10 shadow-xl"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Files Grid - Optimized for High-End Viewing */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {files.map(file => (
                            <FileCard
                                key={file.id}
                                file={file}
                                isSelected={selectedFiles.has(file.id)}
                                isSelecting={isSelecting}
                                isLiked={likedFiles.has(file.id)}
                                onLike={toggleLike}
                                onDelete={handleDeleteFile}
                                isOwner={isOwner || isAdmin}
                                socialEnabled={socialProvisioned}
                                onToggle={(id) => {
                                    const next = new Set(selectedFiles);
                                    if (next.has(id)) next.delete(id); else next.add(id);
                                    setSelectedFiles(next);
                                }}
                                onPreview={(f, e) => {
                                    if (isSelecting) {
                                        const next = new Set(selectedFiles);
                                        if (next.has(f.id)) next.delete(f.id); else next.add(f.id);
                                        setSelectedFiles(next);
                                    } else {
                                        setPreviewFile(f);
                                    }
                                }}
                            />
                        ))}
                    </div>

                    {files.length === 0 && folders.length === 0 && (
                        <div className="h-[50vh] flex flex-col items-center justify-center text-text-tertiary/20">
                            <Globe className="h-16 w-16 mb-4 animate-pulse opacity-10" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">This folder is empty</span>
                        </div>
                    )}
                </div>
            </div>

            {/* SYNC WIDGET */}
            {operation && (
                <div className="fixed bottom-6 right-6 z-[100] w-[calc(100%-48px)] max-w-[320px] glass-panel bg-bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in translate-y-0">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                {operation.progress < 100 ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Check className="h-4 w-4 text-green-500" />}
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest block">{operation.type}</span>
                                <span className="text-[9px] text-text-tertiary font-bold uppercase tracking-tighter block mt-0.5">{operation.count} Elements</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                            <span className="text-text-tertiary">{operation.progress === 100 ? 'Process Complete' : 'Processing...'}</span>
                            <span className="text-primary">{operation.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" style={{ width: `${operation.progress}%` }} />
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW MODAL */}
            {previewFile && (
                <div className="fixed inset-0 z-[1000] bg-bg-base/98 backdrop-blur-3xl flex flex-col animate-fade-in" onClick={() => setPreviewFile(null)}>
                    {/* Floating Header Overlay */}
                    <div className="absolute top-0 inset-x-0 p-4 md:p-8 flex justify-between items-center z-[110] gap-4 pointer-events-none">
                        <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none pointer-events-auto">
                            <div className="bg-black/20 hover:bg-black/40 px-4 md:px-6 py-2 md:py-2.5 rounded-full border border-white/10 backdrop-blur-xl min-w-0 transition-all">
                                <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest truncate block">{previewFile.file_name}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 md:gap-3 shrink-0 pointer-events-auto">
                            {socialProvisioned && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleLike(previewFile.id); }}
                                    className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl border transition-all flex items-center justify-center backdrop-blur-xl ${likedFiles.has(previewFile.id) ? 'bg-primary border-primary text-white scale-110 shadow-lg' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                >
                                    <Heart className={`h-5 w-5 ${likedFiles.has(previewFile.id) ? 'fill-current' : ''}`} />
                                </button>
                            )}
                            {isAdmin && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Delete this item permanently?')) {
                                            handleDeleteFile(previewFile.id, previewFile.storage_path);
                                            setPreviewFile(null);
                                        }
                                    }}
                                    className="h-10 w-10 md:h-12 md:w-12 bg-rose-500/10 text-rose-500 rounded-xl md:rounded-2xl border border-rose-500/20 active:scale-90 transition-all flex items-center justify-center hover:bg-rose-500 hover:text-white backdrop-blur-xl"
                                >
                                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                                </button>
                            )}
                            {canDownload && <button onClick={(e) => { e.stopPropagation(); saveAs(previewFile.file_url, previewFile.file_name); }} className="h-10 w-10 md:h-12 md:w-12 bg-primary text-white rounded-xl md:rounded-2xl shadow-xl active:scale-90 transition-all flex items-center justify-center"><Download className="h-4 w-4 md:h-5 md:w-5" /></button>}
                            <button onClick={() => setPreviewFile(null)} className="h-10 w-10 md:h-12 md:w-12 bg-white/10 text-white rounded-xl md:rounded-2xl border border-white/20 active:scale-90 transition-all flex items-center justify-center hover:bg-white/20 backdrop-blur-xl"><X className="h-5 w-5 md:h-6 md:w-6" /></button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-2 md:p-4 relative overflow-hidden">
                        {/* Ambient Background Blur for Desktop Premium Feel */}
                        <div className="hidden md:block absolute inset-0 z-0">
                            {previewFile.file_type === 'image' ? (
                                <img src={previewFile.file_url} className="w-full h-full object-cover blur-[120px] opacity-40 saturate-150" alt="" />
                            ) : (
                                <div className="w-full h-full bg-primary/10 blur-[120px]" />
                            )}
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleNav('prev'); }}
                            className="absolute left-2 md:left-12 p-3 md:p-5 text-white/50 hover:text-white hover:bg-black/20 rounded-full transition-all z-[110] active:scale-90 bg-black/5 backdrop-blur-md border border-white/5"
                        >
                            <ChevronLeft className="h-6 w-6 md:h-12 md:w-12" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNav('next'); }}
                            className="absolute right-2 md:right-12 p-3 md:p-5 text-white/50 hover:text-white hover:bg-black/20 rounded-full transition-all z-[110] active:scale-90 bg-black/5 backdrop-blur-md border border-white/5"
                        >
                            <ChevronRight className="h-6 w-6 md:h-12 md:w-12" />
                        </button>

                        <div className="w-full h-full flex items-center justify-center animate-zoom-in relative z-50 pt-20 pb-10 px-4 md:px-20" onClick={e => e.stopPropagation()}>
                            {(previewFile.file_type === 'video' || (previewFile.file_url && previewFile.file_url.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/))) ? (
                                <div className="relative w-full h-full flex items-center justify-center max-w-[95vw] bg-black/40 rounded-[2rem] overflow-hidden">
                                    <video
                                        key={previewFile.id}
                                        controls
                                        autoPlay
                                        muted
                                        preload="auto"
                                        className="max-w-full max-h-full bg-black shadow-2xl rounded-2xl md:rounded-[2rem] object-contain"
                                        playsInline
                                    >
                                        <source src={previewFile.file_url} type="video/mp4" />
                                        <source src={previewFile.file_url} type="video/quicktime" />
                                        <source src={previewFile.file_url} type="video/webm" />
                                        <source src={previewFile.file_url} />
                                        Your browser does not support high-fidelity video playback.
                                    </video>
                                </div>
                            ) : (
                                <div className="relative group max-w-[95vw] h-full flex items-center justify-center">
                                    <img
                                        src={previewFile.file_url}
                                        className="max-w-full max-h-[92vh] object-contain rounded-lg md:rounded-[2.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] border border-white/10 transition-transform duration-500"
                                        alt=""
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                title="Purge Selection?"
                message={`Identified ${selectedFiles.size + selectedFolders.size} items for permanent removal. This action bypasses recovery buffers.`}
                confirmText="Execute Purge"
            />

            {showShareModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-base/90 backdrop-blur-2xl animate-fade-in" onClick={() => setShowShareModal(false)}>
                    <div className="glass-panel p-6 md:p-14 rounded-[2.5rem] w-full max-w-[320px] relative text-center border-white/5 shadow-3xl" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                        <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 p-2 text-text-tertiary hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 z-20"><X className="h-5 w-5" /></button>
                        <h3 className="text-xl font-black text-white mb-6 md:mb-8 uppercase italic tracking-tighter relative z-10 pt-4">Share Access</h3>
                        <div className="bg-white p-3 rounded-[2rem] flex items-center justify-center mb-8 shadow-3xl mx-auto w-fit border-[4px] border-primary/20 relative z-10">
                            <QRCodeSVG value={`${window.location.origin}/e/${event.event_code}`} size={150} />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                                <div className="text-[9px] uppercase text-text-tertiary mb-1 font-black tracking-[0.3em]">Event Code</div>
                                <div className="text-xl font-mono font-black text-primary tracking-[0.4em]">{event.event_code}</div>
                            </div>
                            <button onClick={() => {
                                const t = `Vault: ${event.name}\nLink: ${window.location.origin}/e/${event.event_code}\nCode: ${event.event_code}\nPasskey: ${event.passkey || 'None'}`;
                                navigator.clipboard.writeText(t);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }} className="w-full btn-primary h-16 rounded-[2rem] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-2xl shadow-primary/20 border border-white/10 mt-4">
                                {copied ? <><Check className="h-5 w-5" /> Link Copied</> : <><Copy className="h-5 w-5" /> Copy Link</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFolderModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-base/90 backdrop-blur-2xl animate-fade-in" onClick={() => setShowFolderModal(false)}>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const { error } = editingFolder
                            ? await supabase.from('folders').update({ name: newFolderName }).eq('id', editingFolder.id)
                            : await supabase.from('folders').insert({ event_id: id, parent_id: currentFolderId, name: newFolderName });
                        if (!error) { setShowFolderModal(false); await loadContent(); }
                    }} className="glass-panel p-10 rounded-[2.5rem] w-full max-w-sm border-white/10 shadow-3xl text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -ml-16 -mt-16" />
                        <h3 className="text-xl font-black text-white mb-8 uppercase italic tracking-tighter relative z-10">{editingFolder ? 'Rename Folder' : 'New Folder'}</h3>
                        <input autoFocus className="input-field h-14 mb-8 text-center text-xl font-black bg-white/5 border-white/10 placeholder:opacity-20 relative z-10" placeholder="Folder Name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} required />
                        <div className="flex gap-4 relative z-10">
                            <button type="button" onClick={() => setShowFolderModal(false)} className="btn-secondary h-12 flex-1 text-[10px] font-black uppercase tracking-widest bg-transparent border-white/10">Cancel</button>
                            <button type="submit" className="btn-primary h-12 flex-1 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Apply</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
