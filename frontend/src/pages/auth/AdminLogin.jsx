import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './Auth.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // POST to admin login endpoint
      const response = await api.post('/auth/admin/login', { email, password });
      // The backend returns an AuthResponse object { user, token }
      const { user, token } = response.data;
      login(user, 'ADMIN', token);
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.response?.status === 500) {
        setError('The server encountered an error during login. Please check the backend logs.');
      } else {
        setError(err.response?.data?.message || 'Admin login failed. Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card" style={{borderTop: '4px solid var(--primary)'}}>
        <h2 className="auth-title">Admin Portal</h2>
        <p className="auth-subtitle">Restricted access for library administrators.</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Admin Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <span className="admin-link">
            <Link to="/login">Back to User Login</Link> &nbsp;|&nbsp;
            <Link to="/admin/register">Register as Admin</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
