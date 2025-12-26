import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { type Role } from '../types';

export const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'student' as Role
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: formData.role
                    }
                }
            });
            if (error) throw error;
            alert('¡Registro exitoso! Por favor verifica tu correo.');
            navigate('/login');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container card">
            <h2 className="title">Crear Cuenta</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="label">Nombre Completo</label>
                    <input
                        className="input"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                    />
                </div>

                <div className="form-group">
                    <label className="label">Quiero...</label>
                    <div className="role-selector">
                        <div
                            className={`role-card ${formData.role === 'student' ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'student' })}
                        >
                            Aprender
                        </div>
                        <div
                            className={`role-card ${formData.role === 'teacher' ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'teacher' })}
                        >
                            Enseñar
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="label">Correo Electrónico</label>
                    <input
                        className="input"
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                    />
                </div>
                <div className="form-group">
                    <label className="label">Contraseña</label>
                    <input
                        className="input"
                        type="password"
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Creando...' : 'Registrarse'}
                </button>
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                ¿Ya tienes una cuenta? <Link to="/login" style={{ color: 'var(--primary)' }}>Iniciar Sesión</Link>
            </div>
        </div>
    );
};
