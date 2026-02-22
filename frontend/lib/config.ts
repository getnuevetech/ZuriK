const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

if (!process.env.NEXT_PUBLIC_API_URL) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[config] WARNING: NEXT_PUBLIC_API_URL is not set in production. ' +
      'All API requests will target http://localhost:3001, which will fail on deployed environments. ' +
      'Set NEXT_PUBLIC_API_URL to your backend URL (e.g. https://your-api.railway.app) before building.',
    );
  } else {
    console.warn(
      '[config] NEXT_PUBLIC_API_URL is not set. Falling back to http://localhost:3001.',
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
