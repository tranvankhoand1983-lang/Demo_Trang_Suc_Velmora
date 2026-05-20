import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLocation } from 'react-router-dom';
import { useNotification } from '../../store/NotificationContext';
import './AdminLayout.css';


interface Order {
  id: string;
  firstName: string;
  lastName: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  items: any[];
}

const OrderList: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchKeyword = searchParams.get('search') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);


  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/orders?search=${encodeURIComponent(searchKeyword)}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchKeyword]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      fetchOrders();
      showNotification('Cập nhật trạng thái thành công', 'success');
    } catch (err) {
      showNotification('Không thể cập nhật trạng thái.', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Confirmed': return '#3b82f6';
      case 'Shipping': return '#8b5cf6';
      case 'Completed': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2 className="admin-title">Quản lý Đơn hàng</h2>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Ngày đặt</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Đang tải...</td></tr>
            ) : (orders && Array.isArray(orders) && orders.length > 0) ? orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td style={{ fontWeight: 600 }}>{o.firstName} {o.lastName}</td>
                <td>{new Intl.NumberFormat('vi-VN').format(o.totalAmount)}₫</td>
                <td>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <span className="badge" style={{ backgroundColor: getStatusColor(o.orderStatus), color: 'white' }}>
                    {(() => {
                      const s = (o.orderStatus || '').toLowerCase();
                      if (s === 'pending') return 'Chờ xử lý';
                      if (s === 'processing') return 'Đang xử lý';
                      if (s === 'confirmed') return 'Đã xác nhận';
                      if (s === 'shipping') return 'Đang giao';
                      if (s === 'completed') return 'Hoàn tất';
                      if (s === 'cancelled') return 'Đã hủy';
                      return o.orderStatus;
                    })()}
                  </span>
                </td>
                <td>
                  <select 
                    className="status-select"
                    value={o.orderStatus}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="Pending">Chờ xử lý</option>
                    <option value="Processing">Đang xử lý</option>
                    <option value="Confirmed">Xác nhận</option>
                    <option value="Shipping">Đang giao</option>
                    <option value="Completed">Hoàn tất</option>
                    <option value="Cancelled">Hủy</option>
                  </select>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Không có đơn hàng nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
