import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await productsAPI.getAll(filters);
      setProducts(data.data.products);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    productsAPI.getCategories()
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => {});
  }, []);
  return { categories };
}

export function useDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    productsAPI.getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}
