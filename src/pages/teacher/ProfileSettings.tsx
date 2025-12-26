import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

export const ProfileSettings = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        whatsapp_number: ''
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                whatsapp_number: profile.whatsapp_number || ''
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    whatsapp_number: formData.whatsapp_number
                })
                .eq('id', user.id);

            if (error) throw error;
            alert('¡Perfil actualizado exitosamente!');
            // Force reload or update context would be better, but simple alert works for MVP
            window.location.reload();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h2 className="title">Configuración de Perfil</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="label">Nombre Completo</label>
                    <input
                        className="input"
                        type="text"
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="label">Número de WhatsApp</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>+</span>
                        <input
                            className="input"
                            type="tel"
                            value={formData.whatsapp_number}
                            onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
                            placeholder="549112345678"
                        />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Formato: Código de país + Número (sin espacios ni guiones). Ej., 54911...
                    </p>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    );
};
