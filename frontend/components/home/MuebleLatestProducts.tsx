'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { readyToWearApi } from '../../lib/api';

const DEMO_PRODUCTS = [
  { id: 'p1', name: 'Kente Gown', category: 'Dresses', price: 450, image: '', isNew: false },
  { id: 'p2', name: 'Ankara Set', category: 'Dresses', price: 295, image: '', isNew: true },
  { id: 'p3', name: 'Royal Dashiki', category: 'Dresses', price: 180, image: '', isNew: false },
  { id: 'p4', name: 'Emerald Caftan', category: 'Dresses', price: 380, image: '', isNew: false },
  { id: 'p5', name: 'Kitenge Fabric', category: 'Fabrics', price: 85, image: '', isNew: false },
  { id: 'p6', name: 'Headwrap Set', category: 'Accessories', price: 120, image: '', isNew: true },
  { id: 'p7', name: 'Boubou Gown', category: 'Dresses', price: 520, image: '', isNew: false },
  { id: 'p8', name: 'Wax Print Bundle', category: 'Fabrics', price: 150, image: '', isNew: false },
];

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  isNew: boolean;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group bg-white">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {product.category === 'Fabrics' ? '🧵' : product.category === 'Accessories' ? '👒' : '👗'}
          </div>
        )}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-[#ff5722] text-white text-xs px-2 py-1">NEW</span>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs uppercase tracking-wider text-gray-500">{product.category}</span>
        <h3 className="text-lg font-semibold text-[#1a237e] mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
          {product.name}
        </h3>
        <p className="text-gray-500 mt-1">${product.price}.00 USD</p>
        <Link href={`/products`} className="inline-block mt-3 bg-[#00c853] hover:bg-[#00b248] text-white text-sm px-4 py-2 transition-colors">
          View more
        </Link>
      </div>
    </div>
  );
}

export function MuebleLatestProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    readyToWearApi.featured()
      .then((data) => {
        if (data && data.length > 0) {
          setProducts(data.slice(0, 8).map((p: { id: string; name: string; customerPrice: number; images?: string[]; category?: string; isNew?: boolean }) => ({
            id: p.id,
            name: p.name,
            category: p.category || 'Dresses',
            price: p.customerPrice,
            image: p.images?.[0] || '',
            isNew: p.isNew || false,
          })));
        } else {
          setProducts(DEMO_PRODUCTS);
        }
      })
      .catch(() => setProducts(DEMO_PRODUCTS));
  }, []);

  const displayProducts = products.length > 0 ? products : DEMO_PRODUCTS;

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a237e]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Latest products added
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/products" className="inline-block text-[#1a237e] hover:text-[#00c853] transition-colors underline underline-offset-4">
            view all products
          </Link>
        </div>
      </div>
    </section>
  );
}
