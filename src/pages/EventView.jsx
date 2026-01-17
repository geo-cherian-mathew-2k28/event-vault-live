import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
    Loader2, Lock, Upload, File, Trash2, Download,
    Settings, Share2, Copy, Check, X, QrCode, Search,
    Grid, List as ListIcon, Folder, MoreVertical,
    ChevronLeft, ChevronRight, CheckSquare, Maximize2
} from 'lucide-react';

export default function EventView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joinPasskey, setJoinPasskey] = useState('');
    const [joining, setJoining] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter files based on search
    const filteredFiles = files.filter(f =>
        f.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Selection Mode
    const [selectedFiles, setSelectedFiles] = useState(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Preview Mode
    const [previewFile, setPreviewFile] = useState(null);

    // Share Modal
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        loadEvent();
    }, [id, user]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (previewFile) {
                if (e.key === 'ArrowLeft') navigatePreview(-1);
                if (e.key === 'ArrowRight') navigatePreview(1);
                if (e.key === 'Escape') setPreviewFile(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewFile, files]);

    const loadEvent = async () => {
        try {
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single();

            if (!eventError && eventData) {
                setEvent(eventData);
                const { data: fileData } = await supabase
                    .from('media_files')
                    .select('*')
                    .eq('event_id', id)
                    .order('created_at', { ascending: false });
                setFiles(fileData || []);
            }
        } catch (err) {
            console.log('Access denied initially');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setJoining(true);
        try {
            if (!user) {
                navigate('/login', { state: { from: location } });
                return;
            }

            const { data, error } = await supabase.rpc('join_event', {
                input_code: joinCode.toUpperCase(),
                input_passkey: joinPasskey
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.message);

            setLoading(true);
            await loadEvent();
        } catch (error) {
            alert(error.message);
        } finally {
            setJoining(false);
        }
    };

    const handleFileUpload = async (e) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        setUploading(true);
        try {
            for (const file of fileList) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${id}/${fileName}`;

                // Simpler upload call
                const { error: uploadError } = await supabase.storage
                    .from('media')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

                await supabase.from('media_files').insert({
                    event_id: id,
                    uploader_id: user.id,
                    file_url: publicUrl,
                    storage_path: filePath,
                    file_type: file.type.startsWith('image/') ? 'image' : 'file',
                    file_name: file.name,
                    size_bytes: file.size
                });
            }
            loadEvent();
        } catch (error) {
            console.error(error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteFile = async (e, file) => {
        e.stopPropagation();
        if (!confirm('Delete file permanently?')) return;
        performDelete([file]);
    };

    const performDelete = async (filesToDelete) => {
        try {
            const paths = filesToDelete.map(f => f.storage_path);
            const ids = filesToDelete.map(f => f.id);

            await supabase.storage.from('media').remove(paths);
            await supabase.from('media_files').delete().in('id', ids);

            setFiles(files.filter(f => !ids.includes(f.id)));
            setSelectedFiles(new Set());
            setPreviewFile(null); // Close preview if open
        } catch (error) {
            alert('Delete failed');
        }
    };

    const toggleSelection = (e, fileId) => {
        e.stopPropagation();
        const newSet = new Set(selectedFiles);
        if (newSet.has(fileId)) {
            newSet.delete(fileId);
        } else {
            newSet.add(fileId);
        }
        setSelectedFiles(newSet);
        setIsSelectionMode(newSet.size > 0);
    };

    const handleBulkDelete = () => {
        if (!confirm(`Delete ${selectedFiles.size} items?`)) return;
        const filesToDelete = files.filter(f => selectedFiles.has(f.id));
        performDelete(filesToDelete);
    }

    const navigatePreview = (direction) => {
        if (!previewFile) return;
        // Filter only images for navigation
        const images = files.filter(f => f.file_type === 'image');
        const currentIndex = images.findIndex(f => f.id === previewFile.id);
        if (currentIndex === -1) return;

        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < images.length) {
            setPreviewFile(images[newIndex]);
        }
    };

    const getShareUrl = () => `${window.location.origin}/e/${event?.event_code}`;

    const copyLink = () => {
        navigator.clipboard.writeText(getShareUrl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="min-h-screen bg-bg-base flex items-center justify-center"><Loader2 className="animate-spin text-text-primary" /></div>;

    // PRIVATE / JOIN SCREEN
    if (!event) {
        return (
            <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl p-8 shadow-card">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-bg-subtle rounded-full flex items-center justify-center mb-4 border border-border-subtle">
                            <Lock className="h-5 w-5 text-text-secondary" />
                        </div>
                        <h2 className="text-xl font-semibold text-text-primary">Restricted Access</h2>
                        <p className="text-text-secondary mt-2">Enter credentials to access this workspace.</p>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="input-label">Access Code</label>
                            <input
                                type="text"
                                className="input-field text-center font-mono uppercase tracking-widest text-lg"
                                placeholder="XXXXXX"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                        <div>
                            <label className="input-label">Passkey</label>
                            <input
                                type="password"
                                className="input-field text-center"
                                placeholder="••••••"
                                value={joinPasskey}
                                onChange={e => setJoinPasskey(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={joining} className="btn-primary w-full justify-center">
                            {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Authenticate Access'}
                        </button>
                    </form>
                    {!user && (
                        <div className="mt-6 text-center">
                            <button onClick={() => navigate('/login')} className="text-sm text-text-secondary hover:text-text-primary underline">
                                Log in as Administrator
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const isOwner = user?.id === event.owner_id;
    const canUpload = isOwner || event.allow_uploads;

    return (
        <div className="min-h-screen bg-bg-base pt-16 flex flex-col">
            {/* Toolbar / Header */}
            <div className="bg-bg-base border-b border-border-subtle px-4 sm:px-6 h-16 flex items-center justify-between sticky top-16 z-20">
                {selectedFiles.size > 0 ? (
                    <div className="flex items-center gap-4 w-full animate-fade-in">
                        <button onClick={() => { setSelectedFiles(new Set()); setIsSelectionMode(false); }} className="p-2 hover:bg-bg-surface rounded-full">
                            <X className="h-5 w-5 text-text-secondary" />
                        </button>
                        <span className="font-semibold text-text-primary">{selectedFiles.size} selected</span>

                        <div className="ml-auto flex items-center gap-2">
                            <button
                                onClick={async () => {
                                    const count = selectedFiles.size;
                                    if (!confirm(`Download ${count} files as ZIP?`)) return;

                                    const JSZip = (await import('jszip')).default;
                                    const { saveAs } = await import('file-saver');
                                    const zip = new JSZip();
                                    const folder = zip.folder(`Selected_Files`);

                                    const filesToDownload = files.filter(f => selectedFiles.has(f.id));

                                    for (const file of filesToDownload) {
                                        try {
                                            const response = await fetch(file.file_url);
                                            const blob = await response.blob();
                                            folder.file(file.file_name, blob);
                                        } catch (e) {
                                            console.error("Skipping", file.file_name);
                                        }
                                    }

                                    const content = await zip.generateAsync({ type: "blob" });
                                    saveAs(content, `selected_files.zip`);
                                }}
                                className="btn-secondary h-9 px-3"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Download Selected</span>
                            </button>

                            {(isOwner || canUpload) && (
                                <button onClick={handleBulkDelete} className="btn-secondary text-danger border-danger/30 hover:bg-danger/10 hover:border-danger hover:text-danger">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Delete</span>
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className="p-2 bg-bg-surface border border-border-subtle rounded-md">
                                <Folder className="h-5 w-5 text-text-tertiary" />
                            </div>
                            <div>
                                <h1 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                    {event.name}
                                    {!event.is_public && <Lock className="h-3 w-3 text-text-tertiary" />}
                                </h1>
                                <div className="text-xs text-text-tertiary truncate max-w-[200px] sm:max-w-md">
                                    {files.length} items • Last updated today
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Share */}
                            <button onClick={() => setShowShareModal(true)} className="btn-secondary h-9 px-3">
                                <Share2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Share</span>
                            </button>

                            {/* Download All (If items exist) */}
                            {files.length > 0 && (
                                <button
                                    onClick={async () => {
                                        if (!confirm('Download all files as ZIP?')) return;
                                        const JSZip = (await import('jszip')).default;
                                        const { saveAs } = await import('file-saver');
                                        const zip = new JSZip();
                                        const folder = zip.folder(event.name || 'EventFiles');

                                        let count = 0;
                                        for (const file of files) {
                                            try {
                                                const response = await fetch(file.file_url);
                                                const blob = await response.blob();
                                                folder.file(file.file_name, blob);
                                                count++;
                                            } catch (e) {
                                                console.error("Skipping file", file.file_name);
                                            }
                                        }

                                        if (count > 0) {
                                            const content = await zip.generateAsync({ type: "blob" });
                                            saveAs(content, `${event.name || 'archive'}.zip`);
                                        }
                                    }}
                                    className="btn-secondary h-9 px-3"
                                    title="Download All as ZIP"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                            )}

                            {/* Settings (Owner) */}
                            {isOwner && (
                                <button onClick={() => navigate(`/events/${id}/edit`)} className="btn-secondary h-9 px-3">
                                    <Settings className="h-4 w-4" />
                                </button>
                            )}

                            {/* Upload */}
                            {canUpload && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="hidden md:flex btn-primary h-9 px-3"
                                    >
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        <span className="hidden sm:inline">Upload</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Sub-toolbar (Search/View) */}
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        className="w-full bg-transparent border border-border-subtle rounded-md pl-9 pr-3 py-1.5 text-sm text-text-primary focus:bg-bg-surface focus:border-border-highlight outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center border border-border-subtle rounded-md p-0.5 bg-bg-surface">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-bg-highlight text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}>
                        <Grid className="h-4 w-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-bg-highlight text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}>
                        <ListIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* File Content */}
            <div className="flex-1 px-4 sm:px-6 pb-12 overflow-y-auto">
                {filteredFiles.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-xl mt-4">
                        <div className="w-12 h-12 bg-bg-surface rounded-full flex items-center justify-center mb-3">
                            <Upload className="h-5 w-5 text-text-tertiary" />
                        </div>
                        <p className="text-text-secondary text-sm font-medium">
                            {searchTerm ? `No results for "${searchTerm}"` : 'This workspace is empty'}
                        </p>
                        {canUpload && !searchTerm && <p className="text-text-tertiary text-xs mt-1">Upload files to get started</p>}
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="drive-grid">
                                {filteredFiles.map(file => (
                                    <div
                                        key={file.id}
                                        onClick={() => isSelectionMode ? toggleSelection({ stopPropagation: () => { } }, file.id) : setPreviewFile(file)}
                                        className={`group relative bg-bg-surface border rounded-lg overflow-hidden transition-all cursor-pointer aspect-[4/3] flex flex-col ${selectedFiles.has(file.id) ? 'border-brand ring-1 ring-brand' : 'border-border-subtle hover:border-border-highlight hover:shadow-sm'}`}
                                    >
                                        {/* Selection Checkbox */}
                                        <div
                                            className={`absolute top-2 left-2 z-10 p-1 rounded-md transition-opacity ${selectedFiles.has(file.id) ? 'opacity-100 bg-brand text-bg-base' : 'opacity-0 group-hover:opacity-100 bg-black/40 text-white hover:bg-black/60'}`}
                                            onClick={(e) => toggleSelection(e, file.id)}
                                        >
                                            <CheckSquare className="h-4 w-4" />
                                        </div>

                                        {/* File Preview */}
                                        <div className="flex-1 bg-bg-subtle relative overflow-hidden">
                                            {file.file_type === 'image' ? (
                                                <img src={file.file_url} className="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <File className="h-10 w-10 text-text-tertiary" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className={`h-9 px-3 flex items-center justify-between border-t border-border-subtle ${selectedFiles.has(file.id) ? 'bg-brand/5' : 'bg-bg-surface'}`}>
                                            <span className="text-xs text-text-secondary truncate max-w-[90%]">{file.file_name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-border-subtle rounded-lg overflow-hidden bg-bg-surface">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-bg-subtle border-b border-border-subtle text-text-tertiary font-medium">
                                        <tr>
                                            <th className="px-4 py-3 font-normal w-10">
                                                <button onClick={() => {
                                                    if (selectedFiles.size === files.length) setSelectedFiles(new Set());
                                                    else setSelectedFiles(new Set(files.map(f => f.id)));
                                                }}>
                                                    <CheckSquare className={`h-4 w-4 ${selectedFiles.size > 0 ? 'text-brand' : 'text-text-tertiary'}`} />
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 font-normal">Name</th>
                                            <th className="px-4 py-3 font-normal w-32">Size</th>
                                            <th className="px-4 py-3 font-normal w-24 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-subtle">
                                        {files.map(file => (
                                            <tr
                                                key={file.id}
                                                className={`hover:bg-bg-subtle transition-colors cursor-pointer ${selectedFiles.has(file.id) ? 'bg-brand/5' : ''}`}
                                                onClick={() => setPreviewFile(file)}
                                            >
                                                <td className="px-4 py-3" onClick={(e) => toggleSelection(e, file.id)}>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedFiles.has(file.id) ? 'bg-brand border-brand' : 'border-text-tertiary'}`}>
                                                        {selectedFiles.has(file.id) && <Check className="h-3 w-3 text-bg-base" />}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 flex items-center gap-3">
                                                    {file.file_type === 'image' ? <File className="h-4 w-4 text-accent" /> : <File className="h-4 w-4 text-text-tertiary" />}
                                                    <span className="text-text-primary truncate max-w-xs">{file.file_name}</span>
                                                </td>
                                                <td className="px-4 py-3 text-text-secondary text-xs font-mono">
                                                    {(file.size_bytes / 1024 / 1024).toFixed(2)} MB
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <a href={file.file_url} download onClick={e => e.stopPropagation()} className="text-text-tertiary hover:text-text-primary inline-block"><Download className="h-4 w-4" /></a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Full Screen Image Preview Modal */}
            {previewFile && previewFile.file_type === 'image' && (
                <div className="fixed inset-0 z-50 bg-bg-base/95 backdrop-blur-md flex flex-col animate-fade-in">
                    {/* Preview Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                        <div className="text-text-primary font-medium truncate max-w-md">{previewFile.file_name}</div>
                        <div className="flex items-center gap-3">
                            <a
                                href={previewFile.file_url}
                                download
                                className="btn-secondary h-9 bg-transparent border-white/20 text-white hover:bg-white/10"
                            >
                                <Download className="h-4 w-4" />
                            </a>
                            {(isOwner || (user?.id === previewFile.uploader_id && canUpload)) && (
                                <button
                                    onClick={(e) => handleDeleteFile(e, previewFile)}
                                    className="btn-secondary h-9 bg-transparent border-white/20 text-danger hover:bg-danger/10 hover:border-danger hover:text-danger"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                            <button onClick={() => setPreviewFile(null)} className="p-2 text-text-tertiary hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Main Preview Area */}
                    <div className="flex-1 w-full h-full flex items-center justify-center relative p-2 md:p-8 overflow-hidden group">
                        {/* Left Arrow */}
                        <button
                            onClick={(e) => { e.stopPropagation(); navigatePreview(-1); }}
                            className="absolute left-2 md:left-4 p-2 md:p-3 rounded-full bg-black/50 text-white/50 hover:bg-black/80 hover:text-white transition-all backdrop-blur-sm z-10"
                        >
                            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                        </button>

                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={previewFile.file_url}
                                className="w-auto h-auto max-w-full max-h-full object-contain select-none shadow-2xl rounded-sm"
                                alt="Preview"
                            />
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={(e) => { e.stopPropagation(); navigatePreview(1); }}
                            className="absolute right-2 md:right-4 p-2 md:p-3 rounded-full bg-black/50 text-white/50 hover:bg-black/80 hover:text-white transition-all backdrop-blur-sm z-10"
                        >
                            <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Floating Action Button (Upload) */}
            {canUpload && !selectedFiles.size && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-brand text-bg-base shadow-xl flex items-center justify-center z-40 active:scale-95 transition-transform"
                >
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-8 w-8" />}
                </button>
            )}

            {/* Share Modal (Same as before) */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-bg-surface border border-border-highlight rounded-xl w-full max-w-sm shadow-card p-6 relative">
                        <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary p-2">
                            <X className="h-6 w-6" />
                        </button>

                        <h3 className="text-lg font-semibold text-text-primary mb-1">Share Workspace</h3>
                        <p className="text-sm text-text-secondary mb-6">Invite others to collaborate or view.</p>

                        <div className="flex justify-center mb-6">
                            <div className="p-3 bg-white rounded-lg">
                                <QRCodeSVG value={getShareUrl()} size={140} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-bg-base border border-border-subtle rounded-md p-3 mb-4">
                            <input readOnly value={getShareUrl()} className="bg-transparent text-sm text-text-secondary w-full outline-none" />
                            <button onClick={copyLink} className="text-brand hover:text-white p-2">
                                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>

                        <div className="text-center">
                            <div className="text-xs text-text-tertiary uppercase tracking-wider mb-1">Access Code</div>
                            <div className="text-xl font-mono font-bold text-text-primary tracking-widest">{event.event_code}</div>
                            {/* Security Note for Owners */}
                            {isOwner && !event.is_public && (
                                <p className="text-[10px] text-amber-500 mt-2">
                                    <Lock className="h-3 w-3 inline mr-1" />
                                    Review settings to manage passkeys
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
