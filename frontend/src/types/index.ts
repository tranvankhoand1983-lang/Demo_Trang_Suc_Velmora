// Product types
export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  size: string;
  price: number;
  originalPrice?: number;
  stockQuantity?: number;
  isSale?: boolean;
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  material: string;
  images: string[];
  description: string;
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
  rating: number;
  reviews: number;
  sku: string;
  stockQuantity?: number;
  originStory?: string;
  availableSizes?: string[];
  variants?: ProductVariant[];
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  size?: string;
  variant?: ProductVariant;
  variantId?: number;
  priceAtPurchase?: number;
  selected?: boolean;
}


export interface Cart {
  items: CartItem[];
  discountCode?: string;
  discountAmount?: number;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  role?: 'admin' | 'customer';
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Order / Checkout types
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  country: string;
  postalCode: string;
  phone?: string;
}

export interface PaymentInfo {
  method: 'credit-card' | 'paypal' | 'momo' | 'payos';
  cardNumber?: string;
  cardName?: string;
  expiry?: string;
  cvv?: string;
}

export interface CheckoutForm {
  email: string;
  newsletterOptin: boolean;
  shipping: ShippingAddress;
  shippingMethod: 'free' | 'standard' | 'express';
  payment: PaymentInfo;
}

export interface Order {
  id: string;
  date: string;
  paymentDate?: string;
  items: CartItem[];
  total: number;
  status: string;
  paymentStatus?: string;
  // Shipping Details (Split)
  recipientName: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  apartment?: string;
  city: string;
  country: string;
  postalCode: string;
  // Other details
  paymentMethod: string;
  shippingMethod: string;
  estimatedDelivery?: string;
}

// Filter types
export interface ProductFilters {
  categories: string[];
  materials: string[];
  priceRange: [number, number];
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular';
