import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { uploadFile } from '../../services/storage';
import { Upload } from 'lucide-react';

export const CreateCourse = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: 0
    });
    const [thumbnail, setThumbnail] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            let thumbnailUrl = '';
            if (thumbnail) {
                thumbnailUrl = await uploadFile('thumbnails', thumbnail, `course-${user.id}`);
            }

            const { data, error } = await supabase.from('courses').insert({
                teacher_id: user.id,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                price: formData.price,
                thumbnail_url: thumbnailUrl
            }).select().single();

            if (error) throw error;

            // Redirect to edit page to add lessons
            navigate(`/teacher/courses/${data.id}/edit`);
        } catch (error: any) {
            console.error('Error creating course:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container card" style={{ maxWidth: '600px' }}>
            <h2 className="title">Crear Nuevo Curso</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="label">Título del Curso</label>
                    <input
                        className="input"
                        type="text"
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Introduction to..."
                    />
                </div>

                <div className="form-group">
                    <label className="label">Categoría</label>
                    <select
                        className="input"
                        required
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="">Selecciona una categoría...</option>
                        <option value="Programming">Programación</option>
                        <option value="Design">Diseño</option>
                        <option value="Business">Negocios</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Music">Música</option>
                        <option value="Cooking">Cocina</option>
                        <option value="Other">Otro</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="label">Descripción</label>
                    <textarea
                        className="input"
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="¿Qué aprenderán los estudiantes?"
                    />
                </div>

                <div className="form-group">
                    <label className="label">Precio ($)</label>
                    <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    />
                </div>

                <div className="form-group">
                    <label className="label">Imagen de Portada</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                            <Upload size={18} />
                            {thumbnail ? 'Cambiar Imagen' : 'Subir Miniatura'}
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={e => setThumbnail(e.target.files?.[0] || null)}
                            />
                        </label>
                        {thumbnail && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{thumbnail.name}</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Creando...' : 'Continuar a Lecciones'}
                    </button>
                </div>
            </form>
        </div>
    );
};
