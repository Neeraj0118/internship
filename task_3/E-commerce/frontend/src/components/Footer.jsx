import React from 'react';
import { Store, Heart, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { setActiveTab } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Metro<span className="text-emerald-500">Mart</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Your neighborhood e-commerce platform bringing fresh local farm produce, artisanal bakery goods, and pantry essentials directly to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Navigation</h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><button onClick={() => setActiveTab('store')} className="hover:text-emerald-400 cursor-pointer">Local Storefront</button></li>
              <li><button onClick={() => setActiveTab('tracking')} className="hover:text-emerald-400 cursor-pointer">Live Order Tracking</button></li>
              <li><button onClick={() => setActiveTab('support')} className="hover:text-emerald-400 cursor-pointer">Customer Support & FAQs</button></li>
              <li><button onClick={() => setActiveTab('admin')} className="hover:text-emerald-400 cursor-pointer">Store Manager Portal</button></li>
            </ul>
          </div>

          {/* Hours & Delivery */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Store Hours</h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-500" /> Mon - Sat: 8:00 AM - 9:00 PM</p>
              <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-500" /> Sunday: 9:00 AM - 6:00 PM</p>
              <p className="text-emerald-400 font-semibold mt-2">🚚 Same-Day Delivery available for local zip codes!</p>
            </div>
          </div>

          {/* Contact & Internship Tag */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Local Store Contact</h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> 104 Main Street, Local Market Square</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-500" /> +1 (555) 382-7000</p>
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-500" /> hello@metromart.local</p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} MetroMart Local Store Platform. Built for Prodigy InfoTech Task-03.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Web Development Internship
          </p>
        </div>
      </div>
    </footer>
  );
}
