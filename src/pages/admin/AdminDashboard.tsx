import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { type Profile } from '../../types';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const ADMIN_EMAILS = ['ing.lp.tech@gmail.com'];

    useEffect(() => {
        if (!user || !profile) return;

        // Simple client-side check, RLS will enforce real security
        if (!ADMIN_EMAILS.includes(user.email || '')) {
            navigate('/');
            return;
        }

        fetchProfiles();
    }, [user, profile]);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false }); // ascending false for newest first? Supabase profiles might not have created_at exposed by default or it might be in auth users. 
            // Let's assume profiles has created_at if we added it, or just order by id logic

            if (error) throw error;
            setProfiles(data as Profile[] || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleApproval = async (profileId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: !currentStatus })
                .eq('id', profileId);

            if (error) throw error;

            // Optimistic update
            setProfiles(profiles.map(p =>
                p.id === profileId ? { ...p, is_approved: !currentStatus } : p
            ));
        } catch (error: any) {
            alert('Error updating approval: ' + error.message);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`¿ESTÁS SEGURO? Eliminarás a "${userName}" y TODOS sus datos (cursos, etc) para siempre.`)) return;

        try {
            // Call our secure RPC function
            const { error } = await supabase.rpc('delete_user_by_owner', { target_user_id: userId });

            if (error) throw error;

            // UI Update
            setProfiles(profiles.filter(p => p.id !== userId));
            alert('Usuario eliminado correctamente.');
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert('Error al eliminar: ' + error.message);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Cargando panel de administración...</div>;

    const teachers = profiles.filter(p => p.role === 'teacher');
    const students = profiles.filter(p => p.role === 'student');

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
            <h1 className="title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert /> Panel de Administración
            </h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Solicitudes de Profesores</h3>
                {teachers.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No hay profesores registrados.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Nombre</th>
                                    <th style={{ padding: '1rem' }}>Email</th>
                                    <th style={{ padding: '1rem' }}>Whatsapp</th>
                                    <th style={{ padding: '1rem' }}>Estado</th>
                                    <th style={{ padding: '1rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map(teacher => (
                                    <tr key={teacher.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>{teacher.full_name || 'Sin nombre'}</td>
                                        <td style={{ padding: '1rem' }}>{teacher.email}</td>
                                        <td style={{ padding: '1rem' }}>{teacher.whatsapp_number || '-'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.85rem',
                                                background: teacher.is_approved ? 'var(--secondary)' : '#ef4444',
                                                color: 'white'
                                            }}>
                                                {teacher.is_approved ? 'Aprobado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button
                                                onClick={() => toggleApproval(teacher.id, teacher.is_approved || false)}
                                                className={`btn ${teacher.is_approved ? 'btn-outline' : 'btn-primary'}`}
                                                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                            >
                                                {teacher.is_approved ? 'Revocar' : 'Aprobar'}
                                            </button>
                                            <button
                                                className="btn btn-ghost"
                                                onClick={() => handleDeleteUser(teacher.id, teacher.full_name || 'Usuario')}
                                                title="Eliminar Usuario Definitivamente"
                                                style={{ color: '#ef4444', padding: '0.5rem' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Alumnos ({students.length})</h3>
                <p style={{ color: 'var(--text-muted)' }}>Lista de alumnos registrados (Vista de solo lectura)</p>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {students.map(student => (
                        <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <div>
                                <div style={{ fontWeight: '600' }}>{student.full_name || 'Sin nombre'}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{student.email}</div>
                            </div>
                            <button
                                className="btn btn-ghost"
                                onClick={() => handleDeleteUser(student.id, student.full_name || 'Estudiante')}
                                title="Eliminar Estudiante"
                                style={{ color: '#ef4444', padding: '0.5rem' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {students.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No hay alumnos registrados.</p>}
                </div>
            </div>
        </div>
    );
};
