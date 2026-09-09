import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Package, DollarSign, ShoppingBag, RefreshCw, Edit, Truck, CheckCircle2, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import * as api from '../services/api';

export default function AdminDashboard() {
  const { products, loadProducts, showToast } = useStore();
  const [activeSubTab, setActiveSubTab] = useState('inventory'); // 'inventory' | 'orders' | 'tickets'
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add Product Form state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Dairy & Eggs',
    price: '',
    original_price: '',
    stock: 20,
    unit: 'item',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    badge: 'New Arrival'
  });

  // Edit stock/price state
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const ordersRes = await api.fetchAllOrders();
      const ticketsRes = await api.fetchSupportTickets();
      setOrders(ordersRes.orders || []);
      setTickets(ticketsRes.tickets || []);
      await loadProducts();
    } catch (err) {
      console.error(err);
      showToast('Error loading admin metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      showToast('Name, price, and description are required', 'error');
      return;
    }

    try {
      await api.createProduct(newProduct);
      showToast('🎉 Product created successfully!');
      setIsAddingProduct(false);
      setNewProduct({
        name: '',
        category: 'Dairy & Eggs',
        price: '',
        original_price: '',
        stock: 20,
        unit: 'item',
        description: '',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
        badge: 'New Arrival'
      });
      loadProducts();
    } catch (err) {
      showToast(err.message || 'Failed to create product', 'error');
    }
  };

  const handleUpdateProduct = async (id) => {
    try {
      await api.updateProduct(id, {
        price: editPrice ? parseFloat(editPrice) : undefined,
        stock: editStock ? parseInt(editStock) : undefined
      });
      showToast('Product updated!');
      setEditingId(null);
      loadProducts();
    } catch (err) {
      showToast('Failed to update product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`);
      loadAdminData();
    } catch (err) {
      showToast('Failed to update order status', 'error');
    }
  };

  // Metrics Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Store Manager Portal</h1>
            <p className="text-slate-400 text-xs">Manage inventory stock, update order tracking, and view store analytics.</p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">${totalRevenue.toFixed(2)}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">From {orders.length} orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Orders</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {orders.filter(o => o.status !== 'Delivered').length}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">Pending fulfillment</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Items</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{products.length}</div>
          <span className="text-[10px] text-slate-400 font-semibold">In catalog</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Support Tickets</span>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{tickets.length}</div>
          <span className="text-[10px] text-purple-600 font-semibold">Customer queries</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-bold gap-6">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'inventory' 
              ? 'border-purple-600 text-purple-700' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Product Inventory ({products.length})
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'orders' 
              ? 'border-purple-600 text-purple-700' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveSubTab('tickets')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'tickets' 
              ? 'border-purple-600 text-purple-700' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Support Tickets ({tickets.length})
        </button>
      </div>

      {/* SUB TAB 1: INVENTORY MANAGEMENT */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-lg">Product Catalog Management</h3>
            <button
              onClick={() => setIsAddingProduct(!isAddingProduct)}
              className="bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingProduct ? 'Cancel' : 'Add New Product'}</span>
            </button>
          </div>

          {/* Add Product Form Drawer */}
          {isAddingProduct && (
            <form onSubmit={handleCreateProduct} className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100 space-y-4 text-xs">
              <h4 className="font-bold text-purple-950 text-sm">Add New Product to Store Catalog</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Honeycrisp Cider"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Fruits & Veggies">Fruits & Veggies</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="4.99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Unit Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. 16 oz Jar / 1 Loaf"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detailed product specs..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <button
                type="submit"
                className="bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-purple-800 transition-colors cursor-pointer"
              >
                Save Product
              </button>
            </form>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100" />
                        <div>
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.unit}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-600">{p.category}</td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {editingId === p.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-16 bg-slate-100 border p-1 rounded font-bold"
                          />
                        ) : (
                          `$${p.price.toFixed(2)}`
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {editingId === p.id ? (
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-16 bg-slate-100 border p-1 rounded font-bold"
                          />
                        ) : (
                          <span className={`font-bold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {p.stock} in stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-700">★ {p.rating} ({p.reviews_count})</td>

                      <td className="py-3 px-4 text-right">
                        {editingId === p.id ? (
                          <button
                            onClick={() => handleUpdateProduct(p.id)}
                            className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-[11px] hover:bg-emerald-700 cursor-pointer"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(p.id);
                              setEditPrice(p.price);
                              setEditStock(p.stock);
                            }}
                            className="text-purple-600 hover:text-purple-800 font-bold text-xs p-1 cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: ORDERS FULFILLMENT */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg">Customer Order Tracking & Status Updater</h3>
          
          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-extrabold text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {ord.tracking_id}
                    </span>
                    <span className="text-slate-400">• {new Date(ord.created_at).toLocaleString()}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{ord.customer_name} ({ord.phone})</p>
                  <p className="text-slate-500">{ord.address}, {ord.city}</p>
                  <div className="mt-2 text-slate-700 font-medium">
                    <strong>Items:</strong> {ord.items.map(i => `${i.name} (${i.qty})`).join(', ')}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">${ord.total.toFixed(2)}</span>
                    <span className="block text-[11px] text-slate-500">{ord.payment_method}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">Status:</span>
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      className="bg-white border border-slate-300 font-bold rounded-xl p-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 3: SUPPORT TICKETS */}
      {activeSubTab === 'tickets' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
          <h3 className="font-extrabold text-slate-900 text-lg">Customer Support Requests</h3>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{t.name} ({t.email})</span>
                  <span className="font-mono text-purple-700">{t.ticket_id}</span>
                </div>
                <p className="font-semibold text-slate-800">{t.subject}</p>
                <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">{t.message}</p>
                {t.reply && (
                  <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 font-medium">
                    🤖 Auto Reply: {t.reply}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
