function normalizeApiUrl(url: string): string {
  if (url.startsWith('/')) return url.replace(/\/+$/, '') || '/api';
  return url.replace(/\/+$/, '');
}

function isLocalhostUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);
}

function isAbsoluteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function isInsecureRemoteHttpUrl(url: string): boolean {
  return /^http:\/\//i.test(url) && !isLocalhostUrl(url);
}

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const directApiRequested = process.env.NEXT_PUBLIC_USE_DIRECT_API === 'true';
const isProduction = process.env.NODE_ENV === 'production';
const canUseDirectApi = Boolean(
  directApiRequested &&
    publicApiUrl &&
    isAbsoluteHttpUrl(publicApiUrl) &&
    !(isProduction && (isLocalhostUrl(publicApiUrl) || isInsecureRemoteHttpUrl(publicApiUrl))),
);
const effectiveApiUrl = canUseDirectApi && publicApiUrl ? publicApiUrl : '/api';
const apiUrl = normalizeApiUrl(effectiveApiUrl);

if (canUseDirectApi) {
  console.warn(
    `[config] Using direct API URL "${apiUrl}" (NEXT_PUBLIC_USE_DIRECT_API=true). ` +
    'Ensure backend CORS allows this frontend origin.',
  );
} else if (directApiRequested && publicApiUrl && !isAbsoluteHttpUrl(publicApiUrl)) {
  console.warn(
    `[config] NEXT_PUBLIC_API_URL="${publicApiUrl}" is not an absolute http(s) URL. ` +
    'Falling back to same-origin API proxy (/api).',
  );
} else if (directApiRequested && publicApiUrl && isProduction && isLocalhostUrl(publicApiUrl)) {
  console.warn(
    `[config] NEXT_PUBLIC_API_URL="${publicApiUrl}" points to localhost in production. ` +
    'Falling back to same-origin API proxy (/api).',
  );
} else if (
  directApiRequested &&
  publicApiUrl &&
  isProduction &&
  isInsecureRemoteHttpUrl(publicApiUrl)
) {
  console.warn(
    `[config] NEXT_PUBLIC_API_URL="${publicApiUrl}" uses insecure HTTP in production. ` +
    'Falling back to same-origin API proxy (/api).',
  );
} else if (!publicApiUrl) {
  if (isProduction) {
    console.warn(
      '[config] NEXT_PUBLIC_API_URL is not set in production. ' +
      'Using same-origin API proxy (/api). Ensure frontend server env API_URL points to your backend.',
    );
  } else {
    console.warn(
      '[config] NEXT_PUBLIC_API_URL is not set. Using same-origin API proxy (/api).',
    );
  }
} else if (!directApiRequested) {
  console.warn(
    `[config] NEXT_PUBLIC_API_URL is set to "${publicApiUrl}" but proxy mode is enabled. ` +
    'Using same-origin API proxy (/api). Set NEXT_PUBLIC_USE_DIRECT_API=true to opt into direct browser calls.',
  );
}

console.log(`[config] API URL resolved to: ${apiUrl}`);

export const config = {
  apiUrl,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
