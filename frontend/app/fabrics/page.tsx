'use client';

import { useEffect, useState } from 'react';

export default function Fabrics() {
  const [fabrics, setFabrics] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/fabrics`)
      .then(res => res.json())
      .then(data => setFabrics(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12">
      <h2 className="text-4xl font-bold mb-8">Fabrics</h2>
      {fabrics.length === 0 ? (
        <p className="text-gray-600">Loading fabrics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fabrics.map((fabric: any) => (
            <div key={fabric.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">{fabric.name}</h3>
              <p className="text-gray-600">{fabric.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
