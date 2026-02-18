'use client';

import { useEffect, useState } from 'react';

export default function Designers() {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/designers`)
      .then(res => res.json())
      .then(data => {
        setDesigners(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Designers</h2>
      {loading ? (
        <p>Loading designers...</p>
      ) : designers.length === 0 ? (
        <p>No designers available yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {designers.map((designer: any) => (
            <div key={designer.id} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{designer.name}</h3>
              <p style={{ color: '#666' }}>{designer.bio}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
