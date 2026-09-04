"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { products } from '../../../data/products';
import { Check } from '../../../data/types';
import { trackEvent } from '../../../lib/events';
import { markProductResolved, markProductRemoved } from '../../../lib/progress';

export default function DecisionScreen() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const productId = params?.id as string;
  const checkId = searchParams?.get('checkId');
  
  const product = products.find(p => p.id === productId);
  const [check, setCheck] = useState<Check | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [shopperQuestion, setShopperQuestion] = useState("I'm not sure about this, what do you guys think?");

  useEffect(() => {
    if (!checkId) {
      router.push('/');
      return;
    }
    
    fetch(`/api/assess?checkId=${checkId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setCheck(data);
      })
      .catch(err => console.error(err));
  }, [checkId, router]);

  if (!product || !check || !check.assessment) return null;

  const handleBuy = () => {
    trackEvent('decision_buy', product.id, { checkId });
    markProductResolved(product.id);
    alert('Item added to cart!');
    router.push('/');
  };
    setShowQuestionModal(true);
  };

  const handleConfirmShare = async () => {
    setShowQuestionModal(false);
    setIsSharing(true);
    trackEvent('decision_share_initiated', product.id, { checkId, shopperQuestion });
    
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkId,
          shopperQuestion
        })
      });
      const data = await res.json();
      if (data.token) {
        // In a real app, this would use navigator.share()
        // For MVP, we route directly to the vote screen
        router.push(`/share/${data.token}`);
      } else {
        setIsSharing(false);
        alert("Failed to generate share link.");
      }
    } catch (e) {
      console.error(e);
      setIsSharing(false);
    }
  };

  const handleDismiss = () => {
    trackEvent('decision_dismiss', product.id, { checkId });
    markProductRemoved(product.id);
    router.push('/');
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-headline-md text-primary-container tracking-tighter uppercase font-bold">M</span>
              <div className="h-4 w-[1px] bg-outline-variant/40"></div>
              <span className="font-title-md text-title-md text-on-surface tracking-tight">Decision</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-24 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-4 pb-12 space-y-6">
          
          <div className="pt-4 text-center">
            <h2 className="font-headline-md text-[28px] text-on-surface tracking-tight font-bold">Did that resolve your doubt?</h2>
          </div>

          <div className="bg-surface-container-low p-3 rounded-2xl flex items-center gap-4 border border-white/5 shadow-sm">
            <img className="w-16 h-20 rounded-xl object-cover" src={product.imageUrl} alt={product.name}/>
            <div className="flex-1 min-w-0">
              <p className="font-label-sm text-[11px] text-secondary uppercase tracking-wider font-bold mb-1">{product.brand}</p>
              <h3 className="font-title-md text-[16px] text-on-surface truncate font-semibold">{product.name}</h3>
              <p className="font-body-md text-[15px] text-on-surface mt-1">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-4 pt-2">
            {/* Buy This */}
            <button onClick={handleBuy} className="group relative w-full text-left rounded-lg bg-primary-container p-4 transition-all duration-200 active:scale-[0.98] shadow-[0_0_28px_-4px_rgba(255,79,116,0.4)] flex items-center justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              <div className="flex items-center gap-4 z-10">
                <div className="w-12 h-12 rounded-full bg-on-primary-container/20 flex items-center justify-center flex-shrink-0 text-white shadow-inner">
                  <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-white font-bold flex items-center gap-2">
                    Buy this now
                    <span className="material-symbols-outlined text-white text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </span>
                  <span className="font-body-sm text-body-sm text-white/90">Add to cart</span>
                </div>
              </div>
              <div className="z-10 bg-white/20 px-3 py-1 rounded-full text-white font-label-sm text-label-sm tracking-wide uppercase font-bold">
                Ready
              </div>
            </button>

            {/* Ask Inner Circle */}
            <button onClick={handleShareClick} disabled={isSharing} className={`group relative w-full text-left rounded-lg bg-surface-container-high p-4 transition-all duration-200 shadow-md flex items-center justify-between overflow-hidden backdrop-blur-xl ${isSharing ? 'opacity-80' : 'active:scale-[0.98]'}`}>
              <div className="flex items-center gap-4 z-10">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-secondary shadow-sm">
                  {isSharing ? (
                    <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[24px]">diversity_1</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface font-semibold flex items-center gap-2">
                    {isSharing ? 'Generating Link...' : 'Ask my Inner Circle'}
                    {!isSharing && <span className="material-symbols-outlined text-on-surface-variant text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Get instant feedback from friends</span>
                </div>
              </div>
            </button>

            {/* Not Right */}
            <button onClick={handleDismiss} className="group relative w-full text-left rounded-lg bg-surface-container-low p-4 transition-all duration-200 active:scale-[0.98] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[24px]">bookmark_add</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md text-on-surface font-medium">Not right for me</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Save insights & return to wishlist</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant text-[20px] transition-transform group-hover:rotate-45">close</span>
            </button>
          </div>

          <div className="rounded-xl bg-surface-container-lowest/80 p-4 flex items-center gap-3 shadow-inner mt-3">
            <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-[18px]">psychology</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              <span className="text-on-surface font-semibold">12,400 shoppers</span> found clarity before checkout this week using Match Check diagnostics.
            </p>
          </div>

        </div>
      </main>

      {/* Question Modal Overlay */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm" onClick={() => setShowQuestionModal(false)}>
          <div 
            className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title-lg text-[20px] font-bold text-on-surface">Ask Inner Circle</h3>
              <button onClick={() => setShowQuestionModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <p className="font-body-md text-on-surface-variant mb-4">
              Add a quick note so your friends know what you're worried about.
            </p>
            
            <textarea
              className="w-full h-24 p-4 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-on-surface resize-none mb-6"
              value={shopperQuestion}
              onChange={(e) => setShopperQuestion(e.target.value)}
              placeholder="e.g. Will this look good for a summer wedding?"
            />
            
            <button 
              onClick={handleConfirmShare}
              className="w-full h-12 rounded-full bg-primary text-on-primary font-title-md font-bold text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              Generate Share Link
            </button>
          </div>
        </div>
      )}
    </>
  );
}
