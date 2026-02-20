export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  mediaType: string;
  mediaUrl: string;
  mobileMediaUrl?: string;
  sortOrder: number;
  isActive: boolean;
  textColor?: string;
  overlayOpacity?: number;
}
