import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'African Fashion eCommerce - Discover Authentic African Designs',
  description: 'Connect with African fashion designers and discover unique, authentic designs from across the continent. Premium fabrics, custom measurements, global shipping.',
  keywords: ['African fashion', 'African designers', 'Ankara', 'Kente', 'African clothing', 'ethnic fashion'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-cream">
        {children}
      </body>
    </html>
  );
}
