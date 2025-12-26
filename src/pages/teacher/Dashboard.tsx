import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { type Course } from '../../types';
import { Plus, Video } from 'lucide-react';

export const TeacherDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchCourses();
        }
    }, [user]);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('teacher_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="title" style={{ marginBottom: 0 }}>Panel de Instructor</h1>
                <Link to="/teacher/courses/new" className="btn btn-primary">
                    <Plus size={20} />
                    Nuevo Curso
                </Link>
            </div>

            {loading ? (
                <p>Cargando tus cursos...</p>
            ) : courses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Video size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <h3>Aún no hay cursos</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Comienza a compartir tu conocimiento con el mundo.</p>
                    <Link to="/teacher/courses/new" className="btn btn-primary">Crea Tu Primer Curso</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {courses.map(course => (
                        <div key={course.id} className="card">
                            {course.thumbnail_url && (
                                <img
                                    src={course.thumbnail_url}
                                    alt={course.title}
                                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', marginBottom: '1rem' }}
                                />
                            )}
                            <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>{course.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                {course.category} • {course.price && course.price > 0 ? `$${course.price}` : 'Free'}
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Link to={`/teacher/courses/${course.id}/edit`} className="btn btn-outline" style={{ flex: 1 }}>Editar</Link>
                                <Link to={`/courses/${course.id}`} className="btn btn-ghost" style={{ flex: 1 }}>Ver</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
