"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmScreen() {
  const router = useRouter();

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-center">
          <span className="font-headline-md text-headline-md tracking-tighter uppercase font-bold text-on-surface">MATCH CHECK</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-32 pb-24 bg-surface min-h-screen items-center px-6">
        
        <div className="w-24 h-24 rounded-full bg-[#1A1A1D] border border-[#26262B] flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[#9A9A9F] text-[48px]">check_circle</span>
        </div>

        <h1 className="font-headline-lg-mobile text-[32px] text-on-surface font-bold text-center tracking-tight leading-tight">
          Item added to your bag
        </h1>
        
        <p className="font-body-lg text-[18px] text-on-surface-variant text-center mt-4 max-w-sm leading-relaxed">
          You made an informed decision. The item is waiting for you in your bag when you're ready to checkout.
        </p>

        <div className="w-full max-w-sm mt-12 space-y-4">
          <button 
            onClick={() => router.push('/')}
            className="w-full py-4 rounded-full bg-[#FF3E6C] text-white font-title-md font-bold text-[16px] flex items-center justify-center shadow-[0_0_24px_-2px_rgba(255,62,108,0.4)] active:scale-[0.98] transition-transform"
          >
            Continue Shopping
          </button>
          
          <button 
            onClick={() => window.open('https://www.myntra.com/checkout/cart', '_blank')}
            className="w-full py-4 rounded-full bg-surface-container text-on-surface font-title-md font-bold text-[16px] flex items-center justify-center border border-white/5 active:scale-[0.98] transition-transform"
          >
            Go to Bag
          </button>
        </div>

      </main>
    </>
  );
}
