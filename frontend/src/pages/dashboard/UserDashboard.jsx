import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Book, CheckCircle, Clock, AlertTriangle, CreditCard, RotateCcw } from 'lucide-react';
import api from '../../api';
import './Dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [borrows, setBorrows] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [borrowRes, overdueRes, recRes] = await Promise.all([
        api.get(`/borrow/user-detailed/${user.id}`),
        api.get(`/borrow/overdue/${user.id}`),
        api.get(`/borrow/recommendations/${user.id}`)
      ]);
      setBorrows(Array.isArray(borrowRes.data) ? borrowRes.data : []);
      setOverdue(Array.isArray(overdueRes.data) ? overdueRes.data : []);
      setRecommendations(Array.isArray(recRes.data) ? recRes.data : []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Backend API error: ' + (error.response?.status === 405 ? '405 Method Not Allowed (Please recompile backend)' : error.message));
    } finally {
      setLoading(false);
    }
  };

  const activeBorrows = borrows.filter(b => !b.returnDate);
  const returnedBooks = borrows.filter(b => b.returnDate);

  // Identify books due today
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayCount = activeBorrows.filter(b => b.dueDate === todayStr).length;
  const dueTodayItems = activeBorrows.filter(b => b.dueDate === todayStr);

  const handleReturn = async (bookId) => {
    if (!window.confirm('Are you sure you want to return this book?')) return;
    try {
      await api.put(`/borrow/return/${user.id}/${bookId}`);
      fetchData();
    } catch (err) {
      alert('Return failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePay = async (recordId) => {
    try {
      await api.post(`/borrow/pay/${recordId}`);
      fetchData();
      alert('Payment successful!');
    } catch (err) {
      alert('Payment failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Welcome, {user?.username || 'Reader'}!</h1>
        <p className="dashboard-subtitle">Your real-time reading activity.</p>
      </header>

      {/* Due Today Reminders */}
      {dueTodayItems.length > 0 && (
        <div className="reminder-alerts">
          {dueTodayItems.map((item, idx) => (
            <div key={idx} className="reminder-banner">
              <Clock size={18} />
              <span>
                📅 <strong>{item.bookTitle}</strong> is due for return <strong>Today</strong>. Please return it to avoid late fees!
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Overdue Alerts */}
      {overdue.length > 0 && (
        <div className="overdue-alerts">
          {overdue.map((item, idx) => (
            <div key={idx} className="overdue-banner">
              <AlertTriangle size={18} />
              <span>
                ⚠️ Your borrow period for <strong>{item.title}</strong> expired on <strong>{item.dueDate}</strong>.
                Please return it immediately!
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="status-message error" style={{ marginBottom: '1.5rem' }}>
          {`${error} - Click "Project" then "Clean" in Eclipse to fix.`}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading your activity...</div>
      ) : (
        <>
          <div className="stats-grid grid grid-cols-3">
            <div className="stat-card card">
              <div className="stat-icon bg-primary-light"><Book className="text-primary" /></div>
              <div className="stat-info">
                <h3>Currently Borrowed</h3>
                <p className="stat-value">{activeBorrows.length}</p>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon bg-secondary-light"><CheckCircle className="text-secondary" /></div>
              <div className="stat-info">
                <h3>Books Returned</h3>
                <p className="stat-value">{returnedBooks.length}</p>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon bg-accent-light"><CreditCard className="text-accent" /></div>
              <div className="stat-info">
                <h3>Payment Pending</h3>
                <p className="stat-value">{borrows.filter(b => !b.isPaid).length}</p>
              </div>
            </div>
          </div>


          {/* Borrow History */}
          <div className="recent-activity card" style={{ marginTop: '1.5rem' }}>
            <h2>Borrow History</h2>
            {borrows.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
                You haven't borrowed any books yet. Go browse the{' '}
                <a href="/books" style={{ color: 'var(--primary)' }}>catalog</a>!
              </p>
            ) : (
              <div className="activity-list">
                {borrows.map(record => {
                  const isOverdue = overdue.some(o => o.bookId === record.bookId);
                  return (
                    <div key={record.id} className={`activity-item ${isOverdue ? 'item-overdue' : ''}`}>
                      <div className="activity-details">
                        <h4>{record.bookTitle || `Book ID: ${record.bookId}`}</h4>
                        <p className="item-author">{record.bookAuthor}</p>
                        <div className="activity-meta">
                          <span>Borrowed: {record.borrowDate}</span>
                          {record.returnDate && <span>Returned: {record.returnDate}</span>}
                          <span className="cost-tag">Cost: ₹{record.totalCost?.toFixed(2)}</span>
                          {record.isPaid ? 
                            <span className="paid-badge">Paid</span> : 
                            <span className="unpaid-badge">Unpaid</span>
                          }
                        </div>
                        {isOverdue && <p style={{ color: '#DC2626', fontWeight: 600, marginTop: '0.25rem' }}>⚠️ Overdue!</p>}
                      </div>
                      
                      <div className="activity-actions">
                        {!record.returnDate && (
                          <>
                            {!record.isPaid && (
                              <button className="btn-pay" onClick={() => handlePay(record.id)}>
                                <CreditCard size={14} /> Pay
                              </button>
                            )}
                            <button className="btn-return-action" onClick={() => handleReturn(record.bookId)}>
                              <RotateCcw size={14} /> Return
                            </button>
                          </>
                        )}
                        <span className={`status-badge ${record.returnDate ? 'status-returned' : isOverdue ? 'status-overdue' : 'status-active'}`}>
                          {record.returnDate ? 'Returned' : isOverdue ? 'Overdue' : 'Active'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Book Recommendations */}
          {recommendations.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>📚 Recommended for You</h2>
              <div className="grid grid-cols-3">
                {recommendations.map(book => (
                  <div 
                    key={book.id} 
                    className="card clickable" 
                    style={{ padding: '1rem', gap: '0.25rem' }}
                    onClick={() => navigate(`/books?search=${encodeURIComponent(book.title)}`)}
                  >
                    <h4 style={{ marginBottom: '0.25rem' }}>{book.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{book.author}</p>
                    {book.category && (
                      <span className="book-genre" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                        {book.category}
                      </span>
                    )}
                  </div>
                ))}

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserDashboard;
