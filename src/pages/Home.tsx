import { Link } from 'react-router-dom';

export const Home = () => {
    return (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', background: 'linear-gradient(to right, #818cf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Aprende Sin Límites
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem' }}>
                Descubre cursos premium de expertos o comienza a enseñar tu pasión al mundo.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/courses" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                    Explorar Cursos
                </Link>
                <Link to="/register" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                    Comenzar a Enseñar
                </Link>
            </div>

            <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                <div className="card">
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Para Estudiantes</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Accede a cursos de alta calidad, sigue tu progreso y obtén soporte directo de instructores vía WhatsApp.</p>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Para Profesores</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Crea tu plan de estudios, sube videos seguros y gestiona tus estudiantes fácilmente con nuestro panel.</p>
                </div>
            </div>
        </div>
    );
};
