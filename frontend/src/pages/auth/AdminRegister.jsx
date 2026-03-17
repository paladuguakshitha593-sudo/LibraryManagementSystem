import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import './Auth.css';

const AdminRegister = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/admin/register', { fullName, email, phoneNumber, password });
      navigate('/admin/login');
    } catch (err) {
      if (err.response?.status === 500) {
        setError('Email already exists. Please try a different one.');
      } else {
        setError(err.response?.data?.message || 'Admin registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card" style={{ borderTop: '4px solid var(--primary)' }}>
        <h2 className="auth-title">Admin Registration</h2>
        <p className="auth-subtitle">Create a new administrator account.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Admin...' : 'Register as Admin'}
          </button>
        </form>

        <div className="auth-links">
          <span className="admin-link">
            Already have an admin account? <Link to="/admin/login">Admin Login</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
