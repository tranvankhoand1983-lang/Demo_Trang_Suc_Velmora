import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Footer.css';

interface ShopInfo {
  phone: string;
  email: string;
  workingHours: string;
  address: string;
}

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [shopInfo, setShopInfo] = useState<ShopInfo>({
    phone: '1900 520 131',
    email: 'contact@velmora.com',
    workingHours: 'T2–CN: 8:00 – 23:00',
    address: ''
  });

  useEffect(() => {
    api.get('/shopsettings')
      .then(res => {
        if (res.data) {
          setShopInfo({
            phone: res.data.phone || '1900 520 131',
            email: res.data.email || 'contact@velmora.com',
            workingHours: res.data.workingHours || 'T2–CN: 8:00 – 23:00',
            address: res.data.address || ''
          });
        }
      })
      .catch(() => {}); // fallback to defaults if API fails
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      {/* Main Footer */}
      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            {/* Brand Column */}
            <div className="footer__col footer__brand">
              <div className="footer__logo">
                <span className="footer__logo-text">VELMORA</span>
                <span className="footer__logo-sub">JEWELRY HOUSE</span>
              </div>
              <p className="footer__brand-desc">
                Tinh hoa trang sức Việt Nam — Nơi hội tụ những kiệt tác từ bàn tay nghệ nhân lành nghề.
              </p>
              <div className="footer__socials">
                <a href="#" className="footer__social" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                <a href="#" className="footer__social" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" className="footer__social" aria-label="Pinterest">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                  </svg>
                </a>
                <a href="#" className="footer__social" aria-label="TikTok">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.93a8.16 8.16 0 004.77 1.52V7a4.85 4.85 0 01-1-.31z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Service Column */}
            <div className="footer__col">
              <h4 className="footer__col-title">Dịch Vụ</h4>
              <ul className="footer__links">
                <li><Link to="#">Điều khoản & điều kiện</Link></li>
                <li><Link to="#">Chính sách hoàn tiền</Link></li>
                <li><Link to="#">Chính sách vận chuyển</Link></li>
                <li><Link to="#">Chính sách bảo mật</Link></li>
                <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
                <li><Link to="#">Hướng dẫn mua hàng</Link></li>
              </ul>
            </div>

            {/* Info Column */}
            <div className="footer__col">
              <h4 className="footer__col-title">Thông Tin</h4>
              <ul className="footer__links">
                <li><Link to="#">Về chúng tôi</Link></li>
                <li><Link to="#">Tin tức trang sức</Link></li>
                <li><Link to="#">Quyền lợi thành viên</Link></li>
                <li><Link to="#">Ưu đãi đánh giá</Link></li>
                <li><Link to="/contact">Liên hệ</Link></li>
              </ul>
              <div className="footer__contact">
                <p><span>📞</span> {shopInfo.phone}</p>
                <p><span>✉️</span> {shopInfo.email}</p>
                <p><span>🕐</span> {shopInfo.workingHours}</p>
                {shopInfo.address && <p><span>📍</span> {shopInfo.address}</p>}
              </div>
            </div>

            {/* Newsletter Column */}
            <div className="footer__col">
              <h4 className="footer__col-title">Nhận Ưu Đãi</h4>
              <p className="footer__newsletter-desc">
                Đăng ký nhận thông báo về bộ sưu tập mới và ưu đãi độc quyền.
              </p>
              {subscribed ? (
                <div className="footer__subscribed">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Cảm ơn bạn đã đăng ký!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="footer__newsletter-form">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email của bạn"
                    required
                    className="footer__newsletter-input"
                  />
                  <button type="submit" className="footer__newsletter-btn">Đăng Ký</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container">
          <div className="footer__bottom-inner">
            <p className="footer__copyright">© 2025 VELMORA. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
