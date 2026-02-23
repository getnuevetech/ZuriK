'use client';

import React, { useState } from 'react';
import { newsletterApi } from '../../lib/api';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await newsletterApi.subscribe(email.trim(), 'homepage');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="flex-1 border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 px-5 py-3.5 text-sm focus:outline-none focus:border-[#C97B3A] transition-colors rounded-full disabled:opacity-60"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 text-sm font-semibold text-white transition-colors whitespace-nowrap rounded-full hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#C97B3A' }}
                >
                  {loading ? 'Subscribing…' : 'Subscribe →'}
                </button>
              </form>
              {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            </>
          )}

          <p className="text-neutral-400 text-xs mt-6 font-light">No spam, ever. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  );
}
