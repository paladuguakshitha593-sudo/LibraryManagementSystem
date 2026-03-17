import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookPlus, Library, Home } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, role } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const navItems = [];
  
  if (role === 'ADMIN') {
    navItems.push({ path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' });
    navItems.push({ path: '/admin/books/add', icon: <BookPlus size={20} />, label: 'Add Book' });
  } else if (role === 'USER') {
    navItems.push({ path: '/user/dashboard', icon: <LayoutDashboard size={20} />, label: 'My Dashboard' });
  }
  
  navItems.push({ path: '/books', icon: <Library size={20} />, label: 'All Books' });

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <div className="sidebar-divider"></div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
