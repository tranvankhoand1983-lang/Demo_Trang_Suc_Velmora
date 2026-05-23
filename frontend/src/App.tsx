import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { CartProvider } from './store/CartContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { FavoritesProvider } from './store/FavoritesContext';
import { VoucherProvider, useVouchers } from './store/VoucherContext';
import ScrollToTop from './Components/layout/ScrollToTop';
import Navbar from './Components/layout/Navbar';
import Footer from './Components/layout/Footer';
import CartDrawer from './Components/layout/CartDrawer';
import AuthModal from './Components/auth/AuthModal';
import VoucherPopup from './Components/VoucherPopup';
import Notification from './Components/common/Notification';
import { NotificationProvider } from './store/NotificationContext';
import AiChatbot from './Components/layout/AiChatbot';

import HomePage from './pages/customer/HomePage';
import AboutPage from './pages/customer/AboutPage';
import FAQPage from './pages/customer/FAQPage';
import ProductsPage from './pages/customer/ProductsPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CheckoutSuccess from './pages/customer/CheckoutSuccess';
import FavoritesPage from './pages/customer/FavoritesPage';
import OrdersPage from './pages/customer/OrdersPage';
import AccountPage from './pages/customer/AccountPage';
import ContactPage from './pages/customer/ContactPage';
import Blog from './pages/customer/Blog';
import NewsPage from './pages/customer/NewsPage';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/ProductList';
import CategoryList from './pages/admin/CategoryList';
import PromotionList from './pages/admin/PromotionList';
import CustomerList from './pages/admin/CustomerList';
import ContentManagement from './pages/admin/ContentManagement';
import OrderList from './pages/admin/OrderList';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';
import './index.css';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { isVoucherOpen, openVoucher, closeVoucher } = useVouchers();
  const [hasShownOnce, setHasShownOnce] = useState(false);
  const prevAuthRef = useRef(isAuthenticated);

  // Show on first access
  useEffect(() => {
    const sessionSeen = sessionStorage.getItem('voucher_hub_seen');
    if (!sessionSeen) {
      const timer = setTimeout(() => {
        openVoucher();
        sessionStorage.setItem('voucher_hub_seen', 'true');
        setHasShownOnce(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setHasShownOnce(true);
    }
  }, [openVoucher]);

  // Show ONLY when logging in (transition from false to true)
  useEffect(() => {
    if (isAuthenticated && !prevAuthRef.current && hasShownOnce) {
      openVoucher();
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, hasShownOnce, openVoucher]);

  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="promotions" element={<PromotionList />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="settings" element={<AdminPlaceholder title="Cấu hình hệ thống" />} />
      </Route>

      <Route path="*" element={
        <>
          <Navbar />
          <main style={{ paddingTop: '96px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/products" element={<ProductsPage key={window.location.search} />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/news" element={<NewsPage />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
          <AuthModal />
          <VoucherPopup isOpen={isVoucherOpen} onClose={closeVoucher} />
          <AiChatbot />
        </>
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <VoucherProvider>
          <NotificationProvider>
            <FavoritesProvider>
              <CartProvider>
                <AppContent />
                <Notification />
              </CartProvider>
            </FavoritesProvider>
          </NotificationProvider>
        </VoucherProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
