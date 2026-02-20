'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

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
    <section className="py-20 px-4 bg-gradient-to-br from-secondary-600 to-accent-700" aria-labelledby="newsletter-heading">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h2 id="newsletter-heading" className="font-heading text-4xl font-bold text-white mb-4">
          Join the African Fashion Movement
        </h2>
        <p className="text-white/80 text-lg mb-10">
          Get exclusive access to new designs, fabrics, and designer collections
        </p>

        {submitted ? (
          <div className="bg-white/20 rounded-2xl px-8 py-6 text-white">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-xl font-semibold">Thanks for subscribing!</p>
            <p className="text-white/80 mt-1">You&apos;re now part of the movement. Watch your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white focus:ring-white/30"
              aria-label="Email address"
            />
            <Button type="submit" variant="ghost" className="bg-white text-accent-700 hover:bg-neutral-100 font-semibold whitespace-nowrap">
              Subscribe
            </Button>
          </form>
        )}

        <p className="text-white/50 text-xs mt-4">No spam, ever. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}
