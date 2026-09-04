"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { products } from '../../../../data/products';
import { Check } from '../../../../data/types';
import { trackEvent } from '../../../../lib/events';
import { markProductChecked } from '../../../../lib/progress';

export default function ResultScreen() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const productId = params?.id as string;
  const checkId = searchParams?.get('checkId');
  
  const product = products.find(p => p.id === productId);
  
  const [check, setCheck] = useState<Check | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  
  // Drawer state
  const [activeDrawer, setActiveDrawer] = useState<any>(null);

  useEffect(() => {
    if (!checkId) {
      router.push('/');
      return;
    }
    
    fetch(`/api/assess?checkId=${checkId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setCheck(data);
          if (data.productId) {
            markProductChecked(data.productId);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [checkId, router]);

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-primary">Loading assessment...</div>;
  }

  if (!product || !check || !check.assessment) return null;

  const assessment = check.assessment;
  const matchScore = 86; // Mock score since it's not in the AI schema
  const cpw = Math.round(product.price / check.expectedWears);

  const handleDecision = () => {
    trackEvent('decision_screen_viewed', product.id, { checkId, feeling: selectedFeeling });
    router.push(`/decision/${product.id}?checkId=${checkId}`);
  };

  const handleFeeling = (feeling: string) => {
    setSelectedFeeling(feeling);
    trackEvent('feeling_selected', product.id, { feeling });
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button aria-label="Back" className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-on-surface hover:text-primary transition-colors" onClick={() => router.back()}>
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-title-md text-title-md text-on-surface tracking-tight">Diagnostic Detail</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 bg-primary-container/15 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-primary text-[14px]">auto_awesome</span>
              <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase">AI Match</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-32">
          


          <section className="px-4 py-6">
            <div className="relative overflow-hidden bg-surface-container rounded-3xl p-6 shadow-md border border-white/5">
              <div className="absolute -right-12 -top-12 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative flex flex-col items-center justify-center gap-4 text-center">
                <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-surface-container-highest" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className={matchScore > 75 ? "text-tertiary" : "text-secondary"} cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * matchScore) / 100} strokeLinecap="round" strokeWidth="8.5"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-lg text-[40px] text-on-surface font-bold tracking-tighter">{matchScore}</span>
                  </div>
                </div>
                <div>
                  <h2 className="font-title-md text-[20px] text-on-surface tracking-tight font-bold">{matchScore > 75 ? 'Strong Match' : 'Moderate Match'}</h2>
                  <p className="font-body-sm text-[14px] text-on-surface-variant mt-1">Calibrated for <span className="text-on-surface font-semibold">{check.occasion}</span></p>
                </div>
              </div>
            </div>
          </section>

          {/* Match Reasons */}
          <section className="px-4 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>spark</span>
              <h3 className="font-title-md text-[18px] text-on-surface font-bold">Why it works</h3>
            </div>
            <div className="space-y-4">
              {assessment.match_reasons?.map((reason: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => reason.evidence_ids?.length && setActiveDrawer({ type: 'reason', data: reason })}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">check_circle</span>
                  <p className="font-body-md text-[15px] text-on-surface leading-relaxed group-hover:text-tertiary transition-colors">{reason.statement}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Considerations */}
          {assessment.considerations && assessment.considerations.length > 0 && (
            <section className="px-4 pt-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <h3 className="font-title-md text-[18px] text-on-surface font-bold">Things to consider</h3>
              </div>
              <div className="space-y-4">
                {assessment.considerations.map((cons: any, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => cons.evidence_ids?.length && setActiveDrawer({ type: 'consideration', data: cons })}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">info</span>
                    <div>
                      <p className="font-body-md text-[15px] text-on-surface leading-relaxed font-medium group-hover:text-secondary transition-colors">{cons.condition}</p>
                      <p className="font-body-sm text-[13px] text-on-surface-variant mt-1">{cons.implication}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Value Diagnostic */}
          <section className="px-4 pt-8">
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">calculate</span>
                </div>
                <div>
                  <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Cost Per Wear</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline-md text-[24px] text-on-surface tracking-tight font-bold">₹{cpw}</span>
                    <span className="font-body-sm text-[13px] text-on-surface-variant">/ occasion</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Decision Question */}
          <section className="px-4 pt-6 pb-4">
            <div className="bg-surface-container-low rounded-3xl p-4 text-center shadow-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">Hesitation Check</span>
              <h4 className="font-title-md text-title-md text-on-surface mt-1">Would this purchase feel worth it?</h4>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { id: 'yes', icon: 'sentiment_satisfied', label: 'Yes', color: 'text-tertiary' },
                  { id: 'notsure', icon: 'sentiment_neutral', label: 'Unsure', color: 'text-secondary' },
                  { id: 'no', icon: 'sentiment_dissatisfied', label: 'No', color: 'text-primary' }
                ].map(f => (
                  <button 
                    key={f.id}
                    onClick={() => handleFeeling(f.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${selectedFeeling === f.id ? 'bg-surface-container-highest ring-1 ring-outline' : 'bg-surface-container hover:bg-surface-container-high'}`}
                  >
                    <span className={`material-symbols-outlined ${f.color} text-[24px]`}>{f.icon}</span>
                    <span className="font-label-md text-label-md mt-1">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Sticky Decision Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl px-4 py-4 shadow-xl pb-safe">
            <div className="max-w-md mx-auto flex items-center gap-3">
              <button onClick={() => router.back()} className="w-12 h-12 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center shrink-0 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
              <button 
                onClick={handleDecision}
                className="flex-1 h-12 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-[0_0_24px_-2px_rgba(255,79,116,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <span>Continue to my decision</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Evidence Drawer */}
          {activeDrawer && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col justify-end" onClick={() => setActiveDrawer(null)}>
              <div className="bg-surface-container-high rounded-t-3xl p-6 max-w-md w-full mx-auto shadow-2xl transition-transform transform translate-y-0" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-surface-container-highest rounded-full mx-auto mb-4"></div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">info</span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">AI Deep Insight</h4>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center" onClick={() => setActiveDrawer(null)}>
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {product.evidence.find((e: any) => e.id === activeDrawer.data.evidence_ids?.[0])?.content}
                </p>
                <button className="w-full mt-6 h-11 rounded-full bg-surface-container-highest text-on-surface font-label-md text-label-md" onClick={() => setActiveDrawer(null)}>
                  Got it
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
