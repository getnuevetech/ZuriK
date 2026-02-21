import { Metadata } from 'next';
import { SITE_NAME } from '../../lib/share-utils';

interface SocialMetaProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'product' | 'article' | 'website';
}

/**
 * Generates Next.js Metadata object with Open Graph and Twitter Card tags.
 * Use this with `generateMetadata` in server components or layout files.
 */
export function buildSocialMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
}: SocialMetaProps): Metadata {
  const ogType = type === 'product' ? 'product' : type === 'article' ? 'article' : 'website';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: ogType as 'website' | 'article',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export type { SocialMetaProps };
