import React from 'react';
import { Sparkles, Clock, ShieldCheck, Tag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Banner() {
  const { applyCoupon } = useStore();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-900 text-white shadow-xl mb-8">
      {/* Background ambient lighting */}
      <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-1/3 -top-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-md mb-4 border border-emerald-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Support Local Heritage Farmers & Bakers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-3">
            Fresh Local Goodness Delivered to Your Doorstep
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-6">
            Browse organic dairy, artisanal bakery, fresh orchard fruits, and local specialty pantry items. Direct from neighborhood producers with guaranteed same-day local delivery.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-600/30">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Same-Day Local Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-600/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Quality Guarantee</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-600/30 col-span-2 sm:col-span-1">
              <Tag className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Code: <strong className="text-amber-300">LOCAL10</strong></span>
            </div>
          </div>
        </div>

        {/* Promo Voucher Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center shrink-0 w-full sm:w-auto min-w-[240px]">
          <span className="text-xs uppercase tracking-widest text-emerald-200 font-bold block mb-1">
            Special Offer
          </span>
          <div className="text-3xl font-black text-amber-300 mb-1">10% OFF</div>
          <p className="text-xs text-emerald-100 mb-3">On your first local order</p>
          <button
            onClick={() => applyCoupon('LOCAL10')}
            className="w-full bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
          >
            Apply Promo Code
          </button>
        </div>
      </div>
    </div>
  );
}
