import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { type Course, type Lesson, type Profile } from '../types';
import { Lock, PlayCircle, MessageCircle, FileText, Download } from 'lucide-react';
import { CoursePlayer } from '../components/CoursePlayer';

export const CourseDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [teacher, setTeacher] = useState<Profile | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Simple enrollment check logic (for MVP: logged in = enrolled)
    const isEnrolled = !!user;

    useEffect(() => {
        if (id) fetchCourseData();
    }, [id]);

    useEffect(() => {
        if (activeLesson && isEnrolled) {
            if (activeLesson.video_url && !activeLesson.mux_playback_id) {
                getVideoUrl(activeLesson.video_url);
            } else {
                setVideoUrl(null);
            }
            if (activeLesson.pdf_url) {
                getPdfUrl(activeLesson.pdf_url);
            } else {
                setPdfUrl(null);
            }
        }
    }, [activeLesson, isEnrolled]);

    const fetchCourseData = async () => {
        try {
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id!)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData as Course);

            // Fetch teacher
            const { data: teacherData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', courseData.teacher_id)
                .single();
            setTeacher(teacherData as Profile);

            // Fetch lessons
            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .eq('course_id', id!)
                .order('order_index');

            if (lessonsError) throw lessonsError;
            setLessons(lessonsData as Lesson[] || []);

            if (lessonsData && lessonsData.length > 0) {
                setActiveLesson(lessonsData[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getVideoUrl = async (path: string) => {
        try {
            const { data, error } = await supabase.storage.from('videos').createSignedUrl(path, 3600); // 1 hour expiry
            if (error) throw error;
            setVideoUrl(data.signedUrl);
        } catch (error) {
            console.error('Error getting video URL:', error);
        }
    };

    const getPdfUrl = async (path: string) => {
        try {
            // Create signed URL for download
            const { data, error } = await supabase.storage.from('materials').createSignedUrl(path, 3600, {
                download: true
            });
            if (error) throw error;
            setPdfUrl(data.signedUrl);
        } catch (error) {
            console.error('Error getting PDF URL:', error);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;
    if (!course) return <div style={{ padding: '2rem' }}>Curso no encontrado.</div>;

    return (
        <div className="detail-grid">

            {/* Main Content: Video Player */}
            <div>
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', background: '#000' }}>
                    {isEnrolled && activeLesson ? (
                        <div style={{ position: 'relative' /* Aspect ratio handled by player or container */ }}>
                            {activeLesson.mux_playback_id ? (
                                <CoursePlayer
                                    playbackId={activeLesson.mux_playback_id}
                                    title={activeLesson.title}
                                    courseId={activeLesson.course_id}
                                />
                            ) : videoUrl ? (
                                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                    <video
                                        controls
                                        src={videoUrl}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                        controlsList="nodownload"
                                        onContextMenu={e => e.preventDefault()}
                                    />
                                </div>
                            ) : (
                                <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    {activeLesson.mux_playback_id ? 'Cargando Mux...' : 'Cargando Video...'}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'white' }}>
                            <Lock size={48} />
                            <h3>Inicia sesión para ver este curso</h3>
                            <Link to="/login" className="btn btn-primary">Ingresar para Acceder</Link>
                        </div>
                    )}
                </div>

                {/* Lesson Description & PDF */}
                {isEnrolled && activeLesson && (
                    <div className="card" style={{ marginBottom: '2rem', borderColor: 'var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{activeLesson.title}</h2>
                                {activeLesson.description ? (
                                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{activeLesson.description}</p>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No hay descripción disponible para esta lección.</p>
                                )}
                            </div>
                            {pdfUrl && (
                                <a href={pdfUrl} className="btn btn-outline" download style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
                                    <Download size={18} /> Descargar PDF
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <div className="card">
                    <h1 style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>{course.title}</h1>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>{course.description}</p>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Instructor</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {teacher?.full_name?.[0] || 'T'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{teacher?.full_name}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Instructor del Curso</div>
                            </div>
                            {teacher?.whatsapp_number && (
                                <a
                                    href={`https://wa.me/${teacher.whatsapp_number}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-outline"
                                    style={{ marginLeft: 'auto', color: '#10b981', borderColor: '#10b981' }}
                                >
                                    <MessageCircle size={20} />
                                    Chat en WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar: Lessons */}
            <div className="card" style={{ position: 'sticky', top: '100px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>Contenido del Curso</h3>
                <div style={{ overflowY: 'auto' }}>
                    {lessons.map((lesson, idx) => (
                        <div
                            key={lesson.id}
                            onClick={() => isEnrolled && setActiveLesson(lesson)}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid var(--border)',
                                cursor: isEnrolled ? 'pointer' : 'default',
                                background: activeLesson?.id === lesson.id ? 'var(--surface-alt)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                opacity: isEnrolled ? 1 : 0.6
                            }}
                        >
                            {isEnrolled ? (
                                <PlayCircle size={20} color={activeLesson?.id === lesson.id ? 'var(--primary)' : 'var(--text-muted)'} />
                            ) : (
                                <Lock size={16} />
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lección {idx + 1}</div>
                                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{lesson.title}</div>
                                {lesson.pdf_url && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--secondary)' }}><FileText size={12} /> Material PDF</div>}
                            </div>
                        </div>
                    ))}
                    {lessons.length === 0 && (
                        <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Aún no hay lecciones subidas.</div>
                    )}
                </div>
            </div>

        </div>
    );
};
