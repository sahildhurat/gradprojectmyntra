"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProgress, ProgressState } from '../../lib/progress';
import { products } from '../../data/products';

export default function ConfirmScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressState>({ checkedProducts: [], resolvedProducts: [], removedProducts: [] });

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const totalDecisions = progress.checkedProducts.length;
  const boughtCount = progress.resolvedProducts.length;
  const removedCount = progress.removedProducts.length;
  const keptCount = totalDecisions - boughtCount - removedCount;

  const evaluatedProducts = progress.checkedProducts.map(id => {
    const p = products.find(prod => prod.id === id);
    if (!p) return null;
    let status = 'Kept for later';
    if (progress.resolvedProducts.includes(id)) status = 'Bought';
    else if (progress.removedProducts.includes(id)) status = 'Removed';
    return { ...p, status };
  }).filter(Boolean) as any[];

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#e5e5e7] flex flex-col items-center justify-start p-6 md:p-12 antialiased selection:bg-neutral-800">
      {/* Outer Container */}
      <main className="w-full max-w-[430px] mx-auto flex flex-col gap-8 min-h-screen">

        {/* Top Navigation / Context Header */}
        <header className="flex items-center justify-between pt-2 pb-1 border-b border-neutral-800/60">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-400">MATCH CHECK</span>
          </div>
        </header>

        {/* Main Title & Context */}
        <section className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-100">
            You closed {totalDecisions} {totalDecisions === 1 ? 'decision' : 'decisions'}
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 font-normal leading-relaxed">
            A factual log of completed evaluations for this session, including items deliberately set aside.
          </p>
        </section>

        {/* Stat Blocks Row */}
        <section className="grid grid-cols-3 gap-3" aria-label="Decision statistics">
          {/* Stat 1: Bought */}
          <div className="bg-[#141417] border border-neutral-800/80 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-100">{boughtCount}</span>
            <span className="text-xs text-neutral-400 font-medium tracking-wide">Bought</span>
          </div>

          {/* Stat 2: Removed */}
          <div className="bg-[#141417] border border-neutral-800/80 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-100">{removedCount}</span>
            <span className="text-xs text-neutral-400 font-medium tracking-wide">Removed</span>
          </div>

          {/* Stat 3: Kept for later */}
          <div className="bg-[#141417] border border-neutral-800/80 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-100">{keptCount >= 0 ? keptCount : 0}</span>
            <span className="text-xs text-neutral-400 font-medium tracking-wide leading-tight">Kept for later</span>
          </div>
        </section>

        {/* Items Acted On Section */}
        {evaluatedProducts.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs uppercase font-medium tracking-wider text-neutral-400">Evaluated Items</h2>
              <span className="text-xs text-neutral-400 font-mono">{evaluatedProducts.length} {evaluatedProducts.length === 1 ? 'item' : 'items'}</span>
            </div>

            <div className="bg-[#131316] border border-neutral-800/80 rounded-2xl divide-y divide-neutral-800/70 overflow-hidden shadow-sm">
              {evaluatedProducts.map((p, idx) => (
                <article key={idx} className="p-3.5 md:p-4 flex items-center justify-between gap-3 hover:bg-neutral-800/20 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img src={p.imageUrl} alt={p.name} className="w-12 h-14 object-cover rounded-lg bg-neutral-900 flex-shrink-0 border border-neutral-800/70" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium truncate">{p.brand}</span>
                      <span className="text-sm font-medium text-neutral-200 truncate">{p.name}</span>
                      <span className="text-xs text-neutral-400">₹{p.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-800/90 text-neutral-300 border border-neutral-700/50">
                    {p.status}
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Actions & Audit Line */}
        <footer className="flex flex-col items-center gap-3 pt-4 pb-8 mt-auto">
          <button onClick={() => router.push('/')} className="w-full py-3.5 px-6 rounded-xl border border-neutral-600/80 hover:border-neutral-400 text-neutral-200 text-sm font-medium tracking-normal transition-all hover:bg-neutral-800/30 active:scale-[0.99] flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"></path>
            </svg>
            Back to wishlist
          </button>

          <div className="flex items-center gap-2 text-xs text-neutral-400 font-normal">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
            <span className="">All items checked.</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
