"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { products } from '../../../data/products';
import { trackEvent } from '../../../lib/events';

export default function ContextFlowScreen() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  
  const product = products.find(p => p.id === productId);
  
  const [occasion, setOccasion] = useState("Work");
  const [wears, setWears] = useState(10);
  const [hesitation, setHesitation] = useState("Will it fit?");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!product) {
      router.push("/");
    }
  }, [product, router]);

  if (!product) return null;

  const cpw = Math.round(product.price / wears);

  const handleGenerate = async () => {
    setIsGenerating(true);
    trackEvent('match_check_generated', product.id, { occasion, wears, hesitation });
    
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          occasion,
          expectedWears: wears,
          hesitation,
        })
      });
      
      const data = await res.json();
      if (data.checkId) {
        router.push(`/check/${product.id}/result?checkId=${data.checkId}`);
      } else {
        alert("Failed: " + (data.error || "Unknown error"));
        setIsGenerating(false);
      }
    } catch (e) {
      console.error(e);
      alert("Error generating assessment");
      setIsGenerating(false);
    }
  };

  const occasionsList = [
    "Everyday",
    "College",
    "Work",
    "Date",
    "Wedding or event",
    "Travel"
  ];

  const hesitationsList = [
    { id: "Is it worth the price?" },
    { id: "Will it fit?" },
    { id: "Can I trust this listing?" },
    { id: "Will I actually wear it?" },
    { id: "Is it right for the occasion?" }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        input[type=range] {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
        }
        input[type=range]:focus {
          outline: none;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: #26262B;
          border-radius: 9999px;
        }
        input[type=range]::-webkit-slider-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #F2F2F2;
          border: 3px solid #0D0D0F;
          box-shadow: 0 0 0 2px #3E3E45;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -9px;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        input[type=range]::-webkit-slider-thumb:active {
          transform: scale(1.15);
          box-shadow: 0 0 0 4px rgba(255, 62, 108, 0.4);
        }
      `}} />

      {/* Top App Navigation / Header Bar */}
      <header className="sticky top-0 z-30 bg-[#0D0D0F]/95 backdrop-blur-md px-4 py-5 border-b border-[#1A1A1D] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} aria-label="Go back" className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-[#9A9A9F] hover:text-[#F2F2F2] hover:bg-[#1A1A1D] transition-colors" type="button">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </button>
          <div>
            <span className="text-[11px] font-medium tracking-wider uppercase text-[#9A9A9F]">Decision Support · Step 1</span>
            <h1 className="text-[17px] font-bold text-[#F2F2F2] leading-tight">What do you need this for?</h1>
          </div>
        </div>
        {/* Perspective icon representing evidence & scale */}
        <div className="w-9 h-9 rounded-full bg-[#1A1A1D] border border-[#26262B] flex items-center justify-center text-[#9A9A9F]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </div>
      </header>

      {/* Compact Product Summary Bar */}
      <section className="px-5 py-6 bg-[#141417] border-b border-[#1F1F24] flex items-center justify-between gap-5">
        <div className="flex items-center gap-5 min-w-0">
          {/* Thumbnail */}
          <div className="w-20 h-20 rounded-[10px] bg-[#1A1A1D] border border-[#26262B] overflow-hidden flex-shrink-0 relative">
            <img alt={product.name} className="w-full h-full object-cover object-center brightness-90 contrast-105" loading="lazy" src={product.imageUrl} />
          </div>
          {/* Product Specs Summary */}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9A9A9F] truncate">{product.brand}</p>
            <h2 className="text-lg font-semibold text-[#F2F2F2] truncate mt-0.5">{product.name}</h2>
            <span className="text-sm text-[#9A9A9F] mt-1 block">Ref: {product.id.slice(0,6).toUpperCase()}</span>
          </div>
        </div>
        {/* Price */}
        <div className="text-right flex-shrink-0">
          <span className="text-lg font-bold text-[#F2F2F2]">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="block text-xs text-[#6B6B72] mt-0.5">Inclusive of tax</span>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="px-5 py-8 flex flex-col space-y-10 pb-40">
        {/* Block 1: What's the occasion? */}
        <section className="bg-[#1A1A1D] border border-[#26262B] rounded-[14px] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <label className="text-[16px] sm:text-[17px] font-bold text-[#F2F2F2] tracking-tight block">
              What's the occasion?
            </label>
            <span className="text-[12px] text-[#9A9A9F] font-medium">Select one</span>
          </div>
          {/* Wrapping Row of Selectable Chips */}
          <div aria-label="What's the occasion?" className="flex flex-wrap gap-2.5" role="radiogroup">
            {occasionsList.map((opt) => {
              const isActive = occasion === opt;
              if (isActive) {
                return (
                  <button key={opt} aria-checked="true" className="h-14 px-6 rounded-full text-base font-semibold border border-white bg-[#2a2a2e] text-white shadow-sm flex items-center gap-2 transition-all" role="radio" type="button">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                    </svg>
                    <span>{opt}</span>
                  </button>
                )
              }
              return (
                <button key={opt} onClick={() => setOccasion(opt)} aria-checked="false" className="h-14 px-6 rounded-full text-base font-medium border border-[#26262B] bg-[#141416] text-[#9A9A9F] hover:text-[#F2F2F2] hover:border-[#38383F] transition-all flex items-center justify-center active:scale-95" role="radio" type="button">
                  {opt}
                </button>
              )
            })}
          </div>
        </section>

        {/* Block 2: Wears slider & Cost-per-wear calculus */}
        <section className="bg-[#1A1A1D] border border-[#26262B] rounded-[14px] p-4 sm:p-5 shadow-sm">
          <label className="text-[16px] sm:text-[17px] font-bold text-[#F2F2F2] tracking-tight block leading-snug mb-3" htmlFor="wear-slider">
            Honestly, how many times can you see yourself wearing it?
          </label>
          {/* Current Value Display */}
          <div className="py-2 flex items-baseline justify-between border-b border-[#26262B] mb-4">
            <span className="text-[13px] text-[#9A9A9F] uppercase tracking-wider font-medium">Projected Usage</span>
            <div className="text-right">
              <span className="text-[28px] font-bold text-[#F2F2F2] tracking-tight leading-none">{wears}</span>
              <span className="text-[17px] font-medium text-[#9A9A9F] ml-1">{wears === 1 ? 'wear' : 'wears'}</span>
            </div>
          </div>
          {/* Slider Component */}
          <div className="space-y-2 mb-5">
            <div className="relative py-1 flex items-center">
              <input 
                aria-label="Expected wear frequency" 
                className="w-full" 
                id="wear-slider" 
                max="30" 
                min="1" 
                step="1" 
                type="range" 
                value={wears} 
                onChange={(e) => setWears(parseInt(e.target.value))}
              />
            </div>
            {/* Slider Track Labels */}
            <div className="flex justify-between text-[12px] text-[#6B6B72] font-medium px-0.5">
              <span>1 wear</span>
              <span>15</span>
              <span>30+ wears</span>
            </div>
          </div>
          {/* Mathematical Calculation Line (Neutral, strictly factual) */}
          <div className="bg-[#121214] border border-[#26262B] rounded-[10px] p-3.5 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-wider text-[#9A9A9F] font-semibold">Cost per wear</span>
              <span className="text-[15px] font-medium text-[#F2F2F2] tabular-nums">
                ₹{product.price.toLocaleString('en-IN')} ÷ {wears} wears = <strong className="font-bold text-white">₹{cpw.toLocaleString('en-IN')}</strong> per wear
              </span>
            </div>
          </div>
          {/* Factual Reference Note (No qualitative judgment or rating badge) */}
          <p className="text-[13px] text-[#9A9A9F] italic leading-relaxed">
            Everyday and casual wear is typically worn 15–30 times.
          </p>
        </section>

        {/* Block 3: What's your main hesitation? */}
        <section className="bg-[#1A1A1D] border border-[#26262B] rounded-[14px] p-4 sm:p-5 shadow-sm">
          <label className="text-[16px] sm:text-[17px] font-bold text-[#F2F2F2] tracking-tight block mb-3.5">
            What's your main hesitation?
          </label>
          {/* Vertical list of tappable rows with radio indicators */}
          <div aria-label="What's your main hesitation?" className="space-y-2" role="radiogroup">
            {hesitationsList.map(opt => {
              const isActive = hesitation === opt.id;
              return (
                <label 
                  key={opt.id}
                  onClick={() => setHesitation(opt.id)}
                  className={`flex items-center justify-between p-5 rounded-xl cursor-pointer transition-colors min-h-[56px] ${isActive ? 'bg-[#1E1E22] border border-[#3E3E45]' : 'bg-[#141416] border border-[#26262B] hover:border-[#38383F]'}`}
                >
                  <span className={`text-base ${isActive ? 'text-white font-semibold' : 'text-[#F2F2F2] font-medium'}`}>{opt.id}</span>
                  <input checked={isActive} onChange={()=>{}} className="sr-only" name="hesitation" type="radio" value={opt.id} />
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'border-2 border-[#F2F2F2]' : 'border border-[#9A9A9F]/60'}`}>
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-[#F2F2F2]' : 'bg-transparent'}`}></div>
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sticky Bottom CTA Area with Coral Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full max-w-[430px] p-5 bg-gradient-to-t from-[#0D0D0F] via-[#0D0D0F]/95 to-transparent pt-8 pointer-events-auto border-t border-[#1A1A1D]/80">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full h-16 ${isGenerating ? 'bg-[#E02E5A] opacity-80' : 'bg-[#FF3E6C] hover:bg-[#E02E5A] active:scale-[0.99]'} text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#FF3E6C]/20 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF3E6C] focus:ring-offset-2 focus:ring-offset-[#0D0D0F]`} 
            type="button"
          >
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <span>Generate my Match Check</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
