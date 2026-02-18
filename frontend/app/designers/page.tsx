'use client';

import { useEffect, useState } from 'react';

export default function Designers() {
  const [designers, setDesigners] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/designers`)
      .then(res => res.json())
      .then(data => setDesigners(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12">
      <h2 className="text-4xl font-bold mb-8">Designers</h2>
      {designers.length === 0 ? (
        <p className="text-gray-600">Loading designers...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {designers.map((designer: any) => (
            <div key={designer.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-xl">{designer.name}</h3>
              <p className="text-gray-600">{designer.bio}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
