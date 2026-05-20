import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Dashboard.css';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: any[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/statistics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !data) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải dữ liệu báo cáo...</div>;
  }

  const stats = [
    { 
      label: 'Tổng doanh thu', 
      value: new Intl.NumberFormat('vi-VN').format(data.totalRevenue) + '₫', 
      color: '#c9a96e',
      trend: '15.2%', trendUp: true,
      link: '/admin/orders',
      icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    },
    { 
      label: 'Đơn hàng', 
      value: data.totalOrders.toString(), 
      color: '#27ae60',
      trend: '8.4%', trendUp: true,
      link: '/admin/orders',
      icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
    },
    { 
      label: 'Sản phẩm', 
      value: data.totalProducts.toString(), 
      color: '#2980b9',
      trend: '1.2%', trendUp: false,
      link: '/admin/products',
      icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
    },
    { 
      label: 'Khách hàng', 
      value: data.totalCustomers.toString(), 
      color: '#8e44ad',
      trend: '24.5%', trendUp: true,
      link: '/admin/customers',
      icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Tổng quan hệ thống</h1>
        <p className="admin-dashboard__subtitle">Chào mừng trở lại, đây là những gì đang diễn ra với cửa hàng Velmora của bạn.</p>
      </div>

      <div className="admin-stats-grid">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="admin-stat-card" 
            style={{ borderTop: `4px solid ${stat.color}`, cursor: stat.link ? 'pointer' : 'default' }}
            onClick={() => stat.link && navigate(stat.link)}
          >
            <div className="admin-stat-card__top">
              <span className="admin-stat-card__label">{stat.label}</span>
              <div className="admin-stat-card__icon" style={{ color: stat.color, backgroundColor: `${stat.color}15` }}>
                {stat.icon}
              </div>
            </div>
            <div className="admin-stat-card__value">{stat.value}</div>
            <div className="admin-stat-card__footer">
              <span className={`admin-stat-card__trend ${stat.trendUp ? 'up' : 'down'}`}>
                {stat.trendUp ? '↑' : '↓'} {stat.trend}
              </span>
              <span className="admin-stat-card__period">so với tháng trước</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard__sections">
        <div className="admin-dashboard__section">
          <h3>Đơn hàng mới nhất</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map(order => (
                <tr key={order.id}>
                  <td><strong>ORD-{order.id}</strong></td>
                  <td>{order.customerName}</td>
                  <td>{new Intl.NumberFormat('vi-VN').format(order.totalPrice)}₫</td>
                  <td>
                    <span className={`admin-status-badge ${order.status.toLowerCase()}`}>
                      {(() => {
                        const s = (order.status || '');
                        if (s === 'Pending') return 'Chờ xác nhận';
                        if (s === 'Confirmed') return 'Chờ lấy hàng';
                        if (s === 'Processing') return 'Chờ lấy hàng';
                        if (s === 'Shipping') return 'Chờ giao hàng';
                        if (s === 'Completed') return 'Hoàn tất';
                        if (s === 'Cancelled') return 'Hủy';
                        return order.status;
                      })()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
