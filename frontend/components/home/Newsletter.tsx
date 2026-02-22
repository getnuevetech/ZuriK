'use client';

import React, { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('newsletter_emails') || '[]') as string[];
      if (!existing.includes(email.trim())) {
        existing.push(email.trim());
        localStorage.setItem('newsletter_emails', JSON.stringify(existing));
      }
    } catch {
      // ignore localStorage errors
    }
    setSubmitted(true);
  };

  return (
    <section className="py-24 px-4" style={{ backgroundColor: '#F9F6F2' }} aria-labelledby="newsletter-heading">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          {/* Logo/icon */}
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl" style={{ backgroundColor: '#C97B3A1a' }}>
            <span style={{ color: '#C97B3A' }}>✦</span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#C97B3A' }}>Stay Connected</p>
          <h2 id="newsletter-heading" className="font-heading text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
            Join the Movement
          </h2>
          <p className="text-neutral-500 text-base font-light mb-10 max-w-sm mx-auto">
            Exclusive access to new designs, fabrics, and designer collections — delivered to your inbox.
          </p>

          {submitted ? (
            <div className="border border-neutral-200 px-8 py-8 rounded-xl">
              <p className="text-lg font-semibold mb-1 text-neutral-900">Thanks for subscribing! 🎉</p>
              <p className="text-neutral-500 text-sm font-light">Watch your inbox for curated African fashion.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 px-5 py-3.5 text-sm focus:outline-none focus:border-[#C97B3A] transition-colors rounded-full"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-8 py-3.5 text-sm font-semibold text-white transition-colors whitespace-nowrap rounded-full hover:opacity-90"
                style={{ backgroundColor: '#C97B3A' }}
              >
                Subscribe →
              </button>
            </form>
          )}

          <p className="text-neutral-400 text-xs mt-6 font-light">No spam, ever. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  );
}
