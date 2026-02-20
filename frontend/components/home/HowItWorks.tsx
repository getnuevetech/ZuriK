'use client';

import React from 'react';

const STEPS = [
  {
    step: '01',
    title: 'Browse',
    desc: 'Explore designs and fabrics from across Africa',
    icon: '🔍',
  },
  {
    step: '02',
    title: 'Choose',
    desc: 'Select your design, fabric, and measurements',
    icon: '✂️',
  },
  {
    step: '03',
    title: 'QA Verified',
    desc: 'Every order is quality-checked before shipping',
    icon: '✅',
  },
  {
    step: '04',
    title: 'Delivered',
    desc: 'Receive authentic African fashion at your doorstep, worldwide',
    icon: '📦',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-white" aria-labelledby="how-it-works-heading">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 id="how-it-works-heading" className="font-heading text-4xl font-bold text-neutral-900 mb-4">
            How It Works
          </h2>
          <p className="text-neutral-500 text-lg">Your journey from discovery to doorstep — worldwide</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-secondary-300 to-accent-300 z-0" />

          {STEPS.map((step, i) => (
            <div key={step.step} className="relative flex flex-col items-center text-center z-10">
              {/* Step circle */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl mb-4 shadow-md ring-4 ring-white">
                {step.icon}
              </div>

              {/* Arrow between steps (mobile vertical) */}
              {i < STEPS.length - 1 && (
                <div className="lg:hidden text-2xl text-neutral-300 mb-4">↓</div>
              )}

              <div className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">{step.step}</div>
              <h3 className="font-heading font-bold text-neutral-900 text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🌍', label: 'Worldwide Delivery', desc: 'We ship to 150+ countries' },
            { icon: '🔒', label: 'Secure Payments', desc: 'Your transactions are protected' },
            { icon: '⭐', label: 'QA Guaranteed', desc: 'Every item inspected before dispatch' },
          ].map((signal) => (
            <div key={signal.label} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span className="text-2xl">{signal.icon}</span>
              <div>
                <div className="font-semibold text-neutral-800 text-sm">{signal.label}</div>
                <div className="text-xs text-neutral-500">{signal.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
