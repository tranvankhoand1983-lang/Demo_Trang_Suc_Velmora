import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import './AuthModal.css';

const AuthModal: React.FC = () => {
  const { isAuthOpen, authTab, openAuth, closeAuth, login, loginWithGoogle, register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleClose = () => {
    closeAuth();
    setIsForgotPassword(false);
    setError('');
    setSuccessMessage('');
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const res = await api.post('/account/forgot-password', { email });
      if (res.data && res.data.hint) {
        setSuccessMessage(res.data.hint);
      } else {
        setSuccessMessage('Khôi phục mật khẩu thành công! Vui lòng kiểm tra thông tin hiển thị.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu khôi phục mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const ok = await loginWithGoogle(tokenResponse.access_token);
        if (!ok) setError('Đăng nhập bằng Google thất bại.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Lỗi khi kết nối Google.'),
  });

  if (!isAuthOpen) return null;

  const handleGoogle = () => {
    googleLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (authTab === 'login') {
        const ok = await login(email, password);
        if (!ok) {
          setError('Email hoặc mật khẩu không đúng');
        } else {
          // Check if admin and redirect
          if (email === 'admin@velmora.com') {
            navigate('/admin');
          }
        }
      } else {
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          setIsLoading(false);
          return;
        }
        await register(name, email, password);
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="overlay auth-overlay" onClick={handleClose} />
      <div className="auth-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <button className="auth-modal__close" onClick={handleClose} aria-label="Đóng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="auth-modal__logo">
          <span className="auth-modal__logo-text">VELMORA</span>
          <span className="auth-modal__logo-sub">JEWELRY HOUSE</span>
        </div>

        {isForgotPassword ? (
          <>
            <div className="auth-modal__forgot-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#333' }}>Khôi Phục Mật Khẩu</h3>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                Nhập email của bạn để nhận mật khẩu tạm thời mới.
              </p>
            </div>

            <form className="auth-modal__form" onSubmit={handleForgotPasswordSubmit}>
              <div className="form-group">
                <label htmlFor="auth-forgot-email">Email tài khoản</label>
                <input
                  id="auth-forgot-email"
                  type="email"
                  className="form-control"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {error && <p className="auth-modal__error">{error}</p>}
              {successMessage && (
                <div className="auth-modal__success" style={{ color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '12px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5', border: '1px solid #c8e6c9' }}>
                  {successMessage}
                </div>
              )}

              <button type="submit" className="btn-primary auth-modal__submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="auth-modal__spinner" />
                ) : 'Gửi Yêu Cầu'}
              </button>
            </form>

            <p className="auth-modal__switch" style={{ marginTop: '20px' }}>
              <button onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMessage(''); }}>
                Quay lại Đăng nhập
              </button>
            </p>
          </>
        ) : (
          <>
            {/* Tabs */}
            <div className="auth-modal__tabs">
              <button
                className={`auth-modal__tab ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => { openAuth('login'); setError(''); }}
              >
                Đăng Nhập
              </button>
              <button
                className={`auth-modal__tab ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => { openAuth('register'); setError(''); }}
              >
                Đăng Ký
              </button>
            </div>

            {/* Google Button */}
            <button
              className="auth-modal__google-btn"
              onClick={handleGoogle}
              disabled={isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Tiếp tục với Google
            </button>

            <div className="auth-modal__divider">
              <span>hoặc</span>
            </div>

            {/* Form */}
            <form className="auth-modal__form" onSubmit={handleSubmit}>
              {authTab === 'register' && (
                <div className="form-group">
                  <label htmlFor="auth-name">Họ và tên</label>
                  <input
                    id="auth-name"
                    type="text"
                    className="form-control"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  className="form-control"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-password">Mật khẩu</label>
                <div className="auth-modal__password-wrapper">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete={authTab === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="auth-modal__password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {authTab === 'register' && (
                <div className="form-group">
                  <label htmlFor="auth-confirm">Xác nhận mật khẩu</label>
                  <input
                    id="auth-confirm"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}

              {authTab === 'login' && (
                <div className="auth-modal__forgot">
                  <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMessage(''); }}>Quên mật khẩu?</button>
                </div>
              )}

              {error && <p className="auth-modal__error">{error}</p>}

              <button type="submit" className="btn-primary auth-modal__submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="auth-modal__spinner" />
                ) : authTab === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
              </button>
            </form>

            {/* Switch Tab */}
            <p className="auth-modal__switch">
              {authTab === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <button onClick={() => openAuth(authTab === 'login' ? 'register' : 'login')}>
                {authTab === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default AuthModal;
