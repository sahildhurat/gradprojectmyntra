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
  
  const [doubtResolved, setDoubtResolved] = useState<string | null>(null);

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

  const cpw = Math.round(product.price / check.expectedWears);

  const handleBuy = () => {
    trackEvent('decision_buy', product.id, { checkId, doubtResolved });
    markProductResolved(product.id);
    router.push('/confirm');
  };
  
  const handleShareClick = () => {
    setShowQuestionModal(true);
  };

  const handleConfirmShare = async () => {
    setShowQuestionModal(false);
    setIsSharing(true);
    trackEvent('decision_share_initiated', product.id, { checkId, shopperQuestion, doubtResolved });
    
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
    trackEvent('decision_dismiss', product.id, { checkId, doubtResolved });
    markProductRemoved(product.id);
    router.push('/');
  };

  return (
    <>
      <main className="w-full max-w-[430px] mx-auto flex flex-col min-h-screen bg-[#0D0D0F] border-x border-[#26262B]/60 shadow-2xl relative pb-8">
        <div>
          {/* Top Navigation / Header */}
          <header className="flex items-center justify-between py-3 mb-4 border-b border-[#1F1F24] px-4">
            <button onClick={() => router.back()} type="button" className="text-[#9A9A9F] hover:text-[#F2F2F2] p-1.5 -ml-1.5 transition-colors" aria-label="Go back">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div className="text-center">
              <span className="text-[11px] font-medium tracking-wider text-[#9A9A9F] uppercase block">Decision Support · Final Step</span>
              <h1 className="text-sm font-semibold text-[#F2F2F2]">Your Decision</h1>
            </div>
            <div className="w-6"></div> {/* spacer for balance */}
          </header>

          <div className="px-4">
            {/* Compact Product Summary Bar */}
            <section className="bg-[#1A1A1D] border border-[#26262B] rounded-xl p-3 flex items-center gap-3.5 mb-8" aria-label="Product summary">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-[#242429] border border-[#2E2E36] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                <img alt={product.name} className="w-full h-full object-cover object-center brightness-90 contrast-105" loading="lazy" src={product.imageUrl} />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] tracking-wider uppercase font-semibold text-[#9A9A9F] truncate">{product.brand}</div>
                <div className="text-sm font-medium text-[#F2F2F2] truncate mt-0.5">
                  {product.name}
                </div>
                <div className="text-xs font-semibold text-[#d4d4d8] mt-1">
                  ₹{product.price.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-[#9A9A9F]">· ₹{cpw.toLocaleString('en-IN')}/wear ({check.expectedWears} wears)</span>
                </div>
              </div>
            </section>

            {/* Question Block: Has your main doubt been resolved? */}
            <section className="space-y-4" aria-labelledby="doubt-resolved-heading">
              <h2 id="doubt-resolved-heading" className="text-base sm:text-lg font-semibold text-[#F2F2F2] tracking-tight">
                Has your main doubt been resolved?
              </h2>

              {/* Three neutral pill options side by side */}
              <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="Doubt resolution options">
                {['Yes', 'Partly', 'No'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setDoubtResolved(opt)}
                    type="button" 
                    className={`py-4 px-3 rounded-xl border text-base font-medium text-center transition-colors focus:outline-none focus:ring-1 focus:ring-[#FF3E6C] ${doubtResolved === opt ? 'bg-[#3E3E48] text-white border-[#4E4E58]' : 'border-[#2E2E36] bg-[#161619] text-[#F2F2F2] hover:bg-[#202024] hover:border-[#3D3D46]'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <p className="text-xs text-[#71717a] pt-1 leading-relaxed">
                Initial hesitation noted: <span className="text-[#a1a1aa]">"{check.hesitation}"</span>
              </p>
            </section>
          </div>
        </div>

        {/* Action Buttons: 4 stacked full-width buttons in descending visual weight */}
        <section className="w-full space-y-4 pb-6 mt-10 px-4" aria-label="Decision actions">
          
          {/* Button 1: "Buy this" — filled coral */}
          <button onClick={handleBuy} type="button" className="w-full py-4 px-4 bg-[#FF3E6C] hover:bg-[#E0345D] active:bg-[#C92C51] text-white font-semibold text-base rounded-xl text-center shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FF3E6C] focus:ring-offset-2 focus:ring-offset-[#0D0D0F] flex items-center justify-center gap-2">
            <span className="">Buy this</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>

          {/* Button 2: "Ask my Inner Circle" — outlined, off-white border */}
          <button disabled={isSharing} onClick={handleShareClick} type="button" className={`w-full py-4 px-4 bg-transparent hover:bg-[#1F1F24] active:bg-[#27272E] border border-[#F2F2F2] text-[#F2F2F2] font-semibold text-base rounded-xl text-center transition-colors focus:outline-none focus:ring-1 focus:ring-[#F2F2F2] flex items-center justify-center gap-2 ${isSharing ? 'opacity-80' : ''}`}>
            {isSharing ? (
              <svg className="w-4 h-4 text-[#F2F2F2] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#d4d4d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            )}
            <span className="">{isSharing ? 'Generating Link...' : 'Ask my Inner Circle'}</span>
          </button>

          {/* Button 3: "Keep for later" — plain text button, off-white */}
          <button onClick={() => router.push('/')} type="button" className="w-full py-4 px-4 bg-transparent hover:bg-[#161619] active:bg-[#1E1E22] text-[#F2F2F2] font-medium text-base rounded-xl text-center transition-colors focus:outline-none">
            Keep for later
          </button>

          {/* Button 4: "Not right for me — remove" — plain text button, mid grey */}
          <button onClick={handleDismiss} type="button" className="w-full py-3.5 px-4 bg-transparent hover:text-[#d4d4d8] text-[#9A9A9F] font-normal text-base rounded-xl text-center transition-colors focus:outline-none">
            Not right for me — remove
          </button>

        </section>
      </main>

      {/* Question Modal Overlay */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-sm" onClick={() => setShowQuestionModal(false)}>
          <div 
            className="w-full max-w-[430px] bg-[#1A1A1D] border border-[#26262B] rounded-t-[16px] sm:rounded-[16px] p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[18px] text-[#F2F2F2]">Ask Inner Circle</h3>
              <button onClick={() => setShowQuestionModal(false)} className="w-8 h-8 rounded-full bg-[#26262B] flex items-center justify-center text-[#9A9A9F] hover:text-[#F2F2F2]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <p className="text-[14px] text-[#9A9A9F] mb-4">
              Add a quick note so your friends know what you're worried about.
            </p>
            
            <textarea
              className="w-full h-24 p-4 rounded-xl bg-[#141416] border border-[#26262B] text-[#F2F2F2] focus:border-[#FF3E6C] focus:ring-1 focus:ring-[#FF3E6C] outline-none text-[14px] resize-none mb-4"
              value={shopperQuestion}
              onChange={(e) => setShopperQuestion(e.target.value)}
              placeholder="e.g. Will this look good with my navy trousers?"
            />
            
            <button 
              onClick={handleConfirmShare}
              className="w-full h-12 rounded-xl bg-[#FF3E6C] hover:bg-[#E02E5A] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#FF3E6C]/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              Generate Share Link
            </button>
          </div>
        </div>
      )}
    </>
  );
}
