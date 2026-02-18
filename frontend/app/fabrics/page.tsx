'use client';

import { useEffect, useState } from 'react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
      <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '2rem' }}>Products</h2>
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products available yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {products.map((product: any) => (
            <div key={product.id} style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{product.name}</h3>
              <p style={{ color: '#666' }}>{product.description}</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>${product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
