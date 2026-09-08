"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { products } from '../../../data/products';
import { trackEvent } from '../../../lib/events';

export default function VoteScreen() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  
  const [shareData, setShareData] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedVote, setSelectedVote] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    // Fetch share details
    fetch(`/api/shares?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setShareData(data);
          const p = products.find(prod => prod.id === data.productId);
          setProduct(p);
        }
      })
      .catch(err => console.error(err));
  }, [token]);

  if (!shareData || !product) return <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center text-[#F2F2F2]">Loading...</div>;

  const handleVote = async () => {
    if (!selectedVote) return;
    setIsSubmitting(true);
    trackEvent('inner_circle_vote_submitted', product.id, { token, response: selectedVote });
    
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareToken: token,
          response: selectedVote,
          comment
        })
      });
      if (res.ok) {
        setHasVoted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const voteOptions = [
    { id: 'Works for you', value: 'Works for you' },
    { id: 'Only if…', value: 'Only if...' },
    { id: 'Not for this use', value: 'Not for this use' },
    { id: 'I\'m not sure', value: 'Not sure' }
  ];

  return (
    <>
      <div className="min-h-screen bg-[#0D0D0F] text-[#F2F2F2] flex flex-col items-center justify-start p-4 pb-12 selection:bg-[#FF3E6C]/20">
        {/* Mobile Viewport Container (~390px wide target) */}
        <main className="w-full max-w-[390px] mx-auto flex flex-col gap-5 pt-3">
          
          {/* TopContext */}
          <header className="flex items-center justify-between px-1 text-[13px] text-[#9A9A9F]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF3E6C]/80"></span>
              <span className="">Someone is deciding on this</span>
            </div>
            <span className="text-xs text-[#9A9A9F]/70 font-normal">Link expires in 24h</span>
          </header>

          {/* SharedProductCard */}
          <article className="bg-[#161619] border border-[#2E2E35] rounded-2xl overflow-hidden shadow-2xl transition-all">
            {/* Product Image with Context Badge */}
            <div className="relative w-full aspect-[4/3] bg-black/40 overflow-hidden">
              <img alt={product.name} className="w-full h-full object-cover object-center" src={product.imageUrl} />
              {/* Purpose / Occasion Badge Overlay */}
              <div className="absolute bottom-3 left-3 bg-[#0D0D0F]/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-sm flex items-center">
                <span className="text-[11px] font-medium tracking-wide text-[#F2F2F2] block">For: {shareData.occasion}</span>
              </div>
            </div>
            {/* Item Meta & Inset Shopper Query */}
            <div className="p-4 flex flex-col gap-3.5">
              {/* Brand & Product Title */}
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#9A9A9F] block mb-0.5">{product.brand}</span>
                <h1 className="text-[18px] font-bold text-[#F2F2F2] leading-snug">{product.name}</h1>
              </div>
              {/* Price & Cost Metric */}
              <div className="flex items-baseline gap-2.5 text-sm border-b border-[#26262B]/60 pb-3">
                <span className="text-[#F2F2F2] font-semibold text-base">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-[#9A9A9F] text-xs font-normal">· &nbsp;₹{shareData.costPerWear.toLocaleString('en-IN')} per wear at {shareData.expectedWears} wears</span>
              </div>
              {/* Optional Sizing/Fit Note */}
              {shareData.consideration && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#141416]/60 border border-[#26262B]/50 text-xs text-[#9A9A9F] leading-relaxed">
                  <svg className="w-4 h-4 text-[#9A9A9F]/80 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle></svg>
                  <span className="">{shareData.consideration}</span>
                </div>
              )}
              {/* Shopper's Personal Question */}
              <blockquote className="relative p-3.5 rounded-xl bg-[#1A1A1D] border border-[#26262B] pl-4 border-l-2 border-l-[#FF3E6C]">
                <p className="text-[13px] italic leading-relaxed text-[#F2F2F2]/90">
                  “{shareData.shopperQuestion}”
                </p>
              </blockquote>
            </div>
          </article>

          {/* DecisionSection */}
          {!hasVoted ? (
            <section className="mt-1 flex flex-col gap-4">
              {/* Section Header */}
              <div>
                <h2 className="text-[17px] font-semibold text-[#F2F2F2] tracking-tight">Does this work for them?</h2>
                <p className="text-xs text-[#9A9A9F] mt-0.5">Judged for their specific occasion and expected wear.</p>
              </div>
              {/* Voting Options Group */}
              <fieldset className="flex flex-col gap-2.5">
                <legend className="sr-only">Choose your advice for the shopper</legend>
                {voteOptions.map(opt => (
                  <label key={opt.id} className={`relative flex items-center justify-between py-4 px-4 rounded-xl border cursor-pointer transition-all active:scale-[0.99] select-none ${selectedVote === opt.value ? 'bg-[#1E1E23] border-[#3A3A42]' : 'bg-[#18181C] border-[#2A2A30] hover:bg-[#1E1E23]'}`}>
                    <span className={`text-[15px] font-medium ${selectedVote === opt.value ? 'text-[#F2F2F2]' : 'text-[#F2F2F2]/90'}`}>{opt.id}</span>
                    <input 
                      className="sr-only peer" 
                      name="verdict" 
                      type="radio" 
                      value={opt.value}
                      checked={selectedVote === opt.value}
                      onChange={() => setSelectedVote(opt.value)}
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedVote === opt.value ? 'border-[#FF3E6C] bg-[#FF3E6C]' : 'border-[#4E4E58]'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full bg-white ${selectedVote === opt.value ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                  </label>
                ))}
              </fieldset>
              
              {/* Optional Reasoning / Commentary */}
              <div className="mt-1">
                <label className="sr-only" htmlFor="feedback">Optional reason or guidance</label>
                <textarea 
                  className="w-full bg-[#141416] border border-[#26262B] rounded-xl p-3.5 text-[13px] text-[#F2F2F2] placeholder:text-[#9A9A9F] focus:border-[#3E3E48] focus:ring-0 resize-none transition-colors outline-none" 
                  id="feedback" 
                  placeholder="Tell them why (optional)" 
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                ></textarea>
              </div>
              
              {/* Action CTA & Privacy Reassurance */}
              <div className="flex flex-col gap-3 mt-1">
                <button 
                  onClick={handleVote}
                  disabled={!selectedVote || isSubmitting}
                  className={`w-full py-4 rounded-xl text-white font-medium text-[16px] flex items-center justify-center transition-all ${selectedVote && !isSubmitting ? 'bg-[#FF3E6C] shadow-lg shadow-[#FF3E6C]/20 hover:brightness-105 active:scale-[0.99]' : 'bg-[#FF3E6C]/50 cursor-not-allowed'}`} 
                  type="button"
                >
                  {isSubmitting ? 'Sending...' : 'Send my answer'}
                </button>
                <p className="text-[12px] text-[#9A9A9F] text-center leading-normal px-2">
                  Your response is sent privately to the shopper. No account needed.
                </p>
              </div>
            </section>
          ) : (
            <section className="mt-8 flex flex-col items-center justify-center gap-4 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#161619] border border-[#3E3E48] flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-[#FF3E6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-[20px] font-bold text-[#F2F2F2]">Answer sent!</h2>
              <p className="text-[14px] text-[#9A9A9F] leading-relaxed">
                Thank you for helping out. Your friend will see your response on their device.
              </p>
            </section>
          )}

        </main>
      </div>
    </>
  );
}
