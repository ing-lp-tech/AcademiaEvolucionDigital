import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './hooks/useAuth';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { CourseDetail } from './pages/CourseDetail';
import { CreateCourse } from './pages/teacher/CreateCourse';
import { EditCourse } from './pages/teacher/EditCourse';
import './styles/components.css';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProfileSettings } from './pages/teacher/ProfileSettings';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<CourseDetail />} />

              {/* Protected Teacher Routes */}
              <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                <Route path="teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="teacher/profile" element={<ProfileSettings />} />
                <Route path="teacher/courses/new" element={<CreateCourse />} />
                <Route path="teacher/courses/:id/edit" element={<EditCourse />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin/dashboard" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
