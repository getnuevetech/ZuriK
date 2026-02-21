'use client';

import React from 'react';

const STEPS = [
  {
    step: '01',
    title: 'Browse',
    desc: 'Explore designs and fabrics from across Africa',
  },
  {
    step: '02',
    title: 'Choose',
    desc: 'Select your design, fabric, and measurements',
  },
  {
    step: '03',
    title: 'QA Verified',
    desc: 'Every order is quality-checked before shipping',
  },
  {
    step: '04',
    title: 'Delivered',
    desc: 'Receive authentic African fashion at your doorstep, worldwide',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-neutral-50" aria-labelledby="how-it-works-heading">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-3">The Process</p>
          <h2 id="how-it-works-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-neutral-500 text-base font-light">Your journey from discovery to doorstep — worldwide</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-neutral-200 z-0" />

          {STEPS.map((step, i) => (
            <div key={step.step} className="relative flex flex-col items-center text-center z-10">
              {/* Step number circle */}
              <div className="w-14 h-14 bg-white border border-neutral-200 flex items-center justify-center mb-6">
                <span className="text-sm font-bold text-neutral-900 tracking-wider">{step.step}</span>
              </div>

              {/* Arrow between steps (mobile vertical) */}
              {i < STEPS.length - 1 && (
                <div className="lg:hidden text-neutral-300 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}

              <h3 className="font-heading font-semibold text-neutral-900 text-base mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-light">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-px bg-neutral-200">
          {[
            { label: 'Worldwide Delivery', desc: 'We ship to 150+ countries' },
            { label: 'Secure Payments', desc: 'Your transactions are protected' },
            { label: 'QA Guaranteed', desc: 'Every item inspected before dispatch' },
          ].map((signal) => (
            <div key={signal.label} className="flex flex-col items-center text-center p-8 bg-white">
              <div className="font-semibold text-neutral-900 text-sm mb-1">{signal.label}</div>
              <div className="text-xs text-neutral-500 font-light">{signal.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
