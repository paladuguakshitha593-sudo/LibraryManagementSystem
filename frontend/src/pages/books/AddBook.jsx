import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './Books.css';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    quantity: '',
    price: '',
    borrowDays: 14
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const totalValue = () => {
    const qty = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.price) || 0;
    return (qty * price).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/books/add', {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        price: parseFloat(formData.price) || 0,
        borrowDays: parseInt(formData.borrowDays) || 14
      });
      setStatus({ type: 'success', message: 'Book successfully added to the library!' });
      setFormData({ title: '', author: '', category: '', quantity: '', price: '', borrowDays: 14 });
      setTimeout(() => navigate('/books'), 2000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to add the book. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-book-container">
      <div className="card form-card">
        <h2>Add New Book</h2>
        <p className="form-subtitle">Enter the details of the new book to add it to the inventory.</p>

        {status.message && (
          <div className={`status-message ${status.type}`}>{status.message}</div>
        )}

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-row grid grid-cols-2">
            <div className="form-group">
              <label>Book Title</label>
              <input type="text" name="title" value={formData.title}
                onChange={handleChange} placeholder="e.g. The Great Gatsby" required />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input type="text" name="author" value={formData.author}
                onChange={handleChange} placeholder="e.g. F. Scott Fitzgerald" required />
            </div>
          </div>

          <div className="form-row grid grid-cols-2">
            <div className="form-group">
              <label>Category / Genre</label>
              <input type="text" name="category" value={formData.category}
                onChange={handleChange} placeholder="e.g. Fiction" />
            </div>
            <div className="form-group">
              <label>Borrow Duration (days)</label>
              <input type="number" name="borrowDays" value={formData.borrowDays}
                onChange={handleChange} placeholder="e.g. 14" min="1" />
            </div>
          </div>

          <div className="form-row grid grid-cols-2">
            <div className="form-group">
              <label>Quantity in Stock</label>
              <input type="number" name="quantity" value={formData.quantity}
                onChange={handleChange} placeholder="e.g. 10" min="1" required />
            </div>
            <div className="form-group">
              <label>Price per Book (₹)</label>
              <input type="number" name="price" value={formData.price}
                onChange={handleChange} placeholder="e.g. 299.99" min="0" step="0.01" />
            </div>
          </div>

          {/* Live total display */}
          {formData.quantity && formData.price && (
            <div className="book-total-preview">
              <span>📦 Total Stock Value:</span>
              <strong>₹{totalValue()}</strong>
              <span style={{ marginLeft: '1.5rem' }}>📚 Book Count:</span>
              <strong>{formData.quantity} copies</strong>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding Book...' : 'Add Book to Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
