import React from 'react';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import { getCountryFlag } from '@/utils/helpers';

interface Testimonial {
  id: string;
  name: string;
  country: string;
  photo: string;
  rating: number;
  review: string;
}

const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Chioma Adebayo',
    country: 'United States',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    rating: 5,
    review: 'I absolutely love the quality and authenticity of the designs! The connection to African culture through these beautiful pieces is incredible. My Ankara dress arrived perfectly tailored and the fabric quality exceeded my expectations.',
  },
  {
    id: 't2',
    name: 'Marcus Johnson',
    country: 'United Kingdom',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 5,
    review: 'As someone interested in African fashion, this platform has been a game-changer. I can directly support talented designers and get unique pieces that tell a story. The customer service is outstanding!',
  },
  {
    id: 't3',
    name: 'Fatima Hassan',
    country: 'Canada',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    rating: 5,
    review: 'The variety of designs from different African countries is amazing! I&apos;ve purchased several pieces for special occasions and always receive compliments. The platform makes it easy to find exactly what I&apos;m looking for.',
  },
  {
    id: 't4',
    name: 'David Mensah',
    country: 'Ghana',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    rating: 5,
    review: 'Being able to connect with designers from my home country and across Africa is wonderful. The designs are modern yet traditional, and the quality is consistently excellent. Highly recommend this platform!',
  },
];

const TestimonialSection: React.FC = () => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 justify-center mb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`text-xl ${
              index < rating ? 'text-gold' : 'text-cream-dark'
            }`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-dark mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-dark-lighter max-w-2xl mx-auto">
            Join thousands of satisfied customers celebrating African fashion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} padding="lg" className="flex flex-col">
              <div className="text-center mb-4">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image
                    src={testimonial.photo}
                    alt={testimonial.name}
                    fill
                    className="object-cover rounded-full border-2 border-gold"
                    sizes="80px"
                  />
                </div>
                
                <h3 className="font-semibold text-lg text-dark mb-1">
                  {testimonial.name}
                </h3>
                
                <p className="text-sm text-dark-lighter mb-2">
                  {getCountryFlag(testimonial.country)} {testimonial.country}
                </p>
              </div>

              {renderStars(testimonial.rating)}

              <p className="text-sm text-dark-lighter leading-relaxed text-center">
                &ldquo;{testimonial.review}&rdquo;
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 text-dark-lighter">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-1">500+</div>
              <div className="text-sm">Happy Customers</div>
            </div>
            <div className="w-px h-12 bg-cream-dark"></div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold mb-1">4.9</div>
              <div className="text-sm">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-cream-dark"></div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-1">50+</div>
              <div className="text-sm">Designers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
