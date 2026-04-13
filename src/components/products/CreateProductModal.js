import React, { useState } from 'react';
import { productsAPI } from '../../services/api';
import { useCategories } from '../../hooks/useProducts';

const CreateProductModal = ({ onClose, onSuccess }) => {
  const { categories } = useCategories();
  const [form, setForm]     = useState({ category_id: '', name: '', type: '', price: '', stock: '', description: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.category_id) e.category_id = 'Category is required';
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.type.trim()) e.type = 'Type is required';
    if (!form.price || parseFloat(form.price) <= 0) e.price = 'Price must be positive';
    if (form.stock === '' || parseInt(form.stock) < 0 || !Number.isInteger(parseFloat(form.stock))) e.stock = 'Stock must be a non-negative integer';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      await productsAPI.create({
        category_id: parseInt(form.category_id),
        name: form.name.trim(),
        type: form.type.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        description: form.description.trim(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Product</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {apiError && <div className="alert alert-error" style={{ marginBottom: 16 }}><span>⚠ {apiError}</span></div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input form-select" value={form.category_id} onChange={set('category_id')}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <span className="form-error">{errors.category_id}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input className="form-input" placeholder="e.g. 1KG Chocolate" value={form.name} onChange={set('name')} />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Type / Variant</label>
                <input className="form-input" placeholder="e.g. Milk" value={form.type} onChange={set('type')} />
                {errors.type && <span className="form-error">{errors.type}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input type="number" className="form-input" placeholder="25.00" min="0.01" step="0.01" value={form.price} onChange={set('price')} />
                {errors.price && <span className="form-error">{errors.price}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input type="number" className="form-input" placeholder="100" min="0" step="1" value={form.stock} onChange={set('stock')} />
                {errors.stock && <span className="form-error">{errors.stock}</span>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input className="form-input" placeholder="Product description" value={form.description} onChange={set('description')} maxLength={500} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;
