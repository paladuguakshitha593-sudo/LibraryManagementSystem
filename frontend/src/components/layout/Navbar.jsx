import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, BookOpen, User } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import './Navbar.css';


const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <BookOpen className="logo-icon" size={24} />
          <span>Library<span className="text-primary">Sys</span></span>
        </Link>
        <div className="navbar-links">
          <ThemeToggle />
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          ) : (
            <div className="navbar-user">
              <div className="user-badge">
                <User size={16} />
                <span>{user.username || user.email || 'User'}</span>
                <span className="role-tag">{role}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
