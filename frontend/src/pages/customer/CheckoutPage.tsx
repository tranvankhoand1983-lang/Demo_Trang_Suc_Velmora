import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../store/CartContext';
import { useAuth } from '../../store/AuthContext';
import { useNotification } from '../../store/NotificationContext';

import { CheckoutForm, Order } from '../../types';
import './CheckoutPage.css';

const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

type Step = 'shipping' | 'payment';

const INITIAL_FORM: CheckoutForm = {
  email: '',
  newsletterOptin: false,
  shipping: {
    firstName: '', lastName: '', company: '',
    address: '', apartment: '', city: '',
    country: 'Vietnam', postalCode: '', phone: '',
  },
  shippingMethod: 'free',
  payment: { method: 'credit-card' },
};

const CheckoutPage: React.FC = () => {
  const { state, subtotal, total, clearSelectedItems, applyDiscount, clearDiscount } = useCart();
  const { user, openAuth } = useAuth();
  const { showNotification } = useNotification();

  const navigate = useNavigate();
  const selectedItems = state.items.filter(i => i.selected);
  const [step, setStep] = useState<Step>('shipping');
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountSuccess, setDiscountSuccess] = useState('');
  const [showVoucherSelector, setShowVoucherSelector] = useState(false);
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [showVietQR, setShowVietQR] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [qrAmount, setQrAmount] = useState(0); // Snapshot giá trị trước khi clear cart

  useEffect(() => {
    setDiscountInput(state.discountCode);
  }, [state.discountCode]);

  useEffect(() => {
    if (discountInput.trim() === '' && state.discountAmount > 0) {
      clearDiscount();
      setDiscountError('');
      setDiscountSuccess('');
    }
  }, [discountInput, state.discountAmount, clearDiscount]);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setForm(prev => {
        // Only fill if fields are empty to allow user to override
        const names = user.name.split(' ');
        const lastName = names.length > 1 ? names.pop() : '';
        const firstName = names.join(' ');

        const updatedEmail = prev.email || user.email;
        const updatedFirstName = prev.shipping.firstName || firstName || user.name;
        const updatedLastName = prev.shipping.lastName || lastName || '';

        if (updatedEmail === prev.email &&
          updatedFirstName === prev.shipping.firstName &&
          updatedLastName === prev.shipping.lastName) {
          return prev;
        }

        return {
          ...prev,
          email: updatedEmail,
          shipping: {
            ...prev.shipping,
            firstName: updatedFirstName,
            lastName: updatedLastName
          }
        };
      });
      fetchVouchers();
    }
  }, [user]);

  const fetchVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const res = await api.get('/promotions/my-vouchers');
      // Lọc các mã: chưa dùng, và đúng hạn (việc kiểm tra minOrderAmount sẽ được hiện ở UI)
      const now = new Date();
      const validVouchers = res.data.filter((uv: any) => {
        const promo = uv.promotion;
        const isUsed = uv.isUsed;
        const isExpired = promo.endDate && new Date(promo.endDate) < now;
        const isStarted = !promo.startDate || new Date(promo.startDate) <= now;
        return !isUsed && !isExpired && isStarted;
      });
      setMyVouchers(validVouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const shippingFee = form.shippingMethod === 'standard' ? 30000 : form.shippingMethod === 'express' ? 60000 : 0;
  const grandTotal = total + shippingFee;

  const handleApplyDiscount = async () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) {
      clearDiscount();
      setDiscountError('Vui lòng nhập mã giảm giá');
      setDiscountSuccess('');
      return;
    }

    try {
      const res = await api.get(`/promotions/validate/${code}?orderAmount=${subtotal}`);
      if (res.data.valid) {
        applyDiscount(code, res.data.discountAmount); // Now passing absolute amount
        setDiscountInput(code);
        setDiscountSuccess(`Áp dụng thành công! Giảm ${formatPrice(res.data.discountAmount)}`);
        setDiscountError('');
      }
    } catch (err: any) {
      setDiscountError(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setDiscountSuccess('');
      clearDiscount();
    }
  };

  const applyVoucher = async (code: string) => {
    try {
      const res = await api.get(`/promotions/validate/${code}?orderAmount=${subtotal}`);
      if (res.data.valid) {
        applyDiscount(code, res.data.discountAmount);
        setDiscountInput(code);
        setDiscountSuccess(`Áp dụng thành công! Giảm ${formatPrice(res.data.discountAmount)}`);
        setDiscountError('');
        setShowVoucherSelector(false);
      }
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Không thể áp dụng mã này', 'error');
    }
  };

  const updateShipping = (field: string, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: value },
    }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderData = {
        recipientName: `${form.shipping.firstName} ${form.shipping.lastName}`.trim(),
        email: form.email,
        phone: form.shipping.phone || '',
        address: form.shipping.address,
        company: form.shipping.company,
        apartment: form.shipping.apartment,
        city: form.shipping.city,
        country: form.shipping.country,
        postalCode: form.shipping.postalCode,
        paymentMethod: form.payment.method,
        shippingMethod: form.shippingMethod,
        items: selectedItems.map(item => ({
          productVariantId: item.variant?.id ?? item.variantId ?? item.product?.variants?.[0]?.id ?? 0,
          quantity: item.quantity
        })),
        discountCode: state.discountCode
      };

      const res = await api.post('/orders/place-order', orderData);

      // Đánh dấu sử dụng voucher nếu có
      if (state.discountCode) {
        try {
          await api.post('/promotions/use-voucher', { code: state.discountCode });
        } catch (vErr) {
          console.error('Failed to mark voucher as used', vErr);
        }
      }

      // Snapshot tổng tiền TRƯỚC khi clear giỏ hàng (sau khi clear thì grandTotal = 0)
      const finalAmount = grandTotal;

      clearSelectedItems();
      clearDiscount();

      if (form.payment.method === 'vietqr' && res.data.orderId) {
        setQrAmount(finalAmount);
        setCreatedOrderId(res.data.orderId);
        setShowVietQR(true);
        setIsProcessing(false);
        return;
      }

      if (form.payment.method === 'payos' && res.data.orderId) {
        try {
          const payosRes = await api.post('/payos/create-payment-link', {
            orderId: res.data.orderId,
            amount: finalAmount,
            description: res.data.orderId
          });
          if (payosRes.data.url) {
            window.location.href = payosRes.data.url;
            return;
          }
        } catch (payosErr) {
          console.error('PayOS Error:', payosErr);
          showNotification('Không thể khởi tạo thanh toán PayOS. Vui lòng thử lại.', 'error');
        }
      }

      navigate('/checkout/success');
    } catch (err) {
      showNotification('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', 'error');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNum = (v: string) =>
    v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

  const formatExpiry = (v: string) =>
    v.replace(/\D/g, '').replace(/^(.{2})/, '$1/').slice(0, 5);

  if (selectedItems.length === 0 && !isProcessing && !showVietQR) {
    return (
      <div className="page-content checkout-empty">
        <div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
          <Link to="/products" className="btn-primary" style={{ display: 'inline-flex', marginTop: '24px' }}>
            Mua Sắm Ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page page-content">
      <div className="checkout-page__inner">
        {/* ===== LEFT: FORM ===== */}
        <div className="checkout-form-col">
          {/* Logo */}
          <div className="checkout-logo">
            <Link to="/" className="checkout-logo__link">
              <span className="checkout-logo__text">VELMORA</span>
              <span className="checkout-logo__sub">JEWELRY HOUSE</span>
            </Link>
          </div>

          {/* Breadcrumb Steps */}
          <nav className="checkout-steps">
            <Link to="/cart" className="checkout-step checkout-step--link">Giỏ hàng</Link>
            <span className="checkout-step__sep">›</span>
            <button
              className={`checkout-step ${step === 'shipping' ? 'checkout-step--active' : 'checkout-step--done'}`}
              onClick={() => step === 'payment' && setStep('shipping')}
            >
              Giao hàng
            </button>
            <span className="checkout-step__sep">›</span>
            <span className={`checkout-step ${step === 'payment' ? 'checkout-step--active' : ''}`}>
              Thanh toán
            </span>
          </nav>

          {/* === SHIPPING FORM === */}
          {step === 'shipping' && (
            <form className="checkout-form" onSubmit={handleShippingSubmit}>
              {/* Contact */}
              <div className="checkout-section">
                <div className="checkout-section__header">
                  <h3>Thông Tin Liên Hệ</h3>
                  <span className="checkout-section__hint">
                    Đã có tài khoản? <Link to="#" onClick={() => openAuth('login')}>Đăng nhập</Link>
                  </span>
                </div>
                <div className="form-group">
                  <input
                    id="checkout-email"
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                </div>
                <label className="checkout-checkbox">
                  <input
                    type="checkbox"
                    checked={form.newsletterOptin}
                    onChange={e => setForm(p => ({ ...p, newsletterOptin: e.target.checked }))}
                  />
                  <span className="checkout-checkbox__box" />
                  <span>Nhận thông báo về ưu đãi và sản phẩm mới</span>
                </label>
              </div>

              {/* Shipping Address */}
              <div className="checkout-section">
                <h3>Địa Chỉ Giao Hàng</h3>
                <div className="form-group">
                  <select
                    className="form-control"
                    value={form.shipping.country}
                    onChange={e => updateShipping('country', e.target.value)}
                  >
                    <option value="Vietnam">Việt Nam</option>
                    <option value="US">Hoa Kỳ</option>
                    <option value="SG">Singapore</option>
                  </select>
                </div>
                <div className="checkout-form__row">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Họ"
                      value={form.shipping.firstName}
                      onChange={e => updateShipping('firstName', e.target.value)}
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tên"
                      value={form.shipping.lastName}
                      onChange={e => updateShipping('lastName', e.target.value)}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Công ty (tùy chọn)"
                    value={form.shipping.company}
                    onChange={e => updateShipping('company', e.target.value)}
                    autoComplete="organization"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Địa chỉ"
                    value={form.shipping.address}
                    onChange={e => updateShipping('address', e.target.value)}
                    required
                    autoComplete="street-address"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Căn hộ, tòa nhà, số phòng... (tùy chọn)"
                    value={form.shipping.apartment}
                    onChange={e => updateShipping('apartment', e.target.value)}
                    autoComplete="address-line2"
                  />
                </div>
                <div className="checkout-form__row checkout-form__row--3">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Mã bưu chính"
                      value={form.shipping.postalCode}
                      onChange={e => updateShipping('postalCode', e.target.value)}
                      autoComplete="postal-code"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Thành phố"
                      value={form.shipping.city}
                      onChange={e => updateShipping('city', e.target.value)}
                      required
                      autoComplete="address-level2"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Số điện thoại"
                    value={form.shipping.phone}
                    onChange={e => updateShipping('phone', e.target.value)}
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Shipping Method */}
              <div className="checkout-section">
                <h3>Phương Thức Vận Chuyển</h3>
                <div className="checkout-shipping-methods">
                  {[
                    { id: 'free', label: 'Miễn phí cho đơn từ 10tr', price: subtotal >= 10000000 ? 'Miễn phí' : '0₫', disabled: false },
                    { id: 'standard', label: 'Tiêu chuẩn (3–5 ngày)', price: '30.000₫', disabled: false },
                    { id: 'express', label: 'Nhanh (1–2 ngày)', price: '60.000₫', disabled: false },
                  ].map(m => (
                    <label key={m.id} className={`checkout-shipping-method ${form.shippingMethod === m.id ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={m.id}
                        checked={form.shippingMethod === m.id}
                        onChange={e => setForm(p => ({ ...p, shippingMethod: e.target.value as CheckoutForm['shippingMethod'] }))}
                      />
                      <span className="checkout-shipping-method__radio" />
                      <span className="checkout-shipping-method__label">{m.label}</span>
                      <span className="checkout-shipping-method__price">{m.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="checkout-form__footer">
                <Link to="/" className="checkout-form__back">← Quay lại mua sắm</Link>
                <button type="submit" className="btn-primary checkout-form__next-btn">
                  Tiếp Tục Thanh Toán
                </button>
              </div>
            </form>
          )}

          {/* === PAYMENT FORM === */}
          {step === 'payment' && (
            <form className="checkout-form" onSubmit={handlePayNow}>
              {/* Shipping Summary */}
              <div className="checkout-section checkout-section--summary">
                <div className="checkout-summary-line">
                  <span>Liên hệ</span>
                  <div>
                    <span>{form.email}</span>
                    <button type="button" onClick={() => setStep('shipping')} className="checkout-summary-change">Thay đổi</button>
                  </div>
                </div>
                <div className="checkout-summary-line">
                  <span>Giao hàng đến</span>
                  <div>
                    <span>{form.shipping.address}, {form.shipping.city}</span>
                    <button type="button" onClick={() => setStep('shipping')} className="checkout-summary-change">Thay đổi</button>
                  </div>
                </div>
                <div className="checkout-summary-line">
                  <span>Vận chuyển</span>
                  <div>
                    <span>{form.shippingMethod === 'free' ? 'Miễn phí' : form.shippingMethod === 'standard' ? 'Tiêu chuẩn' : 'Nhanh'}</span>
                    <button type="button" onClick={() => setStep('shipping')} className="checkout-summary-change">Thay đổi</button>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="checkout-section">
                <h3>Thanh Toán</h3>
                <p className="checkout-payment__secure">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Tất cả giao dịch đều được bảo mật và mã hóa.
                </p>

                {/* Credit Card */}
                <label className={`checkout-payment-method ${form.payment.method === 'credit-card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit-card"
                    checked={form.payment.method === 'credit-card'}
                    onChange={() => setForm(p => ({ ...p, payment: { ...p.payment, method: 'credit-card' } }))}
                  />
                  <span className="checkout-payment-method__radio" />
                  <span>Thẻ tín dụng</span>
                  <div className="checkout-payment-method__icons">
                    <span className="checkout-card-icon visa">VISA</span>
                    <span className="checkout-card-icon mc">MC</span>
                    <span className="checkout-card-icon jcb">JCB</span>
                  </div>
                </label>

                {form.payment.method === 'credit-card' && (
                  <div className="checkout-card-fields">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control checkout-card-number"
                        placeholder="Số thẻ"
                        value={cardNum}
                        onChange={e => setCardNum(formatCardNum(e.target.value))}
                        required
                        maxLength={19}
                        autoComplete="cc-number"
                      />
                      <div className="checkout-card-lock">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                      </div>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tên trên thẻ"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        required
                        autoComplete="cc-name"
                      />
                    </div>
                    <div className="checkout-form__row">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ngày hết hạn (MM / YY)"
                          value={expiry}
                          onChange={e => setExpiry(formatExpiry(e.target.value))}
                          required
                          maxLength={5}
                          autoComplete="cc-exp"
                        />
                      </div>
                      <div className="form-group" style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Mã bảo mật"
                          value={cvv}
                          onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          required
                          maxLength={4}
                          autoComplete="cc-csc"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* VietQR */}
                <label className={`checkout-payment-method ${form.payment.method === 'vietqr' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vietqr"
                    checked={form.payment.method === 'vietqr'}
                    onChange={() => setForm(p => ({ ...p, payment: { ...p.payment, method: 'vietqr' } }))}
                  />
                  <span className="checkout-payment-method__radio" />
                  <div className="vietqr-method-label">
                    <div className="vietqr-logo-inline">
                      <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="6" fill="#005baa" />
                        <rect x="6" y="6" width="8" height="8" rx="1" fill="white" />
                        <rect x="18" y="6" width="8" height="8" rx="1" fill="white" />
                        <rect x="6" y="18" width="8" height="8" rx="1" fill="white" />
                        <rect x="20" y="20" width="4" height="4" rx="0.5" fill="white" />
                        <rect x="18" y="18" width="4" height="4" rx="0.5" fill="white" />
                        <rect x="26" y="18" width="2" height="8" rx="0.5" fill="white" />
                        <rect x="18" y="26" width="8" height="2" rx="0.5" fill="white" />
                      </svg>
                      <span className="vietqr-text-blue">Viet</span><span className="vietqr-text-red">QR</span>
                    </div>
                    <span className="napas-tag">NAPAS 24/7</span>
                  </div>
                  <div className="checkout-payment-method__icons">
                    <span className="vietqr-bank-tag">MB</span>
                    <span className="vietqr-bank-tag">TCB</span>
                    <span className="vietqr-bank-tag">VCB</span>
                  </div>
                </label>

                {/* PayOS */}
                <label className={`checkout-payment-method ${form.payment.method === 'payos' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="payos"
                    checked={form.payment.method === 'payos'}
                    onChange={() => setForm(p => ({ ...p, payment: { ...p.payment, method: 'payos' } }))}
                  />
                  <span className="checkout-payment-method__radio" />
                  <div className="vnpay-method-label">
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>PayOS (Quét mã VietQR)</span>
                  </div>
                </label>
                {/* VietQR Info Panel */}
                {form.payment.method === 'vietqr' && (
                  <div className="vietqr-info-panel">
                    <div className="vietqr-info-panel__icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div className="vietqr-info-panel__content">
                      <p className="vietqr-info-panel__title">Thanh toán bằng chuyển khoản QR</p>
                      <p className="vietqr-info-panel__desc">Sau khi đặt hàng, bạn sẽ nhận được mã QR để quét bằng app ngân hàng.
                        Hỗ trợ <strong>tất cả ngân hàng Việt Nam</strong> qua chuẩn NAPAS.</p>
                    </div>
                  </div>
                )}

                {/* PayOS Info Panel */}
                {form.payment.method === 'payos' && (
                  <div className="vnpay-info-panel">
                    <div className="vnpay-info-panel__icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div className="vnpay-info-panel__content">
                      <p className="vnpay-info-panel__title">Thanh toán qua PayOS (VietQR)</p>
                      <p className="vnpay-info-panel__desc">Bạn sẽ được chuyển hướng sang cổng thanh toán an toàn của PayOS để quét mã QR bằng app ngân hàng của mình.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="checkout-form__footer">
                <button type="button" className="checkout-form__back" onClick={() => setStep('shipping')}>
                  ← Quay lại giao hàng
                </button>
                <button type="submit" className="btn-primary checkout-form__pay-btn" disabled={isProcessing}>
                  {isProcessing ? (
                    <span className="auth-modal__spinner" />
                  ) : (
                    <>
                      Thanh Toán Ngay
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ===== RIGHT: ORDER SUMMARY ===== */}
        <div className="checkout-summary-col">
          <div className="checkout-summary">
            {/* Items */}
            <div className="checkout-summary__items">
              {selectedItems.map(item => (
                <div key={`${item.product.id}-${item.size || 'default'}`} className="checkout-summary__item">
                  <div className="checkout-summary__item-image">
                    <img src={item.product.images[0]} alt={item.product.name} />
                    <span className="checkout-summary__item-qty">{item.quantity}</span>
                  </div>
                  <div className="checkout-summary__item-info">
                    <p className="checkout-summary__item-name">{item.product.name}</p>
                    <p className="checkout-summary__item-material">
                      {item.product.material === 'gold' ? 'Vàng' :
                        item.product.material === 'silver' ? 'Bạc' :
                          item.product.material === 'platinum' ? 'Bạch Kim' : 'Kim Cương'}
                    </p>
                    {item.size && (
                      <p className="checkout-summary__item-size">Kích thước: {item.size}</p>
                    )}
                  </div>
                  <span className="checkout-summary__item-price">
                    {formatPrice((item.priceAtPurchase ?? item.variant?.price ?? item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout-summary__discount">
              <div className="checkout-summary__discount-field">
                <input
                  type="text"
                  placeholder="Mã giảm giá hoặc thẻ quà tặng"
                  value={discountInput}
                  onChange={e => {
                    const value = e.target.value;
                    setDiscountInput(value);
                    if (!value.trim()) {
                      clearDiscount();
                      setDiscountError('');
                      setDiscountSuccess('');
                    }
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleApplyDiscount()}
                  className="checkout-summary__discount-input"
                />
                <button className="checkout-summary__discount-btn" type="button" onClick={handleApplyDiscount}>Áp Dụng</button>
              </div>
              <button
                type="button"
                className="checkout-voucher-list-trigger"
                onClick={() => setShowVoucherSelector(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Chọn mã giảm giá của bạn
              </button>
            </div>
            {(discountError || discountSuccess) && (
              <div className="checkout-summary__discount-message">
                {discountError ? <span className="error-text">{discountError}</span> : <span className="success-text">{discountSuccess}</span>}
              </div>
            )}

            {/* Totals */}
            <div className="checkout-summary__totals">
              <div className="checkout-summary__total-row">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {state.discountAmount > 0 && (
                <div className="checkout-summary__total-row checkout-summary__discount-row">
                  <span>Giảm giá ({state.discountCode})</span>
                  <span>-{formatPrice(state.discountAmount)}</span>
                </div>
              )}
              <div className="checkout-summary__total-row">
                <span>Vận chuyển</span>
                <span className={shippingFee === 0 ? 'free-ship' : ''}>
                  {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="checkout-summary__total-row checkout-summary__grand-total">
                <span>Tổng cộng</span>
                <div>
                  <small>VND</small>
                  <strong>{formatPrice(grandTotal)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Selection Modal */}
      {showVoucherSelector && (
        <div className="voucher-selector-overlay" onClick={() => setShowVoucherSelector(false)}>
          <div className="voucher-selector-modal" onClick={e => e.stopPropagation()}>
            <div className="voucher-selector-header">
              <h3>Mã giảm giá của bạn</h3>
              <button className="voucher-selector-close" onClick={() => setShowVoucherSelector(false)}>&times;</button>
            </div>

            <div className="voucher-selector-list">
              {loadingVouchers ? (
                <div className="voucher-selector-loading">Đang tải...</div>
              ) : myVouchers.length === 0 ? (
                <div className="voucher-selector-empty">Bạn chưa có mã giảm giá nào</div>
              ) : (
                myVouchers.map(uv => {
                  const promo = uv.promotion;
                  const isUsed = uv.isUsed;
                  const isExpired = promo.endDate && new Date(promo.endDate) < new Date();
                  const isEligible = subtotal >= (promo.minOrderAmount || 0);

                  const disabled = isUsed || isExpired || !isEligible;

                  return (
                    <div
                      key={uv.id}
                      className={`voucher-selector-card ${disabled ? 'disabled' : ''}`}
                      onClick={() => !disabled && applyVoucher(promo.code)}
                    >
                      <div className="voucher-selector-card-left">
                        <span className="vsc-discount">{promo.discount}%</span>
                        <span className="vsc-label">GIẢM</span>
                      </div>
                      <div className="voucher-selector-card-right">
                        <h4 className="vsc-name">{promo.name}</h4>
                        <p className="vsc-min">Đơn tối thiểu: {formatPrice(promo.minOrderAmount || 0)}</p>
                        <p className="vsc-expiry">HSD: {promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : 'Vô hạn'}</p>

                        {!isEligible && !isUsed && !isExpired && (
                          <p className="vsc-error">Chưa đủ điều kiện (Thiếu {formatPrice((promo.minOrderAmount || 0) - subtotal)})</p>
                        )}
                        {isUsed && <p className="vsc-status used">Đã sử dụng</p>}
                        {isExpired && <p className="vsc-status expired">Hết hạn</p>}
                      </div>
                      {!disabled && <button className="vsc-apply-btn">Dùng</button>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
      {/* === VIETQR MODAL === */}
      {showVietQR && (
        <div className="vietqr-modal-overlay">
          <div className="vietqr-modal">
            <div className="vietqr-modal__header">
              <h3>Thanh Toán Qua VietQR</h3>
              <p>Vui lòng quét mã QR bên dưới để thanh toán đơn hàng <strong>{createdOrderId}</strong></p>
            </div>

            <div className="vietqr-modal__content">
              <div className="vietqr-image-wrapper">
                <img
                  src={`https://img.vietqr.io/image/MB-4000676869-compact2.png?amount=${qrAmount}&addInfo=${encodeURIComponent(`Thanh toan don hang ${createdOrderId}`)}&accountName=${encodeURIComponent('Le Minh Quan')}`}
                  alt="VietQR Payment"
                />
              </div>

              <div className="vietqr-details">
                <div className="vietqr-detail-item">
                  <span className="label">Ngân hàng:</span>
                  <span className="value">MB Bank (Quân Đội)</span>
                </div>
                <div className="vietqr-detail-item">
                  <span className="label">Chủ tài khoản:</span>
                  <span className="value">Lê Minh Quân</span>
                </div>
                <div className="vietqr-detail-item">
                  <span className="label">Số tài khoản:</span>
                  <span className="value vietqr-account-num">4000676869</span>
                </div>
                <div className="vietqr-detail-item">
                  <span className="label">Số tiền:</span>
                  <span className="value" style={{ color: '#c9a96e', fontWeight: '700' }}>{formatPrice(qrAmount)}</span>
                </div>
                <div className="vietqr-detail-item">
                  <span className="label">Nội dung:</span>
                  <span className="value" style={{ fontWeight: '600' }}>Thanh toan don hang {createdOrderId}</span>
                </div>
              </div>
            </div>

            <div className="vietqr-modal__footer">
              <p className="vietqr-hint">Hệ thống sẽ tự động xác nhận sau khi nhận được tiền.</p>
              <button
                className="btn-primary"
                onClick={() => navigate('/checkout/success')}
                style={{ width: '100%' }}
              >
                Tôi đã chuyển khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
