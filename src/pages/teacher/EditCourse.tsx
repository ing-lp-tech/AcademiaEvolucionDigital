import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { uploadFile } from '../../services/storage';
import { type Course, type Lesson } from '../../types';
import { Plus, Trash2, ArrowLeft, FileText, Video as VideoIcon } from 'lucide-react';

export const EditCourse = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'details' | 'curriculum'>('curriculum');

    // Lesson Form State
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [newLessonDesc, setNewLessonDesc] = useState('');
    const [muxPlaybackId, setMuxPlaybackId] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (id) fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id!)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData as Course);

            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .eq('course_id', id!)
                .order('order_index');

            if (lessonsError) throw lessonsError;
            setLessons(lessonsData as Lesson[] || []);
        } catch (error) {
            console.error('Error fetching course:', error);
            navigate('/teacher/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!muxPlaybackId) || !course) return;

        setUploading(true);
        try {
            // 1. Upload PDF if exists
            let pdfPath = null;
            if (pdfFile) {
                pdfPath = await uploadFile('materials', pdfFile, `course-${course.id}/lesson-pdf`);
            }

            const { error } = await supabase.from('lessons').insert({
                course_id: course.id,
                title: newLessonTitle,
                description: newLessonDesc,
                video_url: '', // Deprecated
                mux_playback_id: muxPlaybackId,
                pdf_url: pdfPath,
                order_index: lessons.length
            });

            if (error) throw error;

            // Reset Form
            setNewLessonTitle('');
            setNewLessonDesc('');
            setMuxPlaybackId('');
            setPdfFile(null);
            setIsAddingLesson(false);
            fetchCourseData();
        } catch (error: any) {
            alert('Error adding lesson: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Are you sure? This will delete the video too.')) return;
        try {
            const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
            if (error) throw error;
            setLessons(lessons.filter(l => l.id !== lessonId));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading editor...</div>;
    if (!course) return null;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <button onClick={() => navigate('/teacher/dashboard')} className="btn btn-ghost" style={{ marginBottom: '1rem', paddingLeft: 0 }}>
                <ArrowLeft size={18} /> Volver al Panel
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="title" style={{ marginBottom: 0 }}>Editar: {course.title}</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${activeTab === 'details' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Detalles
                    </button>
                    <button
                        className={`btn ${activeTab === 'curriculum' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('curriculum')}
                    >
                        Plan de Estudios
                    </button>
                </div>
            </div>

            {activeTab === 'curriculum' ? (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Lecciones ({lessons.length})</h3>
                        <button className="btn btn-primary" onClick={() => setIsAddingLesson(true)} disabled={isAddingLesson}>
                            <Plus size={18} /> Agregar Lección
                        </button>
                    </div>

                    {isAddingLesson && (
                        <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                            <h4 style={{ margin: '0 0 1rem 0' }}>Nueva Lección</h4>
                            <form onSubmit={handleAddLesson}>
                                <div className="form-group">
                                    <input
                                        className="input"
                                        type="text"
                                        required
                                        value={newLessonTitle}
                                        onChange={e => setNewLessonTitle(e.target.value)}
                                        placeholder="Título de la Lección"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Descripción de la Lección</label>
                                    <textarea
                                        className="input"
                                        rows={3}
                                        value={newLessonDesc}
                                        onChange={e => setNewLessonDesc(e.target.value)}
                                        placeholder="Breve descripción del contenido de la lección..."
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <VideoIcon size={16} /> Mux Playback ID *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={muxPlaybackId}
                                            onChange={e => setMuxPlaybackId(e.target.value)}
                                            placeholder="Ej. wNJEK3X200..."
                                            className="input"
                                        />
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Copia el Playback ID desde tu panel de Mux.
                                        </p>
                                    </div>

                                    <div className="form-group">
                                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={16} /> Material PDF (Opcional)
                                        </label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={e => setPdfFile(e.target.files?.[0] || null)}
                                            className="input"
                                            style={{ paddingTop: '0.5rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button type="button" className="btn btn-ghost" onClick={() => setIsAddingLesson(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        {uploading ? 'Subiendo Materiales...' : 'Guardar Lección'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {lessons.map((lesson, idx) => (
                            <div key={lesson.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'var(--background)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{lesson.title}</div>
                                        {lesson.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lesson.description.substring(0, 60)}...</div>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {lesson.pdf_url && <span className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>PDF</span>}
                                    <button className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={() => handleDeleteLesson(lesson.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {lessons.length === 0 && !isAddingLesson && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                Aún no hay lecciones. ¡Agrega tu primer video!
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card">
                    <p>El formulario de edición de detalles del curso va aquí...</p>
                </div>
            )}
        </div>
    );
};
