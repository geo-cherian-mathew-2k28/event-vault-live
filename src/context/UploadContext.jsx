import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const UploadContext = createContext();

export function UploadProvider({ children }) {
    const [uploads, setUploads] = useState([]); // Array of { id, fileName, progress, status, eventId }

    const uploadFiles = useCallback(async (files, eventId, folderId, userId) => {
        const newUploads = Array.from(files).map(file => ({
            id: Math.random().toString(36).substring(2),
            fileName: file.name,
            progress: 5, // Start with a small progress to show activity
            status: 'uploading',
            eventId
        }));

        setUploads(prev => [...prev, ...newUploads]);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const uploadId = newUploads[i].id;
            const fileName = `${Math.random().toString(36).substring(2)}-${file.name}`;
            const filePath = `${eventId}/${fileName}`;

            try {
                // Phase 1: Storage Upload (0% -> 85%)
                const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type || 'application/octet-stream',
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.floor((progressEvent.loaded / progressEvent.total) * 85);
                        setUploads(prev => prev.map(u =>
                            u.id === uploadId ? { ...u, progress: Math.max(u.progress, percent) } : u
                        ));
                    }
                });

                if (uploadError) throw uploadError;

                // Phase 2: Metadata Handshake (85% -> 95%)
                setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, progress: 92 } : u));

                const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
                const isImage = file.type.startsWith('image/') || file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|heic|avif)$/);
                const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().match(/\.(mp4|webm|mov|ogg|m4v|3gp|mkv)$/);

                const { error: dbError } = await supabase.from('media_files').insert({
                    event_id: eventId,
                    folder_id: folderId,
                    uploader_id: userId,
                    file_url: publicUrl,
                    storage_path: filePath,
                    file_name: file.name,
                    file_type: isImage ? 'image' : isVideo ? 'video' : 'file',
                    size_bytes: file.size
                });

                if (dbError) throw dbError;

                // Phase 3: UI Stabilization (95% -> 100%)
                // We add a brief artificial delay to allow Realtime events to propagate
                setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, progress: 98 } : u));
                await new Promise(r => setTimeout(r, 600));

                setUploads(prev => prev.map(u =>
                    u.id === uploadId ? { ...u, status: 'complete', progress: 100 } : u
                ));

                // Cleanup
                setTimeout(() => {
                    setUploads(prev => prev.filter(u => u.id !== uploadId));
                }, 4000);

            } catch (error) {
                console.error("Upload failed", error);
                setUploads(prev => prev.map(u =>
                    u.id === uploadId ? { ...u, status: 'error' } : u
                ));
            }
        }
    }, []);

    return (
        <UploadContext.Provider value={{ uploads, uploadFiles }}>
            {children}
        </UploadContext.Provider>
    );
}

export const useUploads = () => useContext(UploadContext);
