import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair' 
});

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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
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
