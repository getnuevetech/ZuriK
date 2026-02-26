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
    <section className="py-24 px-4" style={{ backgroundColor: '#eee6da' }} aria-labelledby="newsletter-heading">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--color-secondary)' }}>Stay Connected</p>
        <h2 id="newsletter-heading" className="font-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)] tracking-tight mb-3">
          Join the Movement
        </h2>
        <p className="text-[var(--color-text-muted)] text-base font-light mb-8 max-w-sm mx-auto">
          Exclusive access to new designs, fabrics, and designer collections — delivered to your inbox.
        </p>

        {submitted ? (
          <div className="mueble-card px-8 py-8 rounded-xl">
            <p className="text-lg font-semibold mb-1 text-[var(--color-primary-dark)]">Thanks for subscribing! 🎉</p>
            <p className="text-[var(--color-text-muted)] text-sm font-light">Watch your inbox for curated African fashion.</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto rounded-xl overflow-hidden border border-[var(--color-border)] shadow-[0_8px_24px_rgba(34,23,12,0.08)]">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="flex-1 bg-white text-neutral-900 placeholder:text-neutral-400 px-5 py-3.5 text-sm focus:outline-none rounded-l-xl disabled:opacity-60"
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 text-sm font-semibold transition-opacity whitespace-nowrap rounded-r-xl hover:opacity-90 disabled:opacity-60 uppercase tracking-[0.18em]"
                style={{ backgroundColor: 'var(--color-primary-dark)', color: '#fff' }}
              >
                {loading ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </>
        )}

        <p className="text-[var(--color-text-muted)] text-xs mt-6 font-light">No spam, ever. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}
