export type Role = 'student' | 'teacher' | 'admin';

export interface Profile {
    id: string;
    email: string;
    role: Role | 'admin';
    full_name?: string;
    avatar_url?: string;
    whatsapp_number?: string;
    is_approved?: boolean;
}

export interface Course {
    id: string;
    teacher_id: string;
    title: string;
    description: string;
    category: string;
    thumbnail_url: string;
    created_at: string;
    price?: number;
}

export interface Lesson {
    id: string;
    course_id: string;
    title: string;
    description?: string;
    video_url: string; // Keep for legacy, but we'll use mux_playback_id for new ones
    mux_playback_id?: string;
    pdf_url?: string;
    order_index: number;
}
