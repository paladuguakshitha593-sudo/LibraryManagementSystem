import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Heart, RotateCcw, BookOpen, Tag, Clock, Package, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import './Books.css';

const BookList = () => {
  const { user, role } = useAuth();
  const location = useLocation();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [actionStatus, setActionStatus] = useState({});
  const [borrowDurations, setBorrowDurations] = useState({}); // Stores selected days for each book
  const [likedBooks, setLikedBooks] = useState(() => {
    const saved = localStorage.getItem('likedBooks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchBooks();
    
    // Check for search param in URL
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [location.search]);


  const fetchBooks = async () => {
    try {
      const response = await api.get('/books/all');
      setBooks(response.data);
      // Initialize default durations (7 days)
      const initialDurations = {};
      response.data.forEach(b => initialDurations[b.id] = 7);
      setBorrowDurations(initialDurations);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    if (!user?.id) return;
    const days = borrowDurations[bookId] || 7;
    setActionStatus(prev => ({ ...prev, [bookId]: { loading: true } }));
    try {
      // POST with Query Param for days
      await api.post(`/borrow/add/${user.id}/${bookId}`, null, {
        params: { days: days }
      });
      setActionStatus(prev => ({ ...prev, [bookId]: { success: `Borrowed for ${days} days!` } }));
      
      // Refresh books to update stock counts if needed
      setTimeout(fetchBooks, 2000);
    } catch (err) {
      setActionStatus(prev => ({
        ...prev,
        [bookId]: { error: err.response?.data?.message || 'Could not borrow.' }
      }));
    }
  };

  const handleDelete = async (bookId) => {
    if (role !== 'ADMIN') return;
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await api.delete(`/books/${bookId}`);
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data || err.message));
    }
  };

  const handleReturn = async (bookId) => {
    if (!user?.id) return;
    setActionStatus(prev => ({ ...prev, [bookId]: { loading: true } }));
    try {
      await api.put(`/borrow/return/${user.id}/${bookId}`);
      setActionStatus(prev => ({ ...prev, [bookId]: { success: 'Returned!' } }));
      setTimeout(fetchBooks, 1500);
    } catch (err) {
      setActionStatus(prev => ({
        ...prev,
        [bookId]: { error: err.response?.data?.message || 'Could not return.' }
      }));
    }
  };

  const handleLike = async (bookId) => {
    if (likedBooks.includes(bookId)) return;
    try {
      const res = await api.post(`/books/${bookId}/like`);
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, likes: res.data.likes } : b));
      const updated = [...likedBooks, bookId];
      setLikedBooks(updated);
      localStorage.setItem('likedBooks', JSON.stringify(updated));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const updateDuration = (bookId, val) => {
    setBorrowDurations(prev => ({ ...prev, [bookId]: parseInt(val) }));
  };

  const categories = ['All', ...new Set(Array.isArray(books) ? books.map(b => b.category).filter(Boolean) : [])];

  const filteredBooks = Array.isArray(books) ? books.filter(book => {
    const matchSearch = book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'All' || book.category === filterCategory;
    return matchSearch && matchCategory;
  }) : [];

  return (
    <div className="books-container">
      <div className="books-header">
        <div>
          <h1>Library Catalog</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="category-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${filterCategory === cat ? 'active' : ''}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Loading catalog...</div>
      ) : (
        <div className="books-grid">
          {filteredBooks.map(book => {
            const status = actionStatus[book.id];
            const isLiked = likedBooks.includes(book.id);
            const selectedDays = borrowDurations[book.id] || 7;
            const dailyRate = book.price || 0;
            const totalCost = (dailyRate * selectedDays).toFixed(2);

            return (
              <div key={book.id} className="book-card card">
                {book.category && (
                  <span className="book-badge">{book.category}</span>
                )}
                
                {role === 'ADMIN' && (
                  <button 
                    className="delete-icon-btn" 
                    onClick={() => handleDelete(book.id)}
                    title="Delete Book"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="book-cover">
                  {book.imageUrl ? (
                    <img src={book.imageUrl} alt={book.title} className="actual-book-image" />
                  ) : (
                    <BookOpen size={44} className="placeholder-cover" />
                  )}
                </div>

                <div className="book-details">
                  <h3 className="book-title">{book.title || 'Untitled Book'}</h3>
                  <p className="book-author">{book.author || 'Unknown Author'}</p>

                  <div className="book-meta-row">
                    <span title="Daily Rate"><Tag size={13} /> ₹{dailyRate}/day</span>
                    <span title="Stock"><Package size={13} /> {book.quantity ?? 0} left</span>
                  </div>
                </div>

                <div className="book-like-row">
                  {role === 'USER' ? (
                    <button
                      className={`like-btn ${isLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(book.id)}
                      disabled={isLiked}
                    >
                      <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                      <span>{book.likes || 0}</span>
                    </button>
                  ) : (
                    <div className="like-display-only" title="Total Likes">
                      <Heart size={15} fill="var(--primary)" />
                      <span>{book.likes || 0}</span>
                    </div>
                  )}
                </div>

                {/* USER ACTIONS: DURATION & COST */}
                {user && role === 'USER' && (
                  <div className="book-transaction-zone">
                    {!status?.success && (
                      <div className="duration-selector">
                        <div className="duration-label">
                          <span>Set Duration: <strong>{selectedDays} days</strong></span>
                          {dailyRate > 0 && <span className="total-preview">Total: ₹{totalCost}</span>}
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="30" 
                          value={selectedDays} 
                          onChange={(e) => updateDuration(book.id, e.target.value)}
                          className="duration-slider"
                        />
                      </div>
                    )}

                    <div className="book-actions">
                      {status?.success ? (
                        <div className="action-success-bubble">
                          <CheckCircle2 size={16} />
                          <span>{status.success}</span>
                        </div>
                      ) : status?.error ? (
                        <p className="action-error">{status.error}</p>
                      ) : (
                        <div className="action-buttons-row">
                          {book.quantity > 0 ? (
                            <button
                              className="btn btn-primary borrow-btn-dynamic"
                              onClick={() => handleBorrow(book.id)}
                              disabled={status?.loading}
                            >
                              {status?.loading ? 'Processing...' : 'Confirm Borrow'}
                            </button>
                          ) : (
                            <div className="out-of-stock-badge">
                              Out of Stock
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredBooks.length === 0 && (
            <div className="no-results col-span-full">
              <p>No books found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookList;
