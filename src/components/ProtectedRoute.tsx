import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { type Role } from '../types';

interface ProtectedRouteProps {
    allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    Cargando...
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles) {
        // Special check for admin role
        const isAdmin = user && ['gonzaromero789@gmail.com', 'xphard@gmail.com', 'ing.lp.tech@gmail.com'].includes(user.email || '');
        if (allowedRoles.includes('admin') && !isAdmin) {
            return <Navigate to="/" replace />;
        }

        // Role check for non-admins (Owner bypasses all role checks)
        if (!isAdmin && !allowedRoles.includes('admin') && profile && !allowedRoles.includes(profile.role)) {
            return <Navigate to="/" replace />;
        }
    }

    // Check approval for teachers (Owner is always approved)
    const isOwner = user?.email === 'ing.lp.tech@gmail.com';
    if (!isOwner && profile?.role === 'teacher' && !profile.is_approved) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <h2 style={{ color: '#ef4444' }}>Cuenta Pendiente de Aprobación</h2>
                    <p style={{ margin: '1rem 0' }}>
                        Tu cuenta de profesor ha sido creada pero requiere aprobación de un administrador para acceder al panel.
                    </p>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Por favor contacta a la administración o espera a ser verificado.
                    </p>
                </div>
            </div>
        );
    }

    return <Outlet />;
};
