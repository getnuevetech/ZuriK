'use client';

import { useEffect, useState } from 'react';

export default function Fabrics() {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/fabrics`)
      .then(res => res.json())
      .then(data => {
        setFabrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Fabrics</h2>
      {loading ? (
        <p>Loading fabrics...</p>
      ) : fabrics.length === 0 ? (
        <p>No fabrics available yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {fabrics.map((fabric: any) => (
            <div key={fabric.id} style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{fabric.name}</h3>
              <p style={{ color: '#666' }}>{fabric.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
