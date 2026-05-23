import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './ContentManagement.css';

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  description?: string;
  isActive: boolean;
}

interface ShopSettings {
  id: number;
  email: string;
  phone: string;
  address?: string;
  workingHours: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

const ContentManagement: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<ShopSettings>({
    id: 1,
    email: '',
    phone: '',
    workingHours: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'banners' | 'settings'>('banners');
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    description: '',
    isActive: true
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchBanners();
    fetchSettings();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await api.get('/banners');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/shopsettings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };


  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await api.put(`/banners/${editingBanner.id}`, {
          ...editingBanner,
          ...bannerForm,
          id: editingBanner.id
        });
        showToast('Cập nhật banner thành công!');
      }

      fetchBanners();
      setShowBannerModal(false);
      setEditingBanner(null);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Lỗi khi lưu banner', 'error');
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      description: banner.description || '',
      isActive: banner.isActive
    });
    setShowBannerModal(true);
  };


  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put('/shopsettings', settings);
      setSettings(response.data);
      showToast('Cài đặt hệ thống đã được lưu!');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Lỗi khi lưu cài đặt', 'error');
    }
  };

  const handleSettingsChange = (field: keyof ShopSettings, value: string) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="content-management">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: toast.type === 'success' ? '#1a1a2e' : '#c0392b',
          color: 'white',
          padding: '20px 36px',
          borderRadius: '16px',
          fontSize: '16px',
          fontWeight: 600,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeInScale 0.25s ease',
          letterSpacing: '0.3px'
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
      <div className="content-management__header">
        <h1>Quản lý Nội dung</h1>
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            Banner & Quảng cáo
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Thông tin liên hệ
          </button>
        </div>
      </div>

      {activeTab === 'banners' && (
        <div className="content-management__content admin-card">
          <div className="section-header">
            <h2>Quản lý Banner trang chủ</h2>
            <p className="section-desc">Mỗi banner bao gồm hình ảnh, tiêu đề và mô tả riêng biệt hiển thị tại Hero Section.</p>
          </div>

          <div className="banner-list">
            {banners.map(banner => (
              <div key={banner.id} className="banner-item">
                <div className="banner-image">
                  <img src={banner.imageUrl} alt={banner.title} onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Lỗi+ảnh'} />
                </div>
                <div className="banner-info">
                  <div className="banner-info__main">
                    <h3>{banner.title}</h3>
                    {banner.subtitle && <p className="subtitle">{banner.subtitle}</p>}
                    {banner.description && <p className="desc-preview">{banner.description.substring(0, 100)}...</p>}
                  </div>
                  <div className="banner-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditBanner(banner)}
                    >
                      Sửa nội dung
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="content-management__content admin-card">
          <div className="section-header">
            <h2>Thông tin liên hệ Shop</h2>
            <p className="section-desc">Thông tin này sẽ hiển thị tại Footer và trang Liên hệ của Website.</p>
          </div>

          <form onSubmit={handleSettingsSubmit} className="settings-form admin-form">
            <div className="form-row">
              <div className="form-group">
                <label>Email Liên hệ <span className="required-star">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.email}
                  onChange={(e) => handleSettingsChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại <span className="required-star">*</span></label>
                <input
                  type="tel"
                  className="form-control"
                  value={settings.phone}
                  onChange={(e) => handleSettingsChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giờ làm việc <span className="required-star">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.workingHours}
                  onChange={(e) => handleSettingsChange('workingHours', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ Trụ sở</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.address || ''}
                  onChange={(e) => handleSettingsChange('address', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Facebook Link</label>
                <input
                  type="url"
                  className="form-control"
                  value={settings.facebookUrl || ''}
                  onChange={(e) => handleSettingsChange('facebookUrl', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Instagram Link</label>
                <input
                  type="url"
                  className="form-control"
                  value={settings.instagramUrl || ''}
                  onChange={(e) => handleSettingsChange('instagramUrl', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button type="submit" className="btn-primary">
                Lưu Thông tin liên hệ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 600 }}>
            <button className="admin-modal-close" onClick={() => setShowBannerModal(false)}>×</button>
            <h3>Sửa nội dung Banner</h3>

            <form onSubmit={handleBannerSubmit} className="admin-form">
              <div className="form-group">
                <label>Tiêu đề chính <span className="required-star">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tiêu đề phụ (Subtitle)</label>
                <input
                  type="text"
                  className="form-control"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="Ví dụ: Bộ sưu tập 2026"
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  className="form-control"
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                  rows={4}
                  placeholder="Nhập mô tả hiển thị trên banner..."
                />
              </div>

              <div className="form-group">
                <label>Link Hình ảnh (URL) <span className="required-star">*</span></label>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={bannerForm.imageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                    style={{ flex: 1 }}
                    required
                  />
                  <div style={{
                    width: 100,
                    height: 60,
                    border: '1px dashed #ccc',
                    borderRadius: 8,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9f9f9'
                  }}>
                    {bannerForm.imageUrl ? (
                      <img
                        src={bannerForm.imageUrl}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x60?text=Lỗi+ảnh'; }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, color: '#999', textAlign: 'center' }}>Xem trước<br />ảnh</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: '12px 0' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={bannerForm.isActive}
                  onChange={e => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" style={{ margin: 0, textTransform: 'none' }}>Hiển thị Banner này ngay</label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowBannerModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">
                  Cập nhật Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
