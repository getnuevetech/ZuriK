function normalizeApiUrl(url: string): string {
  if (url.startsWith('/')) return url.replace(/\/+$/, '') || '/api';
  return url.replace(/\/+$/, '');
}

function isLocalhostUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);
}

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const forceProxyInProd = Boolean(
  process.env.NODE_ENV === 'production' && publicApiUrl && isLocalhostUrl(publicApiUrl),
);
const effectiveApiUrl = forceProxyInProd ? '/api' : (publicApiUrl || '/api');
const apiUrl = normalizeApiUrl(effectiveApiUrl);

if (forceProxyInProd) {
  console.warn(
    `[config] NEXT_PUBLIC_API_URL is set to "${publicApiUrl}" (localhost) in production. ` +
    'Falling back to same-origin API proxy (/api). Set API_URL on the frontend server to your backend URL.',
  );
} else if (!publicApiUrl) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[config] NEXT_PUBLIC_API_URL is not set in production. ' +
      'Using same-origin API proxy (/api). Ensure frontend server env API_URL points to your backend.',
    );
  } else {
    console.warn(
      '[config] NEXT_PUBLIC_API_URL is not set. Using same-origin API proxy (/api).',
    );
  }
}

console.log(`[config] API URL resolved to: ${apiUrl}`);

export const config = {
  apiUrl,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
