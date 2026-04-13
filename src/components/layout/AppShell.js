import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/products':  'Products',
  '/history':   'History',
};

const AppShell = ({ theme, onThemeToggle }) => {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Atteli';

  return (
    <div className="app-shell">
      <Sidebar theme={theme} onThemeToggle={onThemeToggle} />
      <div className="main-content">
        <header className="page-header">
          <h2 className="page-title">{title}</h2>
        </header>
        <main className="page-body">
          <Outlet />
        </main>
        <footer className="page-footer">
          © 2026 Atteli. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AppShell;
