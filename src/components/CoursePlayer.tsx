import MuxPlayer from '@mux/mux-player-react';
import { useRef } from 'react';

interface CoursePlayerProps {
    playbackId: string;
    title: string;
    courseId: string;
}

export const CoursePlayer = ({ playbackId, title, courseId }: CoursePlayerProps) => {
    const videoRef = useRef<HTMLDivElement>(null);

    // Basic protection: prevent right-click context menu
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    return (
        <div
            onContextMenu={handleContextMenu}
            ref={videoRef}
            style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: '#000',
                aspectRatio: '16/9'
            }}
        >
            <MuxPlayer
                streamType="on-demand"
                playbackId={playbackId}
                metadata={{
                    video_id: playbackId,
                    video_title: title,
                    viewer_user_id: courseId, // Or user ID if available
                }}
                primaryColor="#ffffff"
                secondaryColor="#000000"
                accentColor="var(--primary)"
                style={{ height: '100%', width: '100%' }}
            />
        </div>
    );
};
