'use client';

import { useEffect, useState } from 'react';

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12">
      <h2 className="text-4xl font-bold mb-8">Products</h2>
      {products.length === 0 ? (
        <p className="text-gray-600">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-gray-600">${product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
