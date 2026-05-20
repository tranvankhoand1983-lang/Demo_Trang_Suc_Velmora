import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { CartItem, Order } from '../../types';
import InvoiceModal from '../../Components/order/InvoiceModal';
import './OrdersPage.css';

const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

const OrdersPage: React.FC = () => {
  const { user, isAuthenticated, openAuth } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        // Map API DTO to the local Order type
        const mappedOrders: Order[] = res.data.map((o: any) => ({
          id: o.id,
          date: o.createdAt,
          paymentDate: o.paidAt || o.createdAt,
          items: o.items.map((item: any) => ({
            product: { name: item.productName, images: [item.productImage || ''] },
            quantity: item.quantity,
            size: item.size,
            priceAtPurchase: item.price
          })),
          total: o.totalAmount,
          status: (() => {
            const s = (o.orderStatus || '');
            if (s === 'Pending') return 'Chờ xác nhận';
            if (s === 'Confirmed') return 'Chờ lấy hàng';
            if (s === 'Processing') return 'Chờ lấy hàng';
            if (s === 'Shipping') return 'Chờ giao hàng';
            if (s === 'Completed') return 'Hoàn tất';
            if (s === 'Cancelled') return 'Hủy';
            return o.orderStatus;
          })(),
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod || 'PayOS', // Fallback to PayOS if null
          shippingMethod: o.shippingMethod || 'Standard',
          recipientName: o.recipientName,
          email: o.email || '',
          phone: o.phone || '',
          address: o.address || '',
          company: o.company || '',
          apartment: o.apartment || '',
          city: o.city || '',
          country: o.country || '',
          postalCode: o.postalCode || ''
        }));
        setOrders(mappedOrders);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      }
    };

    if (isAuthenticated && user) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="page-content orders-page--empty">
        <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
          <h2>Vui lòng đăng nhập</h2>
          <p style={{ marginTop: '16px', color: 'var(--color-muted)' }}>Bạn cần đăng nhập để xem lịch sử đơn hàng của mình.</p>
          <button className="btn-primary" style={{ marginTop: '24px' }} onClick={() => openAuth('login')}>Đăng Nhập Ngay</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content orders-page">
      <div className="orders-page__inner wrapper">
        <h1 className="orders-page__title">Đơn hàng của tôi</h1>
        
        {orders.length === 0 ? (
          <div className="orders-page--empty">
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-surface)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--color-muted)' }}>Bạn chưa có đơn hàng nào.</p>
              <Link to="/products" className="btn-outline" style={{ marginTop: '24px', display: 'inline-block' }}>Mua Sắm Ngay</Link>
            </div>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div
                key={order.id}
                className={`order-card ${expandedOrderId === order.id ? 'order-card--expanded' : ''}`}
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              >
                <div className="order-card__header">
                  <div className="order-card__info-group">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="order-card__id">{order.id}</span>
                      <span className={`order-card__status status-${order.status === 'Đang xử lý' ? 'processing' : 'completed'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-card__date">
                      <span>Ngày đặt: {new Date(order.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="order-card__summary-images">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="order-card__summary-img-wrap">
                        <img src={item.product.images[0]} alt={item.product.name} />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="order-card__summary-more">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="order-card__toggle-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points={expandedOrderId === order.id ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                    </svg>
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="order-details" onClick={e => e.stopPropagation()}>
                    <div className="order-details__section">
                      <h4>Thông tin giao hàng</h4>
                      <div className="order-details__grid">
                        <div className="order-details__item">
                          <label>Người nhận</label>
                          <span>{order.recipientName || user?.name}</span>
                        </div>
                        <div className="order-details__item">
                          <label>Email</label>
                          <span>{order.email || user?.email}</span>
                        </div>
                        <div className="order-details__item">
                          <label>Số điện thoại</label>
                          <span>{order.phone || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="order-details__item">
                          <label>Địa chỉ</label>
                          <span>
                            {order.address}
                            {order.apartment && `, ${order.apartment}`}
                            {order.company && ` (${order.company})`}
                            <br />
                            {[order.city, order.postalCode, order.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                        <div className="order-details__item">
                          <label>Phương thức vận chuyển</label>
                          <span>{order.shippingMethod || 'Tiêu chuẩn'}</span>
                        </div>
                        <div className="order-details__item">
                          <label>Dự kiến giao hàng</label>
                          <span className="order-details__highlight">
                            {order.estimatedDelivery 
                              ? new Date(order.estimatedDelivery).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                              : 'Đang cập nhật'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="order-details__section">
                      <h4>Thanh toán</h4>
                      <div className="order-details__grid">
                        <div className="order-details__item">
                          <label>Phương thức</label>
                          <span>{order.paymentMethod || 'Thẻ tín dụng'}</span>
                        </div>
                        <div className="order-details__item">
                           <label>Tình trạng thanh toán</label>
                           {(() => {
                             const ps = (order.paymentStatus || '').toLowerCase();
                             const os = (order.status || '').toLowerCase();
                             if (ps === 'paid' || os === 'chờ lấy hàng' || os === 'chờ giao hàng' || os === 'hoàn tất') return <span style={{ color: '#27ae60', fontWeight: '600' }}>Đã thanh toán</span>;
                             if (os === 'hủy' || ps === 'failed') return <span style={{ color: '#ef4444', fontWeight: '600' }}>Đã hủy</span>;
                             return <span style={{ color: '#f59e0b', fontWeight: '600' }}>Chưa thanh toán</span>;
                           })()}
                         </div>
                        <div className="order-details__item">
                          <label>Thời gian thanh toán</label>
                          <span>{new Date(order.paymentDate || order.date).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="order-details__section">
                      <h4>Sản phẩm đã chọn</h4>
                      <div className="order-card__items">
                        {order.items.map((item, index) => (
                          <div key={`${item.product.id}-${item.size || 'default'}-${index}`} className="order-item">
                            <img src={item.product.images[0]} alt={item.product.name} className="order-item__image" />
                            <div className="order-item__info">
                              <p className="order-item__name">{item.product.name}</p>
                              <p className="order-item__qty">Số lượng: {item.quantity}</p>
                              {item.size && <p className="order-item__size">Kích thước: {item.size}</p>}
                            </div>
                            <span className="order-item__price">{formatPrice((item.priceAtPurchase ?? item.variant?.price ?? item.product.price) * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="order-card__footer">
                  <div className="order-card__footer-left">
                    <span className="order-card__total-label">Tổng thanh toán:</span>
                    <span className="order-card__total-value">{formatPrice(order.total)}</span>
                  </div>
                  <div className="order-card__footer-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Nút tiếp tục thanh toán - hiện khi chưa thanh toán và chưa hủy */}
                    {order.paymentStatus?.toLowerCase() !== 'paid' && order.status !== 'Hủy' && order.status !== 'Hoàn tất' && order.paymentMethod?.toLowerCase() !== 'cod' && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '13px', padding: '8px 16px' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const res = await api.post('/payos/create-payment-link', {
                              orderId: order.id,
                              amount: order.total,
                              description: 'Thanh toán đơn ' + order.id
                            });
                            window.location.href = res.data.url;
                          } catch (err) {
                            alert('Không thể tạo link thanh toán. Vui lòng thử lại.');
                          }
                        }}
                      >
                        Tiếp tục thanh toán
                      </button>
                    )}
                    {/* Nút hủy đơn - hiện khi chưa thanh toán và chưa hủy */}
                    {order.paymentStatus?.toLowerCase() !== 'paid' && order.status !== 'Hủy' && order.status !== 'Hoàn tất' && (
                      <button
                        className="btn-outline"
                        style={{ fontSize: '13px', padding: '8px 16px', color: '#e74c3c', borderColor: '#e74c3c' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                            try {
                              await api.patch(`/orders/${order.id}/cancel`);
                              setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Hủy', paymentStatus: 'Failed' } : o));
                            } catch (err) {
                              alert('Có lỗi xảy ra khi hủy đơn hàng');
                            }
                          }
                        }}
                      >
                        Hủy đơn
                      </button>
                    )}
                    {order.status === 'Chờ giao hàng' && (
                      <button
                        className="btn-primary"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Bạn xác nhận đã nhận được đơn hàng này?')) {
                            try {
                              await api.patch(`/orders/${order.id}/receive`);
                              setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Hoàn tất' } : o));
                            } catch (err) {
                              alert('Có lỗi xảy ra khi xác nhận nhận hàng');
                            }
                          }
                        }}
                      >
                        Đã nhận được hàng
                      </button>
                    )}
                    <button 
                      className="btn-invoice-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoice(order);
                      }}
                    >
                      Xem hóa đơn
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Modal Overlay */}
      {selectedInvoice && (
        <InvoiceModal 
          order={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
};

export default OrdersPage;
