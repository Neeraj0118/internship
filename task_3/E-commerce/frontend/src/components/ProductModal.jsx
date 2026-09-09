import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Truck, ShieldCheck, MessageSquare, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import * as api from '../services/api';

export default function ProductModal() {
  const { selectedProduct, setSelectedProduct, addToCart, showToast } = useStore();
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [reviewerName, setReviewerName] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setLoading(true);
      setQuantity(1);
      api.fetchProductById(selectedProduct.id)
        .then(data => {
          setProductDetails(data.product);
        })
        .catch(err => {
          console.error(err);
          setProductDetails(selectedProduct);
        })
        .finally(() => setLoading(false));
    } else {
      setProductDetails(null);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      showToast('Please provide your name and review comment', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.submitReview({
        product_id: selectedProduct.id,
        user_name: reviewerName.trim(),
        rating: ratingVal,
        comment: reviewComment.trim()
      });

      showToast('Thank you! Your review has been posted.');
      setReviewerName('');
      setReviewComment('');
      setRatingVal(5);

      // Refresh product details
      const updated = await api.fetchProductById(selectedProduct.id);
      setProductDetails(updated.product);
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const product = productDetails || selectedProduct;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Product Meta */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                  <span>{product.category}</span>
                  <span>•</span>
                  <span className="text-slate-400">{product.unit}</span>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
                  {product.name}
                </h2>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{product.rating}</span>
                  <span className="text-xs text-slate-400">({product.reviews_count} verified reviews)</span>
                </div>

                <div className="text-3xl font-black text-slate-900 mb-4">
                  ${product.price?.toFixed(2)}
                  {product.original_price && (
                    <span className="text-base font-normal text-slate-400 line-through ml-2">
                      ${product.original_price.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Stock Status */}
                <div className="mb-6">
                  {isOutOfStock ? (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 inline-block">
                      ⚠️ Out of Stock
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block">
                      ✅ In Stock ({product.stock} units available)
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-slate-900 font-bold text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                      setSelectedProduct(null);
                    }}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {quantity} to Cart • ${(product.price * quantity).toFixed(2)}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Same-day local delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Local freshness guarantee</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>Customer Ratings & Reviews</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Existing Reviews List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{rev.user_name}</span>
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-1">{rev.comment}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-4">No reviews yet. Be the first to leave a review!</p>
                )}
              </div>

              {/* Submit Review Form */}
              <form onSubmit={handleReviewSubmit} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3 text-xs">
                <h4 className="font-bold text-emerald-900">Write a Customer Review</h4>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Miller"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingVal(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Review</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your experience with this item..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
