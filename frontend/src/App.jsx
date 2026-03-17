import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import BookList from './pages/books/BookList';
import AddBook from './pages/books/AddBook';
import AdminRegister from './pages/auth/AdminRegister';
import AIChatbot from './components/AI/AIChatbot';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, loading } = useAuth();
  
  if (loading) return <div className="loading-state">Loading application...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    // If Admin tries to access User route or vice-versa
    return <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }
  
  return children;
};

// Public Route Wrapper (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<BookList />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />
        <Route path="/admin/login" element={
          <PublicRoute><AdminLogin /></PublicRoute>
        } />
        <Route path="/admin/register" element={
          <PublicRoute><AdminRegister /></PublicRoute>
        } />
        
        {/* User Protected Routes */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute requiredRole="USER"><UserDashboard /></ProtectedRoute>
        } />
        
        {/* Admin Protected Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/books/add" element={
          <ProtectedRoute requiredRole="ADMIN"><AddBook /></ProtectedRoute>
        } />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AIChatbot />
    </Layout>
  );
}

export default App;
