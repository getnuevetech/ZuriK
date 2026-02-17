'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { mockDesigns } from '@/data/mockDesigns';
import { FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatPrice } from '@/utils/helpers';
import DesignCard from '@/components/designs/DesignCard';

export default function DesignDetailPage() {
  const params = useParams();
  const designId = params.id as string;
  const design = mockDesigns.find((d) => d.id === designId);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!design) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Design not found</h1>
        <Link href="/designs">
          <Button>Back to Designs</Button>
        </Link>
      </div>
    );
  }

  // Related designs from same designer or category
  const relatedDesigns = mockDesigns
    .filter((d) => d.id !== design.id && (d.designer.id === design.designer.id || d.category === design.category))
    .slice(0, 3);

  return (
    <div className="bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gold">Home</Link>
            <span>/</span>
            <Link href="/designs" className="hover:text-gold">Designs</Link>
            <span>/</span>
            <span className="text-african-dark">{design.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-4">
              <img
                src={design.images[selectedImage]}
                alt={design.name}
                className="w-full h-[600px] object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {design.images.length > 1 && (
              <div className="flex gap-2">
                {design.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-1 h-24 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-gold' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${design.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Designer */}
            <Link
              href={`/designers/${design.designer.id}`}
              className="text-gold hover:text-gold-dark font-medium mb-2 inline-block"
            >
              {design.designer.name}
            </Link>

            {/* Title */}
            <h1 className="text-4xl font-serif font-bold text-african-dark mb-4">
              {design.name}
            </h1>

            {/* Rating */}
            {design.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={20}
                      fill={i < Math.round(design.rating!) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {design.rating} ({design.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="text-4xl font-bold text-african-dark mb-6">
              {formatPrice(design.price, design.currency as any)}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="default">{design.category}</Badge>
              <Badge variant="default">{design.country}</Badge>
              {design.fabricType && <Badge variant="gold">{design.fabricType}</Badge>}
              {design.customizable && <Badge variant="success">Customizable</Badge>}
              {design.inStock ? (
                <Badge variant="success">In Stock</Badge>
              ) : (
                <Badge variant="error">Out of Stock</Badge>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-african-dark mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{design.description}</p>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {design.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!design.inStock}
                >
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <FiHeart />
                </Button>
              </div>

              {design.customizable && (
                <p className="text-sm text-gold">
                  ✨ This design can be customized. Contact designer for details.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Related Designs */}
        {relatedDesigns.length > 0 && (
          <div>
            <h2 className="text-3xl font-serif font-bold text-african-dark mb-8">
              Related Designs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedDesigns.map((related) => (
                <DesignCard key={related.id} design={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
