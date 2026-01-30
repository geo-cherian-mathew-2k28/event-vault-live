import React from 'react';
import { useUploads } from '../context/UploadContext';
import { Loader2, Check, X, ChevronUp, ChevronDown, FileText } from 'lucide-react';

export default function UploadWidget() {
    const { uploads } = useUploads();
    const [isMinimized, setIsMinimized] = React.useState(false);

    if (uploads.length === 0) return null;

    const completedCount = uploads.filter(u => u.status === 'complete').length;
    const totalCount = uploads.length;

    return (
        <div className={`fixed bottom-4 md:bottom-6 left-4 md:left-auto md:right-6 z-[2000] w-[calc(100vw-32px)] md:w-80 glass-panel rounded-[2rem] shadow-3xl border border-white/10 overflow-hidden transition-all duration-500 ${isMinimized ? 'h-16' : 'h-auto max-h-[400px]'}`}>
            {/* Header */}
            <div className="p-4 bg-bg-surface/90 border-b border-white/5 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        {completedCount === totalCount ? <Check className="h-4 w-4 text-green-500" /> : <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest block">
                            {completedCount === totalCount ? 'Uploads Complete' : `Uploading ${totalCount} items`}
                        </span>
                        <span className="text-[9px] text-text-tertiary font-bold uppercase tracking-tighter block mt-0.5">
                            {completedCount} of {totalCount} elements synced
                        </span>
                    </div>
                </div>
                <button className="text-text-tertiary hover:text-white transition-colors">
                    {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
            </div>

            {/* List */}
            {!isMinimized && (
                <div className="overflow-y-auto max-h-[330px] p-2 space-y-1">
                    {uploads.map(upload => (
                        <div key={upload.id} className="p-3 bg-white/[0.02] rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="h-9 w-9 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                                    {upload.status === 'complete' ? <Check className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4 text-primary animate-pulse" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] text-white font-bold truncate uppercase tracking-tighter">{upload.fileName}</span>
                                        <span className="text-[9px] font-black text-primary uppercase ml-2 tabular-nums">
                                            {upload.status === 'complete' ? 'READY' : `${upload.progress}%`}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 ease-out ${upload.status === 'error' ? 'bg-rose-500' : 'bg-primary'}`}
                                            style={{ width: `${upload.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-[8px] text-text-tertiary font-bold uppercase tracking-widest mt-1 block opacity-60">
                                        {upload.progress < 85 ? 'Deploying to Vault' : upload.progress < 95 ? 'Syncing Infrastructure' : upload.progress < 100 ? 'Finalizing Interface' : 'Asset Deployed'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
