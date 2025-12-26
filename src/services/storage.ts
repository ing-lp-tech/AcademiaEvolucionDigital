import { supabase } from './supabase';

export const uploadFile = async (bucket: 'thumbnails' | 'videos' | 'materials', file: File, path: string) => {
    // Ensure we have a unique path to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    if (bucket === 'thumbnails') {
        // For thumbnails, we want the public URL
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    }

    // For videos, we return the path to generate signed URLs later
    return filePath;
};
