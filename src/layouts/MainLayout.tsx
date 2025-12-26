import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, BookOpen, User as UserIcon, Shield } from 'lucide-react';
import '../styles/layout.css';

export const MainLayout = () => {
    const { user, signOut, profile } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="nav-brand">
                    <BookOpen size={24} />
                    <span>Academia Evolucion Digital</span>
                </Link>
                <div className="nav-menu">
                    <Link to="/courses" className="btn btn-ghost">Explorar</Link>

                    {user ? (
                        <>
                            {/* Owner Links */}
                            {user.email === 'ing.lp.tech@gmail.com' && (
                                <>
                                    <Link to="/admin/dashboard" className="btn btn-ghost" style={{ color: 'var(--primary)' }}>
                                        <Shield size={16} /> Admin
                                    </Link>
                                    {/* Owner is also a Super Teacher */}
                                    <Link to="/teacher/dashboard" className="btn btn-ghost">Panel Profesor</Link>
                                </>
                            )}

                            {/* Teacher Links (filtered out for owner to prevent duplicates if logic overlaps, or kept if distinct) */}
                            {profile?.role === 'teacher' && user.email !== 'ing.lp.tech@gmail.com' && (
                                <>
                                    <Link to="/teacher/dashboard" className="btn btn-ghost">Panel</Link>
                                    <Link to="/teacher/profile" className="btn btn-ghost">Ajustes</Link>
                                </>
                            )}
                            <div className="btn btn-ghost" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', gap: '0', padding: '0.25rem 0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <UserIcon size={16} />
                                    <span className="hide-mobile">{profile?.full_name?.split(' ')[0] || 'User'}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    {user.email === 'ing.lp.tech@gmail.com' ? 'Dueño' : profile?.role === 'teacher' ? 'Profesor' : 'Estudiante'}
                                </span>
                            </div>
                            <button onClick={handleSignOut} className="btn btn-outline" style={{ padding: '0.5rem' }} title="Sign Out">
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Iniciar Sesión</Link>
                            <Link to="/register" className="btn btn-primary">Registrarse</Link>
                        </>
                    )}
                </div>
            </nav>
            <main className="main-content">
                <Outlet />
            </main>
            <footer className="footer">
                <p>&copy; 2025 Academia Evolución Digital. Todos los derechos reservados.</p>
            </footer>
        </>
    );
};
