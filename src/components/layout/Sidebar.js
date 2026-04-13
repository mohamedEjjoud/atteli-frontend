import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard',  icon: '📊' },
  { to: '/products',  label: 'Products',   icon: '🍫' },
  { to: '/history',   label: 'History',    icon: '📋' },
];

const Sidebar = ({ theme, onThemeToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Atteli</h1>
        <p>Stock Management</p>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={onThemeToggle} title="Toggle dark mode">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <span className="sidebar-username">{user?.username}</span>
            <span className="sidebar-role">{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
