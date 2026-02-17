import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

// Note: Google Fonts are loaded via CSS in production
// Using system fonts as fallback during build

export const metadata: Metadata = {
  title: 'African Fashion eCommerce - Authentic African Designs',
  description: 'Discover authentic African fashion, fabrics, and accessories from talented designers across the continent. Premium quality, handcrafted pieces celebrating African heritage.',
  keywords: 'African fashion, Ankara, Kente, African designers, traditional wear, African accessories',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Playfair+Display:wght@400..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-sans">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
