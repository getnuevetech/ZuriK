if (
  process.env.NODE_ENV === 'development' &&
  !process.env.NEXT_PUBLIC_API_URL
) {
  console.warn(
    '[config] NEXT_PUBLIC_API_URL is not set. Falling back to http://localhost:3001.',
  );
}

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
