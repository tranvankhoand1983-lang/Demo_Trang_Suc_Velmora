import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    
    // Nếu có query params từ PayOS, tiến hành đồng bộ (giải pháp cho localhost)
    if (orderId && status) {
      api.get(`/payos/sync-status?orderId=${orderId}&status=${status}`)
        .then(res => console.log('Đã đồng bộ trạng thái thanh toán:', res.data))
        .catch(err => console.error('Lỗi đồng bộ trạng thái:', err));
    }
  }, [searchParams]);

  return (
    <div className="page-content" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '80px 24px', textAlign: 'center',
      background: 'var(--color-bg)'
    }}>
      <div style={{ maxWidth: '480px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'var(--color-surface)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px',
          border: '2px solid var(--color-gold-light)'
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '12px' }}>
          Đặt hàng thành công
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 400, color: 'var(--color-charcoal)', marginBottom: '16px' }}>
          Cảm ơn bạn!
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: '36px' }}>
          Đơn hàng của bạn đã được xác nhận. Bạn có thể theo dõi thông tin đơn hàng tại mục đơn hàng <Link to="/orders" style={{color: 'var(--color-gold)', textDecoration: 'underline'}}>(tại đây)</Link>.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary">Tiếp Tục Mua Sắm</Link>
          <Link to="/products" className="btn-outline">Xem Sản Phẩm</Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
