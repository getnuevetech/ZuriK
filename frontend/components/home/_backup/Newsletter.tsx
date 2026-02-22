'use client';

import React, { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // MVP: store in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('newsletter_emails') || '[]') as string[];
      if (!existing.includes(email.trim())) {
        existing.push(email.trim());
        localStorage.setItem('newsletter_emails', JSON.stringify(existing));
      }
    } catch {}
    setSubmitted(true);
  };

  return (
    <section className="py-32 px-4 bg-neutral-900" aria-labelledby="newsletter-heading">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-semibold text-secondary-400 uppercase tracking-[0.2em] mb-6">Stay Connected</p>
        <h2 id="newsletter-heading" className="font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
          Join the Movement
        </h2>
        <p className="text-white/50 text-base font-light mb-12 max-w-sm mx-auto">
          Exclusive access to new designs, fabrics, and designer collections
        </p>

        {submitted ? (
          <div className="border border-white/20 px-8 py-8 text-white">
            <p className="text-lg font-semibold mb-1">Thanks for subscribing.</p>
            <p className="text-white/50 text-sm font-light">Watch your inbox for curated African fashion.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-transparent border border-white/20 text-white placeholder:text-white/30 px-5 py-3.5 text-sm focus:outline-none focus:border-white/60 transition-colors"
              aria-label="Email address"
            />
            <button
              type="submit"
              className="bg-white text-neutral-900 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest hover:bg-neutral-100 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-white/25 text-xs mt-6 font-light">No spam, ever. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}
