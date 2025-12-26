import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';

export const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'owner' | null>(null);
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    const OWNER_EMAILS = ['ing.lp.tech@gmail.com'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation for Owners
            if (selectedRole === 'owner') {
                if (!OWNER_EMAILS.includes(credentials.email)) {
                    throw new Error('Este correo no está autorizado para ingresar como Dueño.');
                }
                if (credentials.password !== 'ingeniero') {
                    throw new Error('Contraseña incorrecta para acceso de Dueño.');
                }
            }

            // Normal Auth Flow (Assuming passwords match Supabase Auth)
            const { error } = await supabase.auth.signInWithPassword(credentials);
            if (error) throw error;

            navigate(selectedRole === 'owner' ? '/admin/dashboard' : '/');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container card" style={{ maxWidth: '450px' }}>
            <h2 className="title" style={{ textAlign: 'center' }}>Bienvenido</h2>

            {!selectedRole ? (
                <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Selecciona cómo deseas ingresar:
                    </p>
                    <button onClick={() => setSelectedRole('owner')} className="btn btn-outline" style={{ justifyContent: 'center', height: '50px' }}>
                        Soy Dueño
                    </button>
                    <button onClick={() => setSelectedRole('teacher')} className="btn btn-outline" style={{ justifyContent: 'center', height: '50px' }}>
                        Soy Profesor
                    </button>
                    <button onClick={() => setSelectedRole('student')} className="btn btn-primary" style={{ justifyContent: 'center', height: '50px' }}>
                        Soy Estudiante
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <span className="badge" style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                            Ingresando como: {selectedRole === 'owner' ? 'Dueño' : selectedRole === 'teacher' ? 'Profesor' : 'Estudiante'}
                        </span>
                        <button type="button" onClick={() => setSelectedRole(null)} style={{ display: 'block', margin: '0.5rem auto', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                            Cambiar
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="label">Correo Electrónico</label>
                        <input
                            className="input"
                            type="email"
                            required
                            value={credentials.email}
                            onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                            placeholder="nombre@ejemplo.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Contraseña</label>
                        <input
                            className="input"
                            type="password"
                            required
                            value={credentials.password}
                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            )}
            <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                ¿No tienes una cuenta? <Link to="/register" style={{ color: 'var(--primary)' }}>Regístrate</Link>
            </div>
        </div>
    );
};
