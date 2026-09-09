import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'tracking' | 'support' | 'admin'
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [trackingSearchId, setTrackingSearchId] = useState('');

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('metromart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Products & Filters State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    search: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sort: 'featured'
  });

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('metromart_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Fetch products when filters change
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await api.fetchProducts(filters);
      setProducts(data.products || []);
      if (data.categories) setCategories(data.categories);
    } catch (error) {
      console.error('Failed to load products:', error);
      showToast('Could not connect to store backend', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters]);

  // Cart Operations
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].qty + quantity;
        if (newQty > product.stock) {
          showToast(`Only ${product.stock} items available in stock`, 'error');
          return prevCart;
        }
        updated[existingIndex].qty = newQty;
        showToast(`Updated ${product.name} quantity in cart!`);
        return updated;
      } else {
        if (quantity > product.stock) {
          showToast(`Only ${product.stock} items available in stock`, 'error');
          return prevCart;
        }
        showToast(`Added ${product.name} to cart!`);
        return [...prevCart, { ...product, qty: quantity }];
      }
    });
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => {
      const target = prevCart.find(i => i.id === productId);
      if (target && newQty > target.stock) {
        showToast(`Only ${target.stock} items in stock`, 'error');
        return prevCart;
      }
      return prevCart.map(item => item.id === productId ? { ...item, qty: newQty } : item);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.id === productId);
      if (item) showToast(`Removed ${item.name} from cart`, 'info');
      return prevCart.filter(i => i.id !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon('');
    setCouponDiscount(0);
  };

  // Coupon Logic
  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'LOCAL10') {
      setAppliedCoupon('LOCAL10');
      showToast('🎉 Coupon LOCAL10 applied! 10% discount added.');
    } else if (cleanCode === 'FREESHIP') {
      setAppliedCoupon('FREESHIP');
      showToast('🎉 Coupon FREESHIP applied! Free local delivery activated.');
    } else {
      showToast('Invalid coupon code. Try LOCAL10 or FREESHIP', 'error');
    }
  };

  // Calculated Totals
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = appliedCoupon === 'LOCAL10' ? (cartSubtotal * 0.10) : 0;
  const deliveryFee = (cartSubtotal >= 35 || appliedCoupon === 'FREESHIP' || cart.length === 0) ? 0 : 4.99;
  const taxAmount = (cartSubtotal - discountAmount) * 0.05;
  const cartTotal = cartSubtotal - discountAmount + taxAmount + deliveryFee;
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const value = {
    activeTab,
    setActiveTab,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    selectedProduct,
    setSelectedProduct,
    trackingSearchId,
    setTrackingSearchId,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    appliedCoupon,
    applyCoupon,
    cartSubtotal,
    discountAmount,
    deliveryFee,
    taxAmount,
    cartTotal,
    cartCount,
    products,
    categories,
    loadingProducts,
    filters,
    setFilters,
    loadProducts,
    toasts,
    showToast
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
