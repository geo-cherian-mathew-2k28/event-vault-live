import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const UploadContext = createContext();

export function UploadProvider({ children }) {
    const [uploads, setUploads] = useState([]); // Array of { id, fileName, progress, status, eventId }

    const uploadFiles = useCallback(async (files, eventId, folderId, userId) => {
        const newUploads = Array.from(files).map(file => ({
            id: Math.random().toString(36).substring(2),
            fileName: file.name,
            progress: 0,
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
                const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type || 'application/octet-stream',
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                        setUploads(prev => prev.map(u =>
                            u.id === uploadId ? { ...u, progress: percent } : u
                        ));
                    }
                });

                if (uploadError) throw uploadError;

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

                setUploads(prev => prev.map(u =>
                    u.id === uploadId ? { ...u, status: 'complete', progress: 100 } : u
                ));

                // Clear completed upload after 5 seconds
                setTimeout(() => {
                    setUploads(prev => prev.filter(u => u.id !== uploadId));
                }, 5000);

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
