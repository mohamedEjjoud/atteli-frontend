import React from 'react';
import { useDashboard } from '../hooks/useProducts';

const StatCard = ({ label, value, color }) => (
  <div className="stat-card" style={{ borderTop: `3px solid ${color || 'var(--accent-primary)'}` }}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value ?? '—'}</div>
  </div>
);

const DashboardPage = () => {
  const { stats, loading, error } = useDashboard();

  if (loading) return (
    <div className="stats-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="stat-card">
          <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 36, width: '40%' }} />
        </div>
      ))}
    </div>
  );

  if (error) return <div className="alert alert-error"><span>⚠ {error}</span></div>;

  const t = stats?.totals || {};

  return (
    <div>
      {parseInt(t.out_of_stock) > 0 && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <span>🚨 {t.out_of_stock} product(s) are out of stock!</span>
        </div>
      )}
      {parseInt(t.low_stock) > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <span>⚠️ {t.low_stock} product(s) are running low on stock.</span>
        </div>
      )}

      <div className="stats-grid">
        <StatCard label="Total Products"   value={t.total_products} color="var(--choc-caramel)" />
        <StatCard label="Total Stock Units" value={t.total_stock}    color="var(--accent-primary)" />
        <StatCard label="Stock Value"       value={t.total_value ? `$${parseFloat(t.total_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'} color="var(--accent-success)" />
        <StatCard label="Out of Stock"      value={t.out_of_stock}   color="var(--accent-danger)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div className="card">
          <h3 className="card-title">Category Breakdown</h3>
          {stats?.categoryBreakdown?.map(c => (
            <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.category}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{c.products} products · {c.total_stock} units</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="card-title">Recent Activity</h3>
          {stats?.recentEvents?.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p>}
          {stats?.recentEvents?.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{e.name} {e.type}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>by {e.username}</span>
              </div>
              <span style={{ color: e.quantity_change > 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 600 }}>
                {e.quantity_change > 0 ? '+' : ''}{e.quantity_change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
