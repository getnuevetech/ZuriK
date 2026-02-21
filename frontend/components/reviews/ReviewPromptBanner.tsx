'use client';

import React, { useState } from 'react';
import { reviewPromptsApi, type ReviewPrompt } from '../../lib/api';

interface ReviewPromptBannerProps {
  prompt: ReviewPrompt;
  onDismiss?: () => void;
}

export function ReviewPromptBanner({ prompt, onDismiss }: ReviewPromptBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (dismissed) return null;

  const handleDismiss = async () => {
    setLoading(true);
    try {
      await reviewPromptsApi.dismiss(prompt.id);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setDismissed(true);
      onDismiss?.();
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-amber-500 text-lg">⭐</span>
        <span className="text-amber-900 font-medium">
          You recently purchased this! Share your experience.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={`#reviews`}
          className="rounded-lg bg-amber-500 px-3 py-1 text-white font-semibold hover:bg-amber-600 transition-colors"
        >
          Write a Review
        </a>
        <button
          onClick={handleDismiss}
          disabled={loading}
          aria-label="Dismiss"
          className="text-amber-400 hover:text-amber-600 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
