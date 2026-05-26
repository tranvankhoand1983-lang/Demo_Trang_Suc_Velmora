import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { 
  LayoutDashboard, 
  Gem, 
  FolderTree, 
  Gift, 
  Users, 
  FileText, 
  ShoppingBag, 
  Settings,
  LogOut,
  Home,
  Bell,
  Moon,
  Search,
  TrendingUp
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Protect the route
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // Clear search if empty
      const params = new URLSearchParams(location.search);
      params.delete('search');
      navigate({ pathname: location.pathname, search: params.toString() });
      return;
    }

    // Redirect or update current page with search param
    const params = new URLSearchParams(location.search);
    params.set('search', searchQuery.trim());
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  // Sync search input with URL params on navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

  const navItems = [
    { path: '/admin', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/products', label: 'Sản phẩm', icon: <Gem size={20} /> },
    { path: '/admin/categories', label: 'Danh mục', icon: <FolderTree size={20} /> },
    { path: '/admin/promotions', label: 'Khuyến mãi', icon: <Gift size={20} /> },
    { path: '/admin/customers', label: 'Khách hàng', icon: <Users size={20} /> },
    { path: '/admin/content', label: 'Nội dung', icon: <FileText size={20} /> },
    { path: '/admin/orders', label: 'Đơn hàng', icon: <ShoppingBag size={20} /> },
    { path: '/admin/ai-prediction', label: 'AI Dự báo', icon: <TrendingUp size={20} /> },
    { path: '/admin/settings', label: 'Cấu hình', icon: <Settings size={20} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <Link to="/">
            <span className="admin-sidebar__logo-text">VELMORA</span>
            <span className="admin-sidebar__logo-sub">ADMIN PORTAL</span>
          </Link>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar__link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="admin-sidebar__link-icon">{item.icon}</span>
              <span className="admin-sidebar__link-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="admin-sidebar__user-info">
              <span className="admin-sidebar__user-name">{user.name}</span>
              <span className="admin-sidebar__user-role">Administrator</span>
            </div>
          </div>
          <button className="admin-sidebar__logout" onClick={logout}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <form className="admin-header__search" onSubmit={handleSearch}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhanh..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="admin-header__actions">
            <Link to="/" className="admin-header__store-btn">
              <Home size={16} /> Quay lại cửa hàng
            </Link>
            <button className="admin-header__btn"><Bell size={20} /></button>
            <button className="admin-header__btn"><Moon size={20} /></button>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
