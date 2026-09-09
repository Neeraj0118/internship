import React from 'react';
import { SlidersHorizontal, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function FilterBar() {
  const { categories, filters, setFilters, products } = useStore();

  const handleCategoryChange = (cat) => {
    setFilters(prev => ({ ...prev, category: cat }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sort: e.target.value }));
  };

  const handleInStockToggle = () => {
    setFilters(prev => ({ ...prev, inStock: !prev.inStock }));
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-6 space-y-4">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
        </span>
        {categories.map((cat) => {
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Secondary Filters: Stock Toggle & Sort Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs font-medium text-slate-600">
        
        {/* Count Indicator */}
        <div className="text-slate-500">
          Showing <span className="font-bold text-slate-900">{products.length}</span> local store products
          {filters.category !== 'All' && <span> in <strong className="text-emerald-700">{filters.category}</strong></span>}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* In Stock Only Checkbox */}
          <button
            onClick={handleInStockToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filters.inStock 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${filters.inStock ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>In Stock Only</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Sort by:</span>
            <select
              value={filters.sort}
              onChange={handleSortChange}
              className="bg-slate-100 border-0 rounded-lg py-1.5 pl-2.5 pr-7 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured / Best Match</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
