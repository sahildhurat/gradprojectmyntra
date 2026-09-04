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
  const [votes, setVotes] = useState<any[]>([]);
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
      
    // Fetch existing votes
    fetch(`/api/votes?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.votes) setVotes(data.votes);
      })
      .catch(err => console.error(err));
  }, [token]);

  if (!shareData || !product) return <div className="min-h-screen bg-surface flex items-center justify-center text-primary">Loading...</div>;

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
        // Optimistic update
        setVotes([...votes, { response: selectedVote, comment, createdAt: new Date().toISOString() }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const voteOptions = [
    { id: 'Works for you', icon: 'thumb_up', color: 'text-tertiary' },
    { id: 'Only if...', icon: 'swap_horiz', color: 'text-secondary' },
    { id: 'Not for this use', icon: 'thumb_down', color: 'text-primary' },
    { id: 'Not sure', icon: 'help', color: 'text-outline' },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="font-headline-md text-headline-md text-primary-container tracking-tighter uppercase font-bold">M</span>
            <div className="h-4 w-[1px] bg-outline-variant/40"></div>
            <span className="font-title-md text-title-md text-on-surface tracking-tight">Inner Circle Vote</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-4 pb-12 gap-6">
          
          <div className="flex flex-col gap-2 mt-3 text-center">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold tracking-tight">Help your friend decide</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">They are counting on your honest opinion before they checkout.</p>
          </div>

          <div className="relative w-full rounded-lg bg-surface-container-low p-5 shadow-xl overflow-hidden flex flex-col gap-4">
            <div className="z-10 rounded bg-surface-container p-4 flex gap-4 items-center">
              <div className="relative w-20 h-24 rounded overflow-hidden shrink-0 bg-surface-container-highest">
                <img className="w-full h-full object-cover" src={product.imageUrl} alt={product.name}/>
              </div>
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider truncate">{product.brand}</span>
                <h2 className="font-title-md text-title-md text-on-surface truncate font-semibold">{product.name}</h2>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="z-10 rounded bg-surface-container-high px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-[16px]">celebration</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wide">Their Goal</span>
                <p className="font-body-sm text-body-sm text-on-surface truncate">For: {shareData.occasion} • Target: ₹{shareData.costPerWear}/wear</p>
              </div>
            </div>

            <div className="z-10 rounded bg-surface-container-highest p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[16px]">help_center</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">Their Hesitation</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface italic">"{shareData.shopperQuestion}"</p>
            </div>
            
            {shareData.consideration && (
              <div className="z-10 rounded bg-secondary-container/15 p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-1">insights</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">AI Diagnostic</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface mt-1">{shareData.consideration}</p>
                </div>
              </div>
            )}
          </div>

          {!hasVoted ? (
            <div className="flex flex-col gap-4 mt-3">
              <h3 className="font-title-md text-title-md text-on-surface">Cast your vote</h3>
              <div className="grid grid-cols-2 gap-3">
                {voteOptions.map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setSelectedVote(opt.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${selectedVote === opt.id ? 'border-primary bg-primary/10' : 'border-surface-container bg-surface-container-low hover:border-surface-container-high'}`}
                  >
                    <span className={`material-symbols-outlined ${opt.color} text-[24px]`}>{opt.icon}</span>
                    <span className="font-label-md text-label-md mt-1 text-on-surface">{opt.id}</span>
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="Add an optional comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-3 text-body-sm text-on-surface focus:border-primary focus:outline-none transition-colors min-h-[80px]"
              />
              <button 
                onClick={handleVote}
                disabled={!selectedVote || isSubmitting}
                className={`w-full py-4 rounded-full font-label-lg font-bold flex justify-center items-center ${selectedVote ? 'bg-primary-container text-on-primary shadow-lg' : 'bg-surface-container-highest text-on-surface-variant'}`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-3">
              <div className="bg-tertiary-container/20 text-tertiary p-4 rounded-lg flex items-center gap-3 border border-tertiary/20">
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
                <span className="font-title-md text-title-md">Your vote has been sent!</span>
              </div>
              
              <div className="bg-surface-container rounded-xl p-4 shadow-md mt-3">
                <h3 className="font-title-md text-title-md text-on-surface mb-3">Live Results ({votes.length})</h3>
                <div className="space-y-3">
                  {votes.map((v, idx) => (
                    <div key={idx} className="bg-surface-container-low p-3 rounded-lg flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-label-sm text-label-sm text-on-surface font-bold">{v.response}</span>
                        {v.comment && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">"{v.comment}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </>
  );
}
