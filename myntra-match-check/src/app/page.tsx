"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { products } from '../data/products';
import { trackEvent } from '../lib/events';
import { getProgress, ProgressState } from '../lib/progress';

export default function WishlistScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressState>({ checkedProducts: [], resolvedProducts: [], removedProducts: [] });

  useEffect(() => {
    setProgress(getProgress());
    const handleProgressUpdate = () => {
      setProgress(getProgress());
    };
    window.addEventListener('progress_updated', handleProgressUpdate);
    return () => window.removeEventListener('progress_updated', handleProgressUpdate);
  }, []);

  const handleCheckClick = (productId: string) => {
    trackEvent('match_check_started', productId);
    router.push(`/check/${productId}`);
  };

  const totalItems = products.length;
  const checkedCount = progress.checkedProducts.length;
  const resolvedCount = progress.resolvedProducts.length;
  const progressPercent = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  return (
    <>
      {/* Top Disclosure Strip */}
      <header className="w-full bg-[#0D0D0F] border-b border-[#1A1A1E] px-4 py-1.5 text-center">
        <p className="text-[10px] leading-tight text-[#71717A] tracking-wide font-normal">
          Illustrative product and review data — built for prototype testing.
        </p>
      </header>

      {/* Header Row & Progress Tracking */}
      <div className="px-5 pt-6 pb-4 border-b border-[#1A1A1E]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#F2F2F2] leading-none">Saved items</h1>
            <p className="text-[12px] text-[#9A9A9F] mt-1.5">Personal evaluation queue</p>
          </div>
          <div className="flex flex-col items-end min-w-[130px] pt-0.5">
            <span className="text-[12px] text-[#9A9A9F] font-medium tracking-tight whitespace-nowrap">
              {checkedCount} of {totalItems} checked <span className="text-[#5A5A60]">·</span> {resolvedCount} resolved
            </span>
            {/* Slim Horizontal Progress Bar */}
            <div className="w-full h-1 bg-[#26262B] rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-[#F2F2F2] rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Cards List */}
      <main className="flex-1 px-4 py-4 space-y-3.5">
        {products.map((product) => {
          const isChecked = progress.checkedProducts.includes(product.id);
          const isResolved = progress.resolvedProducts.includes(product.id);
          const isRemoved = progress.removedProducts.includes(product.id);

          // Skip completely removed items from wishlist view if desired.
          // The HTML spec says "You closed 6 decisions" showing removed ones there. 
          // But on Wishlist, maybe we still show them or filter them?
          // Let's filter them if they are completely removed (like in previous implementation)
          if (isRemoved) return null;

          return (
            <article key={product.id} className="bg-[#1A1A1D] border border-[#26262B] rounded-[14px] p-3.5 flex flex-col gap-3 transition-colors">
              <div className="flex gap-3.5 items-start">
                {/* Square rounded image thumbnail */}
                <div className="w-[84px] h-[84px] rounded-[10px] bg-[#222228] border border-[#2C2C32] flex-shrink-0 overflow-hidden relative">
                  <img 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                    src={product.imageUrl} 
                  />
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-[84px]">
                  <div>
                    <span className="text-[11px] font-semibold text-[#9A9A9F] uppercase tracking-wider block">{product.brand}</span>
                    <h2 className="text-[15px] font-medium text-[#F2F2F2] leading-snug truncate mt-0.5">{product.name}</h2>
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-[#F2F2F2]">₹{product.price.toLocaleString('en-IN')}</div>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#9A9A9F] mt-0.5">
                      <span className="text-[#D4D4D8] text-[13px] leading-none">★</span>
                      <span className="font-medium text-[#D4D4D8]">{product.rating}</span>
                      <span className="text-[#71717A]">({product.ratingCount})</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status indicator or Action Button */}
              <div className="pt-0.5">
                {isChecked || isResolved ? (
                  <div className="w-full py-2.5 px-3 rounded-[10px] bg-[#222227] border border-[#2C2C33] flex items-center justify-center gap-1.5 text-[#9A9A9F] text-[13px] font-medium select-none">
                    <svg className="w-3.5 h-3.5 text-[#8E8E93]" fill="currentColor" viewBox="0 0 16 16">
                      <path clipRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" fillRule="evenodd"></path>
                    </svg>
                    {isResolved ? 'Resolved' : 'Checked'}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleCheckClick(product.id)}
                    className="w-full min-h-[46px] py-2.5 px-4 rounded-[10px] bg-[#FF3E6C] active:bg-[#e0335e] text-white font-semibold text-[14px] tracking-wide flex items-center justify-center transition-colors" 
                    type="button"
                  >
                    Check if it's right for me
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </main>
    </>
  );
}
