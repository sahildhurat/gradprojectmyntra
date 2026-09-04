"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { products } from '../../../data/products';
import { trackEvent } from '../../../lib/events';
import { buildWhatsAppLink } from '../../../lib/shareToken';

export default function ShareScreen() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  
  const [shareData, setShareData] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [votes, setVotes] = useState<any[]>([]);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    
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

    const pollVotes = () => {
      fetch(`/api/votes?token=${token}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.votes) setVotes(data.votes);
        })
        .catch(err => console.error(err));
    };

    pollVotes(); // Initial fetch
    const interval = setInterval(pollVotes, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [token, router]);

  if (!shareData || !product) return <div className="min-h-screen bg-[#0e0e10] text-[#f2f2f4]"></div>;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/vote/${token}` : '';
  const waLink = buildWhatsAppLink(shareUrl, product.name);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackEvent('share_link_copied', product.id, { token });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    trackEvent('share_whatsapp_clicked', product.id, { token });
    window.open(waLink, '_blank');
  };

  const getVoteStats = () => {
    const total = votes.length;
    if (total === 0) return null;
    
    const counts: Record<string, number> = {
      'Works for you': 0,
      'Only if...': 0,
      'Not for this use': 0,
      'Not sure': 0
    };
    
    votes.forEach(v => {
      if (counts[v.response] !== undefined) counts[v.response]++;
    });
    
    return [
      { label: 'Works for you', count: counts['Works for you'], percent: Math.round((counts['Works for you'] / total) * 100) },
      { label: 'Only if...', count: counts['Only if...'], percent: Math.round((counts['Only if...'] / total) * 100) },
      { label: 'Not for this use', count: counts['Not for this use'], percent: Math.round((counts['Not for this use'] / total) * 100) },
      { label: 'I\'m not sure', count: counts['Not sure'], percent: Math.round((counts['Not sure'] / total) * 100) },
    ];
  };

  const stats = getVoteStats();
  const cpw = shareData.costPerWear || Math.round(product.price / shareData.expectedWears);

  if (votes.length > 0 && stats) {
    // Render Results Screen
    return (
      <div className="min-h-screen bg-[#0e0e10] text-[#f2f2f2] flex flex-col justify-between antialiased selection:bg-[#ff3e6c]/30 selection:text-white">
        <div className="w-full max-w-[430px] mx-auto px-4 py-8 flex flex-col min-h-screen justify-between">
          <header className="flex items-center justify-between pb-6">
            <button onClick={() => router.back()} type="button" className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors" aria-label="Back">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">Inner Circle Feedback</span>
              <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">What your circle said</h1>
            </div>
            <div className="w-10"></div>
          </header>

          <main className="flex-1 space-y-6">
            <section className="bg-[#1a1a1d] border border-neutral-800/80 rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 border border-neutral-800">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">{product.brand}</span>
                  <span className="text-xs text-neutral-400">₹{cpw.toLocaleString('en-IN')}/wear ({shareData.expectedWears} wears)</span>
                </div>
                <h2 className="text-sm font-semibold text-white truncate">{product.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-medium text-neutral-200">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-neutral-500 text-xs">•</span>
                  <span className="text-xs text-neutral-400">{shareData.occasion}</span>
                </div>
              </div>
            </section>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white tracking-tight">{votes.length} responses</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700/60">Active 24h</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">Feedback from people evaluating your specific occasion and wear.</p>
              </div>
            </div>

            <section className="bg-[#161619] border border-neutral-800/80 rounded-2xl p-5 space-y-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-md bg-neutral-800/90 font-semibold flex items-center justify-center text-xs ${stat.count > 0 ? 'text-white' : 'text-neutral-400'}`}>{stat.count}</span>
                      <span className={`font-medium ${stat.count > 0 ? 'text-neutral-100' : 'text-neutral-400'}`}>{stat.label}</span>
                    </div>
                    <span className={`text-xs font-medium ${stat.count > 0 ? (idx === 0 ? 'text-neutral-300 font-semibold' : 'text-neutral-400') : 'text-neutral-500'}`}>{stat.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#222226] rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-100 rounded-full" style={{ width: `${stat.percent}%`, opacity: stat.percent > 0 ? (idx === 0 ? 0.95 : 0.55) : 0.2 }}></div>
                  </div>
                </div>
              ))}
            </section>

            <section className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Notes from friends</h3>
                <span className="text-xs text-neutral-500">{votes.filter(v => v.comment).length} comments</span>
              </div>

              {votes.filter(v => v.comment).map((v, idx) => (
                <div key={idx} className="bg-[#161619] border border-neutral-800/80 rounded-xl p-4 space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-white">
                        F
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-neutral-200">Friend</span>
                        <span className="text-[11px] text-neutral-500 ml-1.5">• Just now</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                      {v.response}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-200 pl-10 leading-relaxed">
                    "{v.comment}"
                  </p>
                </div>
              ))}
            </section>

          </main>

          <footer className="pt-8 pb-2">
            <button 
              onClick={() => {
                trackEvent('owner_returned_after_vote', product.id, { voteCount: votes.length });
                router.back();
              }}
              type="button" 
              className="w-full py-3.5 px-6 rounded-xl bg-[#ff3e6c] hover:bg-[#e0355e] active:scale-[0.99] text-white font-semibold text-sm tracking-wide shadow-lg shadow-[#ff3e6c]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Return to my decision</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <p className="text-center text-[11px] text-neutral-500 mt-2.5">
              Responses are private to you and saved to your evaluation dossier.
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // Render Share Link Screen
  return (
    <div className="min-h-screen bg-[#0e0e10] text-[#f2f2f4] flex flex-col justify-between items-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-[430px] flex flex-col items-center min-h-screen">
        
        <header className="w-full flex items-center justify-between pb-6 pt-2">
          <button onClick={() => router.back()} className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#9a9a9f] hover:text-white hover:bg-[#1b1b1d] transition-colors" aria-label="Go back">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <div className="text-center">
            <span className="block text-[11px] font-medium tracking-wider uppercase text-[#7a7a80]">Inner Circle</span>
            <h1 className="text-base font-semibold tracking-tight text-[#f2f2f4]">Ask people you trust</h1>
          </div>
          <div className="w-9 h-9"></div>
        </header>

        <main className="w-full flex flex-col items-center gap-5 flex-1">
          
          <div className="w-full bg-[#1b1b1d] border border-[#2b2b30] rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="px-4 py-2.5 bg-[#171719] border-b border-[#25252a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff3e6c]/80"></span>
                <span className="text-[11px] font-medium text-[#9a9a9f] tracking-wide">Shared via Inner Circle</span>
              </div>
              <span className="text-[11px] text-[#6e6e75]">Preview</span>
            </div>

            <div className="w-full aspect-[16/10] bg-[#141416] overflow-hidden relative">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-center brightness-[0.96]" />
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#0e0e10]/80 backdrop-blur-md text-[#d0d0d4] border border-white/10 w-fit max-w-max">For: {shareData.occasion}</span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#9a9a9f]">{product.brand}</span>
                <h2 className="text-base font-semibold text-[#f2f2f4] leading-snug">{product.name}</h2>
              </div>

              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-base font-bold text-[#f2f2f4]">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-xs text-[#9a9a9f]">·</span>
                <span className="text-xs font-medium text-[#c0c0c6]">₹{cpw.toLocaleString('en-IN')} per wear at {shareData.expectedWears} wears</span>
              </div>

              <div className="w-full h-[1px] bg-[#26262b] my-0.5"></div>

              {shareData.consideration && (
                <div className="flex items-start gap-2.5 bg-[#141416] border border-[#222226] rounded-lg p-2.5">
                  <div className="pt-0.5 text-[#9a9a9f] flex-shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9"></circle>
                    </svg>
                  </div>
                  <p className="text-xs text-[#c0c0c6] leading-relaxed">
                    {shareData.consideration}
                  </p>
                </div>
              )}

              <div className="relative bg-[#202024] rounded-xl p-3 border-l-2 border-[#ff3e6c]/70">
                <p className="text-[13px] italic text-[#e6e6ea] leading-relaxed">
                  “{shareData.shopperQuestion}”
                </p>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-1.5 mt-1">
            <label htmlFor="shopper-question" className="text-xs font-medium text-[#9a9a9f]">
              Your question
            </label>
            <div className="relative w-full">
              <input type="text" readOnly id="shopper-question" value={shareData.shopperQuestion} className="w-full bg-[#1b1b1d] border border-[#2b2b30] focus:border-[#ff3e6c] text-[#f2f2f4] text-xs rounded-xl px-3.5 py-3 pr-8 transition-colors text-ellipsis outline-none" />
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-2.5 mt-1">
            <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 bg-[#1b1b1d] hover:bg-[#222226] border border-[#2c2c31] active:scale-[0.98] transition-all rounded-xl py-3 px-2 text-xs font-medium text-[#f2f2f4]">
              <svg className="w-4 h-4 text-[#25D366] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span className="">WhatsApp</span>
            </button>

            <button onClick={handleCopy} className="flex items-center justify-center gap-2 bg-[#1b1b1d] hover:bg-[#222226] border border-[#2c2c31] active:scale-[0.98] transition-all rounded-xl py-3 px-2 text-xs font-medium text-[#f2f2f4]">
              {copied ? (
                <svg className="w-4 h-4 text-[#9a9a9f] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#9a9a9f] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
              <span className="">{copied ? 'Copied' : 'Copy link'}</span>
            </button>
          </div>

          <div className="w-full flex items-center justify-center gap-2 mt-2 pt-2 border-t border-[#2b2b30]">
            <span className="material-symbols-outlined text-[#9A9A9F] text-[18px] animate-spin">sync</span>
            <span className="text-[12px] text-[#9A9A9F]">Waiting for live responses...</span>
          </div>

          <footer className="w-full pt-4 pb-4 text-center mt-auto">
            <p className="text-[12px] text-[#7a7a80] leading-normal font-normal">
              Link expires in 24 hours. Friends don't need the app.
            </p>
          </footer>

        </main>
      </div>
    </div>
  );
}
