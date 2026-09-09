import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import FilterBar from './components/FilterBar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTracker from './components/OrderTracker';
import SupportWidget from './components/SupportWidget';
import AdminDashboard from './components/AdminDashboard';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { ShoppingBag } from 'lucide-react';

function StoreContent() {
  const { activeTab, products, loadingProducts } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'store' && (
          <div>
            <Banner />
            <FilterBar />

            {loadingProducts ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-500">Loading fresh inventory from local store...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto my-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No matching products found</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Try broadening your search query or selecting a different category filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracking' && <OrderTracker />}
        {activeTab === 'support' && <SupportWidget />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      <Footer />

      {/* Global Drawers & Modals */}
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}
