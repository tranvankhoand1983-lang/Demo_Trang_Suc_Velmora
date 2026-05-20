import React from 'react';
import { CartItem, Order } from '../../types';
import './InvoiceModal.css';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  return (
    <div className="invoice-overlay" onClick={onClose}>
      <div className="invoice-modal" onClick={e => e.stopPropagation()}>
        {/* Actions bar - Hidden on print */}
        <div className="invoice-actions no-print">
          <button className="invoice-btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Invoice Body */}
        <div className="invoice-document">
          <header className="invoice-header">
            <div className="invoice-brand">
              <h1 className="invoice-logo">VELMORA</h1>
              <p className="invoice-tagline">JEWELRY HOUSE</p>
            </div>
            <div className="invoice-title-box">
              <h2 className="invoice-title">HÓA ĐƠN BÁN HÀNG</h2>
              <p className="invoice-id">Số: {order.id}</p>
              <p className="invoice-date">Thời gian đặt: {new Date(order.date).toLocaleString('vi-VN')}</p>
              <p className="invoice-date">Thanh toán: {new Date(order.paymentDate || order.date).toLocaleString('vi-VN')}</p>
            </div>
          </header>

          <div className="invoice-info-grid">
            <div className="invoice-info-section">
              <h3>Đơn vị bán hàng</h3>
              <p><strong>Công ty TNHH Trang sức VELMORA</strong></p>
              <p>Địa chỉ: 123 Đường Đồng Khởi, Quận 1, TP. HCM</p>
              <p>Điện thoại: 1900 520 131</p>
              <p>Email: contact@velmora.com</p>
            </div>
            <div className="invoice-info-section">
              <h3>Khách hàng</h3>
              <p><strong>{order.recipientName}</strong> {order.company && <span>({order.company})</span>}</p>
              <p>Địa chỉ: {order.address}{order.apartment && `, ${order.apartment}`}</p>
              <p>{[order.city, order.postalCode, order.country].filter(Boolean).join(', ')}</p>
              <p>Số điện thoại: {order.phone}</p>
              <p>Phương thức: {order.paymentMethod || 'VNPay'}</p>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th className="text-right">Số lượng</th>
                <th className="text-right">Đơn giá</th>
                <th className="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="invoice-item-name">
                      {item.product.name}
                      <small>{item.product.material === 'gold' ? 'Vàng' : item.product.material === 'silver' ? 'Bạc' : 'Kim cương'}</small>
                    </div>
                  </td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatPrice(item.priceAtPurchase ?? item.variant?.price ?? item.product.price)}</td>
                  <td className="text-right">{formatPrice((item.priceAtPurchase ?? item.variant?.price ?? item.product.price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right">Tạm tính:</td>
                <td className="text-right">{formatPrice(order.total - (order.shippingMethod === 'express' ? 60000 : order.shippingMethod === 'standard' ? 30000 : 0))}</td>
              </tr>
              <tr>
                <td colSpan={4} className="text-right">Phí vận chuyển:</td>
                <td className="text-right">{formatPrice(order.shippingMethod === 'express' ? 60000 : order.shippingMethod === 'standard' ? 30000 : 0)}</td>
              </tr>
              <tr className="invoice-total-row">
                <td colSpan={4} className="text-right">TỔNG CỘNG:</td>
                <td className="text-right">{formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="invoice-footer">
            <div className="invoice-signature">
              <p>Người mua hàng</p>
              <small>(Ký và ghi rõ họ tên)</small>
            </div>
            <div className="invoice-signature">
              <p>Đại diện VELMORA</p>
              <small>(Ký và đóng dấu)</small>
              {(() => {
                const ps = (order.paymentStatus || '').toLowerCase();
                const os = (order.status || '').toLowerCase();
                if (ps === 'paid') {
                  return (
                    <div className="invoice-stamp">
                      <span>ĐÃ THANH TOÁN</span>
                      <small>{new Date(order.paymentDate || order.date).toLocaleDateString('vi-VN')}</small>
                    </div>
                  );
                }
                if (os === 'hủy' || os === 'đã hủy' || os === 'cancelled' || ps === 'failed') {
                  return (
                    <div className="invoice-stamp invoice-stamp--cancelled">
                      <span>ĐÃ HỦY</span>
                      <small>{new Date(order.date).toLocaleDateString('vi-VN')}</small>
                    </div>
                  );
                }
                return (
                  <div className="invoice-stamp invoice-stamp--pending">
                    <span>CHƯA THANH TOÁN</span>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="invoice-note">
            <p>* Cảm ơn quý khách đã tin tưởng lựa chọn VELMORA Jewelry.</p>
            <p>* Hóa đơn này có giá trị xác nhận sở hữu sản phẩm và phục vụ mục đích bảo hành.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
