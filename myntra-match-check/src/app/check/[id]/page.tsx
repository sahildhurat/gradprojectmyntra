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
  
  const [occasion, setOccasion] = useState("Festive Puja");
  const [wears, setWears] = useState(10);
  const [hesitation, setHesitation] = useState("Worth the price?");
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
        alert("Failed to generate assessment. Falling back to default.");
        setIsGenerating(false);
      }
    } catch (e) {
      console.error(e);
      alert("Error generating assessment");
      setIsGenerating(false);
    }
  };

  const occasionsList = [
    { label: "Everyday", icon: "routine" },
    { label: "Work & Desk", icon: "business_center" },
    { label: "Wedding Gala", icon: "celebration" },
    { label: "Date Night", icon: "nightlife" },
    { label: "Festive Puja", icon: "local_fire_department" },
    { label: "Weekend Brunch", icon: "bakery_dining" }
  ];

  const hesitationsList = [
    { id: "Worth the price?", icon: "monetization_on" },
    { id: "Will it fit my body type?", icon: "straighten" },
    { id: "Can I trust fabric & seller?", icon: "verified_user" },
    { id: "Will I wear it more than once?", icon: "checkroom" }
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-1">
              <span className="font-headline-md text-[22px] text-primary-container tracking-tighter uppercase font-bold">M</span>
              <div className="h-4 w-[1px] bg-outline-variant/40"></div>
              <span className="font-title-md text-[16px] text-on-surface tracking-tight">Match Studio</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-24 pb-32 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-4 pb-12">
          
          <section className="flex flex-col gap-1 mb-5">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] text-primary uppercase tracking-widest font-bold">Diagnostic Setup</span>
              <span className="font-label-sm text-[10px] text-on-surface-variant font-bold">Step 2 of 3</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden flex gap-1">
              <div className="h-full w-1/3 bg-primary rounded-full"></div>
              <div className="h-full w-1/3 bg-primary-container rounded-full shadow-[0_0_8px_rgba(255,79,116,0.6)]"></div>
              <div className="h-full w-1/3 bg-surface-variant rounded-full"></div>
            </div>
          </section>

          <section className="relative bg-surface-container-high rounded-2xl p-4 mb-8 shadow-md overflow-hidden border border-white/5">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-surface-container-lowest shrink-0 shadow-inner">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="inline-flex items-center gap-1">
                  <span className="font-label-sm text-[10px] text-tertiary uppercase tracking-wider font-bold">Selected for Audit</span>
                  <span className="w-1 h-1 rounded-full bg-tertiary"></span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold">In Bag</span>
                </div>
                <h2 className="font-title-md text-[16px] text-on-surface truncate mt-1">{product.name}</h2>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-sm text-[20px] text-on-surface font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.originalPrice && (
                    <>
                      <span className="font-body-sm text-[13px] text-outline line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      <span className="font-label-sm text-[10px] text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-full font-bold">{Math.round((product.originalPrice - product.price) / product.originalPrice * 100)}% OFF</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Occasion Selection */}
          <section className="flex flex-col mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-label-sm text-label-sm font-bold">1</span>
                <h3 className="font-title-md text-title-md text-on-surface">Target Occasion</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {occasionsList.map(opt => {
                const isActive = occasion === opt.label;
                return (
                  <button 
                    key={opt.label}
                    onClick={() => setOccasion(opt.label)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all ${isActive ? 'bg-primary/15 shadow-[0_0_16px_rgba(255,79,116,0.35)] ring-1 ring-primary/30' : 'bg-surface-container hover:bg-surface-bright'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className={`font-label-md text-[13px] ${isActive ? 'text-primary font-bold' : 'text-on-surface'}`}>{opt.label}</span>
                      {isActive && <span className="text-[10px] text-primary/80 uppercase tracking-wider font-bold mt-0.5">Active context</span>}
                    </div>
                    {isActive && <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Expected Wears */}
          <section className="flex flex-col mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-label-sm text-label-sm font-bold">2</span>
                <h3 className="font-title-md text-title-md text-on-surface">Realistic Lifespan Wears</h3>
              </div>
              <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-3 py-1 rounded-full uppercase tracking-wider font-bold">Utility Ratio</span>
            </div>
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Estimated usage over 18 mos:</span>
                <span className="font-headline-sm text-[20px] text-primary font-bold tracking-tight">{wears} {wears === 1 ? 'wear' : 'wears'}</span>
              </div>
              <div className="relative w-full py-4 flex items-center">
                <input 
                  type="range" 
                  min="1" max="50" 
                  value={wears} 
                  onChange={(e) => setWears(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer focus:outline-none" 
                  style={{ accentColor: 'var(--color-primary-container)' }}
                />
              </div>
              <div className="flex justify-between font-label-sm text-[11px] text-outline px-1 mb-6 font-medium">
                <span>1 wear (Event only)</span>
                <span>25 wears</span>
                <span>50+ wears (Staple)</span>
              </div>
              
              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 shadow-inner border border-black/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface-variant">Cost per wear</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-md text-[28px] text-on-surface font-bold tracking-tight">₹{cpw.toLocaleString('en-IN')}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">per wear at {wears} wears</span>
                </div>
              </div>
            </div>
          </section>

          {/* Hesitation Picker */}
          <section className="flex flex-col mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-label-sm text-label-sm font-bold">3</span>
                <h3 className="font-title-md text-title-md text-on-surface">What's holding you back?</h3>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {hesitationsList.map(opt => {
                const isActive = hesitation === opt.id;
                return (
                  <label 
                    key={opt.id}
                    onClick={() => setHesitation(opt.id)}
                    className={`cursor-pointer p-4 rounded-2xl flex items-start gap-4 transition-all border ${isActive ? 'bg-primary/10 border-primary/30 shadow-[0_4px_20px_rgba(255,79,116,0.15)]' : 'bg-surface-container border-transparent hover:bg-surface-bright'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-transparent border border-white/10'}`}>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <div className="flex flex-col flex-1 justify-center">
                      <span className={`font-title-md text-title-md ${isActive ? 'text-primary font-bold' : 'text-on-surface'}`}>{opt.id}</span>
                    </div>
                    <span className={`material-symbols-outlined text-[24px] ${isActive ? 'text-primary/60' : 'text-outline/40'}`}>{opt.icon}</span>
                  </label>
                )
              })}
            </div>
          </section>

          <section className="relative flex flex-col gap-3 pt-2">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-primary-container/20 blur-xl pointer-events-none"></div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`relative w-full h-14 rounded-full bg-primary-container text-on-primary font-headline-sm text-[18px] font-bold flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(255,79,116,0.4)] transition-transform overflow-hidden ${isGenerating ? 'opacity-80' : 'active:scale-[0.98]'}`}
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
                  <span>Synthesizing Reviews...</span>
                </>
              ) : (
                <>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></span>
                  <span className="material-symbols-outlined text-[24px] animate-pulse">auto_awesome</span>
                  <span>Generate my Match Check</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-center mt-2 px-4">
              <span className="material-symbols-outlined text-[16px] text-tertiary">lock_reset</span>
              <span className="font-label-sm text-[11px] leading-snug text-on-surface-variant font-bold">Synthesizes 1,420 fit reviews, returns history, and fabric specs</span>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
