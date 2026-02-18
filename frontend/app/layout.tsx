import './globals.css';

export const metadata = {
  title: 'African Fashion',
  description: 'Premium African Fashion Ecommerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-black text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between">
            <h1 className="text-2xl font-bold">African Fashion</h1>
            <div className="space-x-4">
              <a href="/" className="hover:text-gray-300">Home</a>
              <a href="/products" className="hover:text-gray-300">Products</a>
              <a href="/fabrics" className="hover:text-gray-300">Fabrics</a>
              <a href="/designers" className="hover:text-gray-300">Designers</a>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
