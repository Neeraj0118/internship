import React, { useState, useEffect } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck, MapPin, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import * as api from '../services/api';

const STATUS_STEPS = ['Processing', 'Packed', 'Out for Delivery', 'Delivered'];

export default function OrderTracker() {
  const { trackingSearchId, setTrackingSearchId, showToast } = useStore();
  const [inputCode, setInputCode] = useState(trackingSearchId || 'ORD-98421');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = inputCode.trim();
    if (!query) {
      showToast('Please enter an order tracking number', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await api.fetchOrderStatus(query);
      setOrder(data.order);
      setTrackingSearchId(query);
    } catch (err) {
      showToast(err.message || 'Order not found', 'error');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingSearchId) {
      setInputCode(trackingSearchId);
      handleSearch();
    } else {
      handleSearch();
    }
  }, [trackingSearchId]);

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const idx = STATUS_STEPS.indexOf(order.status);
    return idx >= 0 ? idx : 0;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 mb-3">
          <Truck className="w-6 h-6" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Live Order Status Tracker</h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
          Track your local neighborhood store deliveries in real-time using your <strong>ORD-XXXXX</strong> tracking code.
        </p>

        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Tracking ID (e.g. ORD-98421)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-2xl hover:bg-emerald-700 transition-colors shadow-md cursor-pointer shrink-0"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* TRACKING RESULTS VIEW */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8 animate-fade-in">
          
          {/* Order Header Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">Tracking ID</span>
              <h2 className="text-xl font-extrabold font-mono text-emerald-700">{order.tracking_id}</h2>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">Estimated Delivery</span>
              <span className="text-sm font-extrabold text-slate-900 bg-amber-50 text-amber-900 px-3 py-1 rounded-lg border border-amber-200 inline-block">
                ⏱ {order.estimated_delivery}
              </span>
            </div>
          </div>

          {/* Visual Step Tracker Timeline */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-6">Delivery Progress</h3>
            
            <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
              
              {/* Desktop Progress Bar Line */}
              <div className="hidden md:block absolute top-5 left-10 right-10 h-1 bg-slate-200 -z-0">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-500"
                  style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {STATUS_STEPS.map((stepName, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={stepName} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 flex-1 text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    <div className="text-left md:text-center">
                      <h4 className={`text-sm font-extrabold ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                        {stepName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {idx === 0 && 'Order received & confirmed'}
                        {idx === 1 && 'Items packed from local store'}
                        {idx === 2 && 'Courier on the way to address'}
                        {idx === 3 && 'Delivered successfully'}
                      </p>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Shipping & Items Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 text-xs">
            
            {/* Delivery Info */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Delivery Recipient</span>
              </h4>
              <p><strong>Name:</strong> {order.customer_name}</p>
              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>Address:</strong> {order.address}, {order.city} ({order.postal_code})</p>
              <p><strong>Payment Method:</strong> {order.payment_method}</p>
            </div>

            {/* Purchased Items */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Items in Shipment ({order.items.length})</span>
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800">{item.name} × {item.qty}</span>
                    <span className="font-bold text-slate-900">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-700">${order.total.toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
