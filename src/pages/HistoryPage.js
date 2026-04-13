import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { useProducts } from '../hooks/useProducts';

const HistoryPage = () => {
  const { products } = useProducts();
  const [selectedId, setSelectedId] = useState('');
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError('');
    productsAPI.getHistory(selectedId)
      .then(({ data }) => setHistory(data.data.history))
      .catch(err => setError(err.response?.data?.error || 'Failed to load history'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const typeColors = {
    restock:     'var(--accent-success)',
    sale:        'var(--accent-danger)',
    adjustment:  'var(--accent-info)',
    out_of_stock:'var(--accent-danger)',
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <select
          className="form-input form-select"
          style={{ width: 280 }}
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          <option value="">Select a product to view history</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name} – {p.type}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error"><span>⚠ {error}</span></div>}

      {!selectedId && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p>Select a product to view its stock history.</p>
        </div>
      )}

      {loading && (
        <div className="card">
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div className="skeleton" style={{ height: 14, width: '15%' }} />
              <div className="skeleton" style={{ height: 14, width: '30%' }} />
              <div className="skeleton" style={{ height: 14, width: '20%' }} />
            </div>
          ))}
        </div>
      )}

      {!loading && selectedId && history.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>No history found for this product.</p>
      )}

      {!loading && history.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Date', 'Type', 'Before', 'Change', 'After', 'User', 'Notes'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: typeColors[row.event_type] || 'var(--text-primary)', background: (typeColors[row.event_type] || 'var(--text-primary)') + '20', padding: '2px 8px', borderRadius: 20 }}>
                      {row.event_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{row.quantity_before}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: row.quantity_change > 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {row.quantity_change > 0 ? '+' : ''}{row.quantity_change}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.quantity_after}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{row.username}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>{row.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
