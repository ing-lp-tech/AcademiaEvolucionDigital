import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { type Course } from '../types';
import { Search } from 'lucide-react';

export const Courses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        fetchCourses();
    }, [categoryFilter]); // Refetch when filter changes

    const fetchCourses = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (categoryFilter) {
                query = query.eq('category', categoryFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setCourses(data as Course[] || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Explorar Cursos</h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    Encuentra el curso perfecto para mejorar tus habilidades o descubrir una nueva pasión.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: '3rem' }}
                        placeholder="Buscar cursos..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="input"
                    style={{ width: '200px' }}
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="">Todas las Categorías</option>
                    <option value="Programming">Programación</option>
                    <option value="Design">Diseño</option>
                    <option value="Business">Negocios</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Music">Music</option>
                </select>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center' }}>Cargando cursos...</p>
            ) : filteredCourses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <h3>No se encontraron cursos</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Intenta ajustar tu búsqueda o filtros.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {filteredCourses.map(course => (
                        <Link key={course.id} to={`/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                                <div style={{ height: '200px', backgroundColor: 'var(--surface-hover)', backgroundImage: `url(${course.thumbnail_url || 'https://via.placeholder.com/300?text=No+Image'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{course.category}</span>
                                        <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{course.price && course.price > 0 ? `$${course.price}` : 'Gratis'}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{course.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                                        {course.description?.slice(0, 100)}...
                                    </p>
                                    <button className="btn btn-primary" style={{ width: '100%' }}>Ver Curso</button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
