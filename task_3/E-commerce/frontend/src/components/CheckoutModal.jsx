import React, { useState } from 'react';
import { X, CreditCard, Banknote, ShieldCheck, CheckCircle2, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import * as api from '../services/api';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    cartSubtotal,
    discountAmount,
    deliveryFee,
    taxAmount,
    cartTotal,
    appliedCoupon,
    setActiveTab,
    setTrackingSearchId,
    showToast
  } = useStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    phone: '',
    address: '',
    city: 'Local Neighborhood',
    postal_code: '10001',
    payment_method: 'Credit Card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    upiId: ''
  });

  if (!isCheckoutOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_email || !formData.phone || !formData.address) {
      showToast('Please fill out all required shipping fields', 'error');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPayload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        payment_method: formData.payment_method,
        coupon_code: appliedCoupon,
        items: cart.map(i => ({ id: i.id, qty: i.qty }))
      };

      const response = await api.createOrder(orderPayload);
      setPlacedOrder(response.order);
      clearCart();
      showToast('🎉 Order placed successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep(1);
    setPlacedOrder(null);
  };

  const handleGoToTracking = () => {
    if (placedOrder) {
      setTrackingSearchId(placedOrder.tracking_id);
    }
    handleClose();
    setActiveTab('tracking');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ORDER SUCCESS VIEW */}
        {placedOrder ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">Order Confirmed!</h2>
            <p className="text-slate-600 text-sm mb-6">
              Thank you <strong className="text-slate-900">{placedOrder.customer_name}</strong>! Your order has been placed and is being prepared by our local store team.
            </p>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left mb-6 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Tracking Number:</span>
                <span className="font-mono font-bold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {placedOrder.tracking_id}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Delivery:</span>
                <span className="font-bold text-slate-800">{placedOrder.estimated_delivery}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Address:</span>
                <span className="font-medium text-slate-800">{placedOrder.address}</span>
              </div>

              <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Paid:</span>
                <span className="text-emerald-700">${placedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGoToTracking}
                className="flex-1 bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Track Order Live</span>
              </button>

              <button
                onClick={handleClose}
                className="bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-200 transition-colors text-sm cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header Steps */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Checkout</h2>
              <div className="flex items-center gap-2 mt-3 text-xs font-semibold">
                <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  1. Delivery Details
                </span>
                <span className="text-slate-300">•</span>
                <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  2. Payment & Review
                </span>
              </div>
            </div>

            {/* STEP 1: SHIPPING FORM */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    placeholder="Jane Doe"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="customer_email"
                      required
                      placeholder="jane@example.com"
                      value={formData.customer_email}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="742 Evergreen Terrace, Apt 4B"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">City / Neighborhood</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white font-extrabold py-3.5 px-4 rounded-2xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm mt-6 cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: PAYMENT METHOD & REVIEW */}
            {step === 2 && (
              <form onSubmit={handlePlaceOrder} className="space-y-6 text-xs">
                
                {/* Payment Selector */}
                <div>
                  <label className="block text-slate-700 font-bold mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'Credit Card', icon: CreditCard, label: 'Card' },
                      { id: 'UPI / Digital Wallet', icon: ShieldCheck, label: 'UPI / Wallet' },
                      { id: 'Cash on Delivery', icon: Banknote, label: 'Cash on Delivery' }
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = formData.payment_method === method.id;
                      return (
                        <button
                          type="button"
                          key={method.id}
                          onClick={() => setFormData(prev => ({ ...prev, payment_method: method.id }))}
                          className={`p-3 rounded-xl border text-center font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-500'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-5 h-5 text-emerald-600" />
                          <span>{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Payment Inputs */}
                {formData.payment_method === 'Credit Card' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Card Number (Simulated)</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8892"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardExpiry: e.target.value }))}
                        className="bg-white border border-slate-200 rounded-lg p-2 font-mono"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        value={formData.cardCvc}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardCvc: e.target.value }))}
                        className="bg-white border border-slate-200 rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 mb-2">Final Order Summary</h4>
                  <div className="flex justify-between text-slate-600">
                    <span>Items ({cart.length})</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Amount Due</span>
                    <span className="text-emerald-700">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-3.5 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>{loading ? 'Processing Order...' : `Pay & Place Order • $${cartTotal.toFixed(2)}`}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
