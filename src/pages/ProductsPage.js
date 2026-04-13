import React, { useState } from "react";
import { useProducts, useCategories } from "../hooks/useProducts";
import { useAuth } from "../store/AuthContext";
import { productsAPI } from "../services/api";
import StockUpdateModal from "../components/products/StockUpdateModal";
import CreateProductModal from "../components/products/CreateProductModal";

const getStockBadge = (stock) => {
  if (stock === 0)
    return { label: "Out of Stock", color: "var(--accent-danger)" };
  if (stock <= 10)
    return { label: "Low Stock", color: "var(--accent-warning)" };
  return { label: "In Stock", color: "var(--accent-success)" };
};

const ProductsPage = () => {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const { products, loading, error, refetch } = useProducts({
    is_active: true,
  });
  const { categories } = useCategories();
  const [stockModal, setStockModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (product) => {
    if (
      !window.confirm(
        `Delete "${product.name} - ${product.type}"? This cannot be undone.`,
      )
    )
      return;
    setDeletingId(product.id);
    try {
      await productsAPI.delete(product.id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const displayed = products.filter((p) => {
    const matchSearch =
      !search ||
      `${p.name} ${p.type}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || String(p.category_id) === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            className="form-input"
            style={{ width: 220 }}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-input form-select"
            style={{ width: 180 }}
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setCreateModal(true)}
          >
            + Add Product
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <span>⚠ {error}</span>
        </div>
      )}

      {loading ? (
        <div className="product-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="product-card">
              <div
                className="skeleton"
                style={{ height: 20, width: "70%", marginBottom: 12 }}
              />
              <div
                className="skeleton"
                style={{ height: 14, width: "40%", marginBottom: 8 }}
              />
              <div className="skeleton" style={{ height: 32, width: "50%" }} />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍫</div>
          <p>No products found.</p>
        </div>
      ) : (
        <div className="product-grid">
          {displayed.map((p) => {
            const badge = getStockBadge(p.stock);
            return (
              <div key={p.id} className="product-card">
                <div className="product-card-header">
                  <div>
                    <h4 className="product-name">{p.name}</h4>
                    <p className="product-type">{p.type}</p>
                  </div>
                  <span className="product-category">{p.category_name}</span>
                </div>
                <div className="product-stats">
                  <div>
                    <div className="product-stat-label">Stock</div>
                    <div className="product-stat-value">{p.stock}</div>
                  </div>
                  <div>
                    <div className="product-stat-label">Price</div>
                    <div className="product-stat-value">
                      ${parseFloat(p.price).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 16,
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: badge.color,
                      background: badge.color + "20",
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}
                  >
                    {badge.label}
                  </span>
                  {isAdmin && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 14px", fontSize: 13 }}
                        onClick={() => setStockModal(p)}
                      >
                        Update Stock
                      </button>
                      <button
                        className="btn"
                        style={{
                          padding: "6px 12px",
                          fontSize: 13,
                          background: "rgba(192,57,43,0.1)",
                          color: "var(--accent-danger)",
                          border: "1px solid rgba(192,57,43,0.2)",
                        }}
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        title="Delete product"
                      >
                        {deletingId === p.id ? "..." : "🗑"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {stockModal && (
        <StockUpdateModal
          product={stockModal}
          onClose={() => setStockModal(null)}
          onSuccess={refetch}
        />
      )}
      {createModal && (
        <CreateProductModal
          onClose={() => setCreateModal(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default ProductsPage;
