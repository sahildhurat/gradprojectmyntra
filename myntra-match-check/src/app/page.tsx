"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { products } from '../data/products';
import { Product } from '../data/types';
import { trackEvent } from '../lib/events';
import { getProgress, ProgressState } from '../lib/progress';

export default function WishlistScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [progress, setProgress] = useState<ProgressState>({ checkedProducts: [], resolvedProducts: [], removedProducts: [] });

  useEffect(() => {
    // Initial load
    setProgress(getProgress());

    // Listen for updates
    const handleProgressUpdate = () => {
      setProgress(getProgress());
    };
    
    window.addEventListener('progress_updated', handleProgressUpdate);
    return () => window.removeEventListener('progress_updated', handleProgressUpdate);
  }, []);

  // Filter out removed products first
  const visibleProducts = products.filter(p => !progress.removedProducts.includes(p.id));

  const categories = ["All", ...Array.from(new Set(visibleProducts.map(p => p.category)))];
  
  const filteredProducts = activeCategory === "All" 
    ? visibleProducts 
    : visibleProducts.filter(p => p.category === activeCategory);

  const handleCheckClick = (productId: string) => {
    trackEvent('match_check_started', productId);
    router.push(`/check/${productId}`);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="bg-surface-container-lowest/90 px-4 py-1 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 bg-secondary-container/20 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-secondary text-[14px]">info</span>
            <span className="font-label-sm text-label-sm text-secondary tracking-wide uppercase">Illustrative product and review data — built for prototype testing.</span>
          </div>
        </div>
        <div className="h-16 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-headline-md text-primary-container tracking-tighter uppercase font-bold">M</span>
              <div className="h-4 w-[1px] bg-outline-variant/40"></div>
              <span className="font-title-md text-title-md text-on-surface tracking-tight">Discovery Hub</span>
            </div>
            <div className="inline-flex items-center gap-1 bg-primary-container/15 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-primary text-[14px]">auto_awesome</span>
              <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase">Match Check</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col relative w-full pt-24 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-4 pb-12 gap-6">
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">Saved Items</h2>
                <span className="font-label-md text-label-md text-primary font-bold">({visibleProducts.length})</span>
              </div>
              
              {/* Progress Bar */}
              {(progress.checkedProducts.length > 0 || progress.resolvedProducts.length > 0) && (
                <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-surface-container-high shadow-sm">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Match Check Progress</span>
                      <span className="font-label-sm text-label-sm text-primary font-bold">
                        {progress.resolvedProducts.length}/{visibleProducts.length + progress.resolvedProducts.length} Resolved
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-secondary transition-all duration-500 ease-out" 
                        style={{ width: `${(progress.resolvedProducts.length / Math.max(1, visibleProducts.length + progress.resolvedProducts.length)) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-primary/40 transition-all duration-500 ease-out" 
                        style={{ width: `${((progress.checkedProducts.length - progress.resolvedProducts.length) / Math.max(1, visibleProducts.length + progress.resolvedProducts.length)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" id="filterPills">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`filter-btn shrink-0 min-h-[44px] px-5 rounded-full font-label-md text-label-md flex items-center justify-center transition-all ${activeCategory === cat ? 'bg-primary-container/20 text-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
                >
                  {cat === "All" ? "All Items" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mt-4">
            {filteredProducts.map((product) => (
              <article key={product.id} className="flex flex-col bg-surface-container rounded-lg overflow-hidden shadow-xl relative" data-category={product.category}>
                <div className="relative w-full aspect-[4/3] bg-surface-container-lowest overflow-hidden">
                  {/* Using standard img to avoid Next.js Image config issues for external URLs or placeholders */}
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-90"></div>
                  
                  <button aria-label="Favorite item" className="absolute top-space-sm right-space-sm w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface-container-lowest/70 backdrop-blur-md flex items-center justify-center text-primary transition-transform active:scale-95 shadow-md">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>
                </div>
                
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase block truncate">{product.brand}</span>
                      <h3 className="font-title-md text-title-md text-on-surface truncate">{product.name}</h3>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-headline-sm text-headline-sm text-primary font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.originalPrice && (
                        <span className="font-label-sm text-label-sm text-outline line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 bg-tertiary-container/20 px-2 py-1 rounded-xl">
                      <span className="font-label-sm text-label-sm text-tertiary font-bold">{product.rating}</span>
                      <span className="material-symbols-outlined text-tertiary text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                    <span className="font-body-sm text-body-sm text-outline-variant">·</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{product.ratingCount} reviews</span>
                  </div>
                  
                  <button 
                    onClick={() => handleCheckClick(product.id)}
                    className="match-check-btn w-full min-h-[48px] mt-2 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,79,116,0.35)] hover:shadow-[0_0_28px_rgba(255,79,116,0.55)] transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Check if it&apos;s right for me</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      
      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-around h-16 px-4">
          <a className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 text-on-surface-variant transition-colors" href="#">
            <span className="material-symbols-outlined text-[24px]">explore</span>
            <span className="font-label-sm text-label-sm mt-1">Discover</span>
          </a>
          <a aria-current="page" className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 transition-colors text-primary font-bold" href="#">
            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            <span className="font-label-sm text-label-sm mt-1">Check</span>
          </a>
          <a className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 text-on-surface-variant transition-colors" href="#">
            <span className="material-symbols-outlined text-[24px]">checkroom</span>
            <span className="font-label-sm text-label-sm mt-1">Closet</span>
          </a>
          <a className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 text-on-surface-variant transition-colors" href="#">
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
            <span className="font-label-sm text-label-sm mt-1">Bag</span>
          </a>
        </div>
      </nav>
    </>
  );
}
