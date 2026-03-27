import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Library, Activity, BookOpen, Bell, CheckCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../api';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0, activeBorrows: 0, returnedBooks: 0, totalRevenue: 0 });
  const [chartData, setChartData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listData, setListData] = useState([]);
  const [activeView, setActiveView] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [paidRecords, setPaidRecords] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartRes, notifRes] = await Promise.all([
        api.get('/borrow/stats'),
        api.get('/borrow/chart/weekly'),
        api.get('/borrow/notifications')
      ]);
      setStats({
        ...statsRes.data,
        totalRevenue: chartRes.data.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0)
      });

      setNotifications(notifRes.data);
      setChartData(chartRes.data.map(d => {
        const dateObj = new Date(d.date);
        return {
          ...d,
          date: dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
        };
      }));
    } catch (err) {
      console.error(err);
      setError('Stats Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchListData = async (type) => {
    setListLoading(true);
    setActiveView(type);
    try {
      let endpoint = '';
      if (type === 'totalUsers') endpoint = '/borrow/all-users-list';
      else if (type === 'activeLoans') endpoint = '/borrow/active-users-list';
      else if (type === 'returnedBooks') endpoint = '/borrow/returned-users-list';
      else if (type === 'totalBooks') endpoint = '/books/all';
      else if (type === 'paidRecords') endpoint = '/borrow/paid-records';

      if (endpoint) {
        const res = await api.get(endpoint);
        // Ensure data is an array before setting
        setListData(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error(err);
      setError('Data Fetch Error: ' + err.message);
    } finally {
      setListLoading(false);
    }
  };

  const handleReadAll = async () => {
    try {
      await api.post('/borrow/notifications/read-all');
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const getViewTitle = () => {
    switch(activeView) {
      case 'totalUsers': return 'Total Registered Users';
      case 'activeLoans': return 'Users with Active Loans';
      case 'returnedBooks': return 'Users who Returned Books';
      case 'totalBooks': return 'Books Catalog';
      case 'paidRecords': return 'Payment History & Paid Users';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">Live system overview and statistics.</p>
      </header>

      {error && (
        <div className="status-message error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading stats...</div>
      ) : (
        <>
          <div className="stats-grid grid grid-cols-4">
            <div 
              className={`stat-card card clickable ${activeView === 'totalUsers' ? 'active' : ''}`}
              onClick={() => fetchListData('totalUsers')}
            >
              <div className="stat-icon bg-primary-light"><Users className="text-primary" /></div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
              </div>
            </div>
            <div 
              className={`stat-card card clickable ${activeView === 'totalBooks' ? 'active' : ''}`}
              onClick={() => fetchListData('totalBooks')}
            >
              <div className="stat-icon bg-secondary-light"><Library className="text-secondary" /></div>
              <div className="stat-info">
                <h3>Books in Library</h3>
                <p className="stat-value">{stats.totalBooks}</p>
              </div>
            </div>
            <div 
              className={`stat-card card clickable ${activeView === 'activeLoans' ? 'active' : ''}`}
              onClick={() => fetchListData('activeLoans')}
            >
              <div className="stat-icon bg-accent-light"><Activity className="text-accent" /></div>
              <div className="stat-info">
                <h3>Active Loans</h3>
                <p className="stat-value">{stats.activeBorrows}</p>
              </div>
            </div>
            <div 
              className={`stat-card card clickable ${activeView === 'returnedBooks' ? 'active' : ''}`}
              onClick={() => fetchListData('returnedBooks')}
            >
              <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <BookOpen style={{ color: '#6366F1' }} />
              </div>
              <div className="stat-info">
                <h3>Returned Books</h3>
                <p className="stat-value">{stats.returnedBooks}</p>
              </div>
            </div>
            <div 
              className={`stat-card card clickable ${activeView === 'paidRecords' ? 'active' : ''}`}
              onClick={() => fetchListData('paidRecords')}
            >
              <div className="stat-icon bg-success-light"><CheckCircle className="text-secondary" style={{color: '#10B981'}} /></div>
              <div className="stat-info">
                <h3>Paid Records</h3>
                <p className="stat-value">View All</p>
              </div>
            </div>
          </div>

          {activeView && (
            <div className="card user-list-panel" style={{ marginTop: '2rem' }}>
              <div className="panel-header">
                <h2>{getViewTitle()}</h2>
                <button className="btn-close" onClick={() => setActiveView(null)}>×</button>
              </div>
              {listLoading ? (
                <div className="loading-state">Loading list...</div>
              ) : (
              <div className="table-container">
                <table className="user-table">
                  <thead>
                    {activeView === 'totalBooks' ? (
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Stock</th>
                      </tr>
                    ) : activeView === 'paidRecords' ? (
                      <tr>
                        <th>User Name</th>
                        <th>Book Title</th>
                        <th>Amount Paid</th>
                        <th>Borrow Date</th>
                        <th>Status</th>
                      </tr>
                    ) : (
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {listData.length === 0 ? (
                      <tr><td colSpan="5" className="text-center">No data found.</td></tr>
                    ) : activeView === 'totalBooks' ? (
                      listData.map(b => (
                        <tr key={b.id}>
                          <td>{b.id}</td>
                          <td style={{ fontWeight: 500 }}>{b.title}</td>
                          <td>{b.author}</td>
                          <td><span className="book-genre">{b.category}</span></td>
                          <td>{b.quantity}</td>
                        </tr>
                      ))
                    ) : activeView === 'paidRecords' ? (
                      listData.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600 }}>{r.userName}</td>
                          <td>{r.bookTitle}</td>
                          <td style={{ color: '#10B981', fontWeight: 600 }}>₹{r.totalCost?.toFixed(2)}</td>
                          <td>{r.borrowDate}</td>
                          <td><span className="paid-badge">Paid</span></td>
                        </tr>
                      ))
                    ) : (
                      listData.map(u => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.username}</td>
                          <td>{u.email}</td>
                          <td><span className={`role-badge ${u.role?.toLowerCase()}`}>{u.role}</span></td>
                          <td>{u.phoneNumber || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}

          <div className="admin-content-layout">
            {/* Notifications Panel */}
            <div className="notifications-panel card">
              <div className="panel-header">
                <h2><Bell size={20} /> Live Notifications</h2>
                {notifications.length > 0 && (
                  <button className="btn-read-all" onClick={handleReadAll}>Clear All</button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="no-notifs">No new notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="notification-item">
                      <p>{n.message}</p>
                      <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          {/* Weekly Borrow/Return Chart */}
          <div className="card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>📊 Weekly Borrow vs Return Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBorrow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
                <YAxis stroke="#888" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: '#ddd' }}
                />
                <Legend />
                <Area type="monotone" dataKey="borrows" stroke="#7C3AED" fill="url(#colorBorrow)" strokeWidth={2} name="Borrowed" />
                <Area type="monotone" dataKey="returns" stroke="#10B981" fill="url(#colorReturn)" strokeWidth={2} name="Returned" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    )}
    </div>
  );
};

export default AdminDashboard;
