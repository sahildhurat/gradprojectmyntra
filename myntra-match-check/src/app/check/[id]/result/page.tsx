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
    return <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center text-[#F2F2F2]">Loading assessment...</div>;
  }

  if (!product || !check || !check.assessment) return null;

  const assessment = check.assessment;
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
        }
      `}} />

      {/* Top Navigation / Status Header */}
      <header className="sticky top-0 z-30 bg-[#0D0D0F]/95 backdrop-blur-md px-5 pt-5 pb-3.5 flex items-center justify-between border-b border-[#26262B]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} type="button" aria-label="Go back" className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-[#9A9A9F] hover:text-[#F2F2F2] hover:bg-[#1A1A1D] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <div>
            <h1 className="text-[18px] font-bold text-[#F2F2F2] leading-tight">Match Check</h1>
          </div>
        </div>
        <button type="button" aria-label="Reference options" className="w-10 h-10 rounded-full flex items-center justify-center text-[#9A9A9F] hover:text-[#F2F2F2] hover:bg-[#1A1A1D] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M7 12h10m-7 6h4"></path>
          </svg>
        </button>
      </header>

      {/* Content Area */}
      <div className="flex-1 px-4 pt-4 pb-28 space-y-10">

        {/* Compact Product Summary Bar */}
        <section className="bg-[#1A1A1D] border border-[#26262B] rounded-[14px] p-3 flex items-center gap-3.5 shadow-sm">
          <div className="w-14 h-14 rounded-lg bg-[#26262B] flex-shrink-0 flex items-center justify-center border border-[#34343B] overflow-hidden relative">
            <img alt={product.name} className="w-full h-full object-cover object-center brightness-90 contrast-105" loading="lazy" src={product.imageUrl} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-[#9A9A9F] uppercase tracking-wider truncate">{product.brand}</div>
            <div className="text-[14px] font-semibold text-[#F2F2F2] truncate mt-0.5">{product.name}</div>
            <div className="text-[13px] font-medium text-[#9A9A9F] mt-0.5">₹{product.price.toLocaleString('en-IN')} <span className="text-[11px] font-normal text-[#9A9A9F]/80">· MRP Inclusive of taxes</span></div>
          </div>
        </section>

        {/* Quiet Context Line */}
        <div className="px-2 py-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9A9A9F]/60"></span>
          <p className="text-[13px] font-medium text-[#9A9A9F]">
            Checked for: <span className="text-[#F2F2F2]">{check.occasion}</span> · <span className="text-[#F2F2F2]">{check.expectedWears} expected wears</span>
          </p>
        </div>

        {/* Trust & Verification Card */}
        {check.trustBlock && check.trustBlock.items.length > 0 && (
          <section className="bg-[#1A1A1D] border border-[#26262B] rounded-[14px] p-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3.5 border-b border-[#26262B]/80">
              <svg className="w-[18px] h-[18px] text-[#9A9A9F] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"></path>
              </svg>
              <h2 className="text-[15px] font-bold text-[#F2F2F2] tracking-tight">Trust & Verification</h2>
            </div>
            <ul className="divide-y divide-[#26262B]/60 pt-1">
              {check.trustBlock.items.map((item: any, idx: number) => (
                <li key={idx} className="py-3 flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#9A9A9F] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
                  </svg>
                  <span className="text-[13.5px] leading-snug text-[#F2F2F2]">{item.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Why it could work for you */}
        {assessment.match_reasons && assessment.match_reasons.length > 0 && (
          <section className="space-y-3 pt-1">
            <div className="px-1 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#F2F2F2] tracking-tight">Why it could work for you</h2>
            </div>
            <div className="space-y-2.5">
              {assessment.match_reasons.map((reason: any, idx: number) => (
                <div key={idx} className="bg-[#1A1A1D] border border-[#26262B] rounded-[14px] p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border border-[#9A9A9F]/40 flex items-center justify-center text-[#9A9A9F] flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#9A9A9F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                      </svg>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-[15px] font-medium text-[#F2F2F2] leading-relaxed">{reason.statement}</p>
                      <div>
                        <a href="#" onClick={(e)=>e.preventDefault()} className="text-[12px] text-[#9A9A9F] underline underline-offset-4 decoration-[#9A9A9F]/60 hover:text-[#F2F2F2] transition-colors">
                          Why am I seeing this?
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Things to consider */}
        {assessment.considerations && assessment.considerations.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="px-1 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#F2F2F2] tracking-tight">Things to consider</h2>
            </div>
            <div className="space-y-2.5">
              {assessment.considerations.map((cons: any, idx: number) => (
                <div key={idx} className="bg-[#1A1A1D] border border-[#26262B] rounded-[14px] p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border border-[#9A9A9F]/40 flex items-center justify-center text-[#9A9A9F] flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#9A9A9F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="9"></circle>
                      </svg>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-[15px] font-medium text-[#F2F2F2] leading-relaxed">
                        {cons.condition} {cons.implication}
                      </p>
                      <div>
                        <a href="#" onClick={(e)=>e.preventDefault()} className="text-[12px] text-[#9A9A9F] underline underline-offset-4 decoration-[#9A9A9F]/60 hover:text-[#F2F2F2] transition-colors">
                          Why am I seeing this?
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* What remains unclear */}
        {assessment.unknowns && assessment.unknowns.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="px-1">
              <h2 className="text-[16px] font-bold text-[#F2F2F2] tracking-tight">What remains unclear</h2>
            </div>
            <div className="space-y-2.5">
              {assessment.unknowns.map((unk: any, idx: number) => (
                <div key={idx} className="bg-[#141416] border border-[#26262B]/80 rounded-[14px] p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border border-[#9A9A9F]/30 flex items-center justify-center text-[#9A9A9F]/80 flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#9A9A9F]/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01"></path>
                      </svg>
                    </div>
                    <p className="text-[14px] font-normal text-[#9A9A9F] leading-relaxed">
                      {unk.statement} {unk.missing_information}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cost per wear block */}
        <section className="space-y-3 pt-2 pb-2">
          <div className="px-1">
            <h2 className="text-[16px] font-bold text-[#F2F2F2] tracking-tight">Cost per wear</h2>
          </div>
          <div className="bg-[#1A1A1D] border border-[#26262B] rounded-[14px] p-4 shadow-sm space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[32px] font-bold text-[#F2F2F2] tracking-tight leading-none">₹{cpw.toLocaleString('en-IN')} <span className="text-[14px] font-medium text-[#9A9A9F]">/ wear</span></div>
                <div className="text-[12px] text-[#9A9A9F] mt-0.5">at {check.expectedWears} wears</div>
              </div>
              <div className="text-[14px] font-semibold text-[#F2F2F2] bg-[#26262B] px-2.5 py-1 rounded-full border border-[#34343B]">
                {check.expectedWears} wears
              </div>
            </div>
            
            {/* Using interactive elements but styling them to look like the static HTML */}
            <div className="space-y-1.5 pointer-events-none">
              <input type="range" min="1" max="30" value={check.expectedWears} readOnly className="w-full h-1.5 bg-[#26262B] rounded-lg appearance-none cursor-default accent-[#F2F2F2]" />
              <div className="flex justify-between text-[11px] text-[#9A9A9F] px-0.5">
                <span>1 wear</span>
                <span>15 wears</span>
                <span>30+ wears</span>
              </div>
            </div>

            <p className="text-[12px] text-[#9A9A9F] italic leading-normal border-b border-[#26262B]/80 pb-3">
              Occasion wear is typically worn 2–5 times.
            </p>

            {/* Reflection Question & Neutral Pill Buttons */}
            <div className="space-y-2.5 pt-1">
              <p className="text-[13.5px] font-medium text-[#F2F2F2]">
                Would this feel worth it at ₹{cpw.toLocaleString('en-IN')} per wear?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'yes', label: 'Yes' },
                  { id: 'notsure', label: 'Not sure' },
                  { id: 'no', label: 'No' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => handleFeeling(opt.id)}
                    type="button" 
                    className={`py-3.5 px-4 rounded-full border border-[#26262B] text-[15px] font-medium transition-colors text-center focus:outline-none ${selectedFeeling === opt.id ? 'bg-[#3E3E48] text-white border-[#4E4E58]' : 'bg-[#26262B]/60 text-[#F2F2F2] hover:bg-[#26262B]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Primary Action */}
      <footer className="sticky bottom-0 p-4 bg-[#0D0D0F]/95 backdrop-blur-md border-t border-[#26262B] z-20">
        <button 
          onClick={handleDecision}
          type="button" 
          className="w-full h-14 rounded-[12px] bg-[#FF3E6C] text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#e6355f] active:scale-[0.99] transition-all shadow-lg shadow-[#FF3E6C]/20 focus:outline-none focus:ring-2 focus:ring-[#FF3E6C]/50"
        >
          <span>Continue to my decision</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
          </svg>
        </button>
      </footer>
    </>
  );
}
