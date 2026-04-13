import React, { useState } from 'react';
import { productsAPI } from '../../services/api';

const StockUpdateModal = ({ product, onClose, onSuccess }) => {
  const [form, setForm]     = useState({ quantity_change: '', transaction_type: 'restock', notes: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = parseInt(form.quantity_change, 10);
    if (!form.quantity_change || isNaN(qty) || qty === 0) {
      setError('Please enter a valid non-zero integer quantity.');
      return;
    }
    if (form.transaction_type === 'sale' && qty > 0) {
      setError('For a sale, quantity must be negative (e.g. -10).');
      return;
    }
    if (form.transaction_type === 'restock' && qty < 0) {
      setError('For a restock, quantity must be positive (e.g. 50).');
      return;
    }

    setLoading(true);
    try {
      await productsAPI.updateStock(product.id, {
        quantity_change: qty,
        transaction_type: form.transaction_type,
        notes: form.notes,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Stock</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <strong>{product.name} – {product.type}</strong><br/>
            Current stock: <strong>{product.stock}</strong>
          </p>

          {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}><span>⚠ {error}</span></div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <select className="form-input form-select" value={form.transaction_type}
                onChange={e => setForm(p => ({ ...p, transaction_type: e.target.value }))}>
                <option value="restock">Restock (add stock)</option>
                <option value="sale">Sale (remove stock)</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Quantity Change
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                  (positive to add, negative to remove)
                </span>
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 50 or -10"
                value={form.quantity_change}
                onChange={e => setForm(p => ({ ...p, quantity_change: e.target.value }))}
                step="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Weekly delivery"
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                maxLength={500}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockUpdateModal;
