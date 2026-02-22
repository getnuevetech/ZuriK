import { config } from './config';

export const SITE_NAME = 'African Fashion E-Commerce';
export const SITE_URL = config.appUrl;

export function getShareUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function getShareText(title: string, description?: string): string {
  const text = description ? `${title} - ${description}` : title;
  return `Check out ${text} on ${SITE_NAME}!`;
}

export interface ShareLinks {
  whatsapp: string;
  twitter: string;
  facebook: string;
  pinterest: string;
  email: string;
}

export function generateShareLinks(
  url: string,
  title: string,
  description?: string,
  image?: string,
): ShareLinks {
  const text = getShareText(title, description);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(image || '')}&description=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%20${encodedUrl}`,
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers — document.execCommand is deprecated but still
    // works in environments that don't support navigator.clipboard (e.g. HTTP pages)
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  }
}

export async function nativeShare(data: { title: string; text: string; url: string }): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch {
      return false; // User cancelled or error
    }
  }
  return false;
}
