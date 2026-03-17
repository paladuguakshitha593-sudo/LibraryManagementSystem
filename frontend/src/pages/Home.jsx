import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <BookOpen size={64} className="hero-icon" />
        <h1 className="hero-title">Welcome to Library<span className="text-primary">Sys</span></h1>
        <p className="hero-subtitle">
          Your modern, elegant solution for managing and discovering books.
        </p>
        <div className="hero-actions">
          <Link to="/books" className="btn btn-primary btn-lg">Browse Books</Link>
          <Link to="/register" className="btn btn-outline btn-lg">Join Now</Link>
        </div>
      </div>
      
      <div className="features-grid grid grid-cols-3">
        <div className="card feature-card">
          <h3>Vast Collection</h3>
          <p>Explore thousands of books across different genres and topics.</p>
        </div>
        <div className="card feature-card">
          <h3>Easy Borrowing</h3>
          <p>Seamlessly request and manage your borrowed books online.</p>
        </div>
        <div className="card feature-card">
          <h3>Admin Control</h3>
          <p>Powerful dashboard for administrators to manage inventory.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
