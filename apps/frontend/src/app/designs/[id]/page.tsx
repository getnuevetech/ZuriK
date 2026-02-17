'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, MapPin, ShoppingCart, Mail, Instagram, Check } from 'lucide-react';
import { Header, Footer } from '@/components/common';
import { Button, Badge } from '@/components/ui';
import { mockDesigns } from '@/data/mockDesigns';
import { CURRENCY_SYMBOL } from '@/utils/constants';

export default function DesignDetailPage() {
  const params = useParams();
  const designId = params.id as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  // Find the design by ID
  const design = mockDesigns.find((d) => d.id === designId);

  if (!design) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-dark mb-4">Design Not Found</h1>
            <p className="text-gray-600 mb-6">The design you're looking for doesn't exist.</p>
            <Link href="/designs">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Designs
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleContactDesigner = () => {
    // TODO: Implement contact designer functionality
    // eslint-disable-next-line no-console
    console.log('Contact designer:', design.designer.email);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <Link
            href="/designs"
            className="inline-flex items-center text-gray-600 hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Designs
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-md">
                <Image
                  src={design.images[selectedImageIndex]}
                  alt={design.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Thumbnail Images */}
              {design.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {design.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden ${
                        selectedImageIndex === index
                          ? 'ring-2 ring-gold'
                          : 'ring-1 ring-cream-dark hover:ring-gold'
                      } transition-all`}
                    >
                      <Image
                        src={image}
                        alt={`${design.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 25vw, 12.5vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Design Details */}
            <div className="space-y-6">
              {/* Title & Category */}
              <div>
                <Badge className="bg-gold text-dark mb-3">{design.category}</Badge>
                <h1 className="text-4xl font-bold text-dark mb-2">{design.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{design.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-gold text-gold" />
                    <span className="font-medium text-dark">{design.rating.toFixed(1)}</span>
                    <span>({design.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="py-4 border-y border-cream-dark">
                <p className="text-4xl font-bold text-dark">
                  {CURRENCY_SYMBOL}
                  {design.price.toFixed(2)}
                </p>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{design.description}</p>
              </div>

              {/* Available Fabrics */}
              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">Compatible Fabrics</h2>
                <div className="flex flex-wrap gap-2">
                  {design.compatibleFabrics.map((fabric) => (
                    <Badge
                      key={fabric.id}
                      className="bg-cream-dark text-dark hover:bg-gold hover:text-white transition-colors cursor-pointer"
                    >
                      {fabric.fabricType}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  This design works best with the fabrics listed above
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-gold hover:bg-gold-dark text-dark font-semibold py-4 text-lg"
                  disabled={addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleContactDesigner}
                  variant="outline"
                  className="w-full py-4 text-lg border-2 border-gold text-dark hover:bg-gold"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Designer
                </Button>
              </div>

              {/* Designer Info Card */}
              <div className="bg-white rounded-lg p-6 border border-cream-dark mt-8">
                <h2 className="text-xl font-semibold text-dark mb-4">About the Designer</h2>
                <div className="flex items-start gap-4">
                  {/* Designer Avatar */}
                  {design.designer.avatar ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={design.designer.avatar}
                        alt={`${design.designer.firstName} ${design.designer.lastName}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-accent flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {design.designer.firstName[0]}
                      {design.designer.lastName[0]}
                    </div>
                  )}

                  {/* Designer Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark text-lg">
                      {design.designer.firstName} {design.designer.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{design.designer.country}</span>
                    </div>
                    {design.designer.bio && (
                      <p className="text-gray-700 text-sm mb-3">{design.designer.bio}</p>
                    )}
                    {design.designer.instagramHandle && (
                      <a
                        href={`https://instagram.com/${design.designer.instagramHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-dark transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                        {design.designer.instagramHandle}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
