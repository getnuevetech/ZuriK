export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>African Fashion</title>
      </head>
      <body>
        <nav style={{ backgroundColor: '#000', color: '#fff', padding: '1rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
            <h1>African Fashion</h1>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
              <a href="/products" style={{ color: '#fff', textDecoration: 'none' }}>Products</a>
              <a href="/fabrics" style={{ color: '#fff', textDecoration: 'none' }}>Fabrics</a>
              <a href="/designers" style={{ color: '#fff', textDecoration: 'none' }}>Designers</a>
            </div>
          </div>
        </nav>
        <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
