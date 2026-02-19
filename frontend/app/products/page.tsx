'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = (product: any) => {
    const existingCart = localStorage.getItem('cart');
    const cart = existingCart ? JSON.parse(existingCart) : [];
    
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        quantity: 1,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
    window.dispatchEvent(new Event('storage'));
  };

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
              <div style={{ width: '100%', height: '150px', backgroundColor: '#f0f0f0', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '2rem' }}>📦</p>
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem', minHeight: '40px' }}>{product.description}</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d97706', marginBottom: '1rem' }}>${product.price}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={() => router.push(`/products/${product.id}`)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#e5e7eb',
                    color: '#000',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  View
                </button>
                <button
                  onClick={() => handleAddToCart(product)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: addedId === product.id ? '#10b981' : '#d97706',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  {addedId === product.id ? '✓' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}