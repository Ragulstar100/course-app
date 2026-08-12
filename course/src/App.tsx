import { Routes, Route, useNavigate } from 'react-router-dom';
import WelcomePage from './welcome';
import LoginPage from './page/login';
import RegisterPage from './page/register';
import CourseManagement from './page/CourseManagement';
import StudentDashboard from './page/StudentDashboard';
import AdminDashboard from './page/AdminDashboard';
import StudentManagement from './page/StudentManagement';
import { StudentProvider } from './globalstate/student';
import { CourseProvider } from './globalstate/course';
import { ShopifyProvider, useShopify } from './globalstate/shopify';
import { useEffect } from 'react';

function AppRoutes() {
  const navigate = useNavigate();
  const { shop, token } = useShopify();

  // If Shopify shop and token parameters are detected in state, auto-redirect merchant to dashboard
  useEffect(() => {
    if (shop && token && window.location.pathname === '/') {
      navigate('/dashboard-admin');
    }
  }, [shop, token, navigate]);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <WelcomePage 
            onLogin={() => navigate('/login')} 
            onRegister={() => navigate('/register')} 
            onManageProducts={() => navigate('/dashboard-admin')}
            onTrackOrders={() => navigate('/dashboard')}
          />
        } 
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      
      {/* Admin Pages */}
      <Route path="/dashboard-admin" element={<AdminDashboard />} />
      <Route path="/courses" element={<CourseManagement />} />
      <Route path="/students" element={<StudentManagement />} />
    </Routes>
  );
}

function App() {
  return (
    <ShopifyProvider>
      <StudentProvider>
        <CourseProvider>
          <AppRoutes />
        </CourseProvider>
      </StudentProvider>
    </ShopifyProvider>
  );
}

export default App;