import React, { useState, useEffect } from 'react';
import { StorefrontPage } from './pages/Storefront';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPath.startsWith('/dashboard') || window.location.search.includes('admin=true')) {
    const isPerfumesRoute = currentPath.includes('/perfumes');
    return <AdminDashboard initialTab={isPerfumesRoute ? 'perfumes' : 'orders'} />;
  }

  return <StorefrontPage onNavigate={handleNavigate} />;
}
