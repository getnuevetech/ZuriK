function normalizeApiUrl(url: string): string {
  if (url.startsWith('/')) return url.replace(/\/+$/, '') || '/api';
  return url.replace(/\/+$/, '');
}

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const apiUrl = normalizeApiUrl(publicApiUrl || '/api');

if (!publicApiUrl) {
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
} else if (
  process.env.NODE_ENV === 'production' &&
  /^https?:\/\/localhost(:\d+)?/.test(apiUrl)
) {
  console.warn(
    `[config] WARNING: NEXT_PUBLIC_API_URL is set to "${apiUrl}" which points to localhost. ` +
    'This will fail in production. Set NEXT_PUBLIC_API_URL to your deployed backend URL.',
  );
}

console.log(`[config] API URL resolved to: ${apiUrl}`);

export const config = {
  apiUrl,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
