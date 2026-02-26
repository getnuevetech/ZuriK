'use client';

import React, { useState, useEffect } from 'react';
import { homepageApi } from '../../lib/api';

interface Step {
  step: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

interface HowItWorksStepResponse {
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  ),
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  package: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
};

const FALLBACK_STEPS: Step[] = [
  { step: '01', title: 'Browse', desc: 'Explore thousands of designs and fabrics from across Africa', icon: ICON_MAP.search },
  { step: '02', title: 'Choose', desc: 'Select your design, fabric, and measurements for a perfect fit', icon: ICON_MAP.check },
  { step: '03', title: 'QA Verified', desc: 'Every order is quality-checked by our expert inspectors before shipping', icon: ICON_MAP.shield },
  { step: '04', title: 'Delivered', desc: 'Receive authentic African fashion at your doorstep, anywhere worldwide', icon: ICON_MAP.package },
];

const TRUST_BADGES = [
  {
    label: 'Worldwide Delivery',
    stat: '150+ Countries',
    desc: 'We ship to every corner of the globe',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    label: 'Secure Payments',
    stat: '100% Secure',
    desc: 'Paystack & Stripe encrypted transactions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    label: 'QA Guaranteed',
    stat: '99.9% Satisfaction',
    desc: 'Every item inspected before dispatch',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  const [steps, setSteps] = useState<Step[]>(FALLBACK_STEPS);

  useEffect(() => {
    homepageApi.getHowItWorksSteps()
      .then((data: HowItWorksStepResponse[]) => {
        if (data && data.length > 0) {
          const mapped: Step[] = data.map((s) => {
            const iconStr = typeof s.icon === 'string' ? s.icon : '';
            const knownIcon = ICON_MAP[iconStr];
            const iconNode = knownIcon ?? (
              <span className="text-3xl leading-none">{iconStr}</span>
            );
            return {
              step: String(s.stepNumber).padStart(2, '0'),
              title: s.title,
              desc: s.description,
              icon: iconNode,
            };
          });
          setSteps(mapped);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <section className="py-24 px-4 border-t border-b" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block border text-xs font-medium px-4 py-1.5 rounded-full mb-4" style={{ borderColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}>
            The Process
          </span>
          <h2 id="how-it-works-heading" className="font-heading text-4xl font-bold text-neutral-900 tracking-tight mb-2">
            How It Works
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded" style={{ backgroundColor: 'var(--color-secondary)' }} />
          <p className="text-neutral-500 text-base font-light max-w-xl mx-auto mt-4">
            Your journey from discovery to doorstep — worldwide. Simple, transparent, and delightful.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step) => (
            <div key={step.step} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow" style={{ border: '1px solid var(--color-border)' }}>
              {/* Step number at top-left */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-secondary)' }}>{step.step}</span>
              </div>
              {/* Icon */}
              <div className="mb-4" style={{ color: 'var(--color-primary)' }}>
                {step.icon}
              </div>
              <h3 className="font-heading font-bold text-neutral-900 text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-light">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.label} className="bg-white p-8 text-center rounded-xl shadow-sm" style={{ border: '1px solid var(--color-border)' }}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(30,58,95,0.08)', color: 'var(--color-primary)' }}>
                {badge.icon}
              </div>
              <div className="font-bold text-neutral-900 text-base mb-1">{badge.label}</div>
              <div className="font-bold mb-2" style={{ color: 'var(--color-primary)' }}>{badge.stat}</div>
              <div className="text-xs text-neutral-500 font-light">{badge.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
