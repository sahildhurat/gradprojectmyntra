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

  if (!shareData || !product) return null;

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

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="flex items-center gap-2">
            <span className="font-headline-md text-headline-md tracking-tighter uppercase font-bold text-on-surface">MATCH CHECK</span>
          </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-24 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-4 pb-12 gap-6">
          
          <div className="flex flex-col gap-2 mt-3">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[14px]">diversity_1</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Social Gut-Check</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold tracking-tight">Ask Your Inner Circle</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Friends who know your style give the best gut-check before checkout.</p>
          </div>

          <div className="relative w-full rounded-lg bg-surface-container-low p-5 shadow-xl overflow-hidden flex flex-col gap-4">
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary-container/20 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-tertiary/15 blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">visibility</span>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Interactive Vote Card Preview</span>
              </div>
            </div>

            <div className="z-10 rounded bg-surface-container p-4 flex gap-4 items-center">
              <div className="relative w-20 h-24 rounded overflow-hidden shrink-0 bg-surface-container-highest">
                <img className="w-full h-full object-cover" src={product.imageUrl} alt={product.name}/>
              </div>
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <span className="font-label-sm text-label-sm text-[#9A9A9F] uppercase tracking-wider truncate">{product.brand}</span>
                <h2 className="font-title-md text-title-md text-on-surface truncate font-semibold">{product.name}</h2>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="z-10 rounded bg-surface-container-high px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#1A1A1D] border border-[#26262B] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#9A9A9F] text-[16px]">celebration</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide">Shopper Goal</span>
                <p className="font-body-sm text-body-sm text-on-surface truncate">For: {shareData.occasion} • Target: ₹{shareData.costPerWear}/wear</p>
              </div>
            </div>

            <div className="z-10 rounded bg-surface-container-highest p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#9A9A9F]">
                <span className="material-symbols-outlined text-[16px]">help_center</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">Their Hesitation</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface italic">"{shareData.shopperQuestion}"</p>
            </div>
            
            {shareData.consideration && (
              <div className="z-10 rounded bg-[#1A1A1D] border border-[#26262B] p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#9A9A9F] text-[20px] shrink-0 mt-1">insights</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Match Engine Diagnostic</span>
                    <span className="font-label-sm text-label-sm px-2 rounded bg-secondary-container/30 text-on-surface">Fit Alert</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface mt-1">{shareData.consideration}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <button onClick={handleWhatsApp} className="w-full py-4 px-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center gap-3 shadow-lg shadow-tertiary/20 active:scale-[0.98] transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.79.82 3.182 0 5.768-2.587 5.769-5.766.001-3.183-2.585-5.806-5.769-5.806zm3.374 8.204c-.146.415-.747.788-1.042.839-.27.047-.621.086-1.78-.394-1.481-.613-2.433-2.122-2.507-2.22-.074-.099-.601-.799-.601-1.523 0-.724.379-1.081.514-1.229.135-.148.295-.185.394-.185.099 0 .197.001.283.006.091.005.212-.034.331.253.123.296.42 1.026.456 1.101.037.074.062.161.013.259-.05.099-.074.16-.148.247-.074.086-.156.193-.223.259-.074.074-.152.155-.065.304.087.148.386.637.828 1.031.57.508 1.051.666 1.2.74.148.074.234.062.321-.037.086-.099.37-.432.469-.58.099-.148.197-.123.332-.074.136.049.863.407 1.011.481.148.074.247.111.284.173.037.062.037.358-.109.773zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.436 5.176L2 22l4.981-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"></path>
              </svg>
              <span className="font-label-lg text-label-lg font-bold">Share directly on WhatsApp</span>
            </button>
            <button onClick={handleCopy} className="w-full py-4 px-6 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center gap-3 shadow-sm active:bg-surface-container-highest transition-colors">
                  <div className="flex flex-col items-start flex-1">
                  <span className="font-title-md text-title-md text-white font-bold flex items-center gap-2">
                    {copied ? 'Copied to Clipboard!' : 'Copy Secure Link'}
                  </span>
                  <span className="font-body-sm text-body-sm text-white/90">Share anywhere you like</span>
                </div>
              <div className="z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">{copied ? 'check' : 'content_copy'}</span>
              </div>
            </button>
          </div>

          <div className="rounded bg-surface-container-lowest/80 p-3 flex items-center justify-center gap-2 text-center">
            <span className="material-symbols-outlined text-[16px] text-outline">lock</span>
            <span className="font-label-sm text-label-sm text-outline">Only friends with this secure link can view and vote.</span>
          </div>
          
          <div className="mt-2 bg-surface-container rounded-xl p-4 shadow-md border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-title-md text-title-md text-on-surface">Live Responses</h3>
              {votes.length === 0 ? (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wide">Waiting...</span>
                </div>
              ) : (
                <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-full">{votes.length} Votes</span>
              )}
            </div>
            
            {votes.length > 0 ? (
              <div className="space-y-3">
                {votes.map((v, idx) => (
                  <div key={idx} className="bg-surface-container-low p-3 rounded-lg flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface font-bold">{v.response}</span>
                      {v.comment && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">"{v.comment}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="font-body-sm text-on-surface-variant">Share the link with friends to get their opinions here.</p>
              </div>
            )}
            
            {votes.length > 0 && (
              <button 
                onClick={() => {
                  trackEvent('owner_returned_after_vote', product.id, { voteCount: votes.length });
                  router.back();
                }}
                className="w-full mt-4 py-3 rounded-full bg-surface-container-highest text-on-surface font-label-md font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                Return to my decision
              </button>
            )}
          </div>
          
        </div>
      </main>
    </>
  );
}
