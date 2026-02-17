import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-gold via-accent to-gold-dark py-20 md:py-32 overflow-hidden">
      {/* African Pattern Background Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.1) 35px, rgba(0,0,0,.1) 70px)`,
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Discover African Fashion
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
            Connect with talented African designers and explore authentic designs that celebrate our
            rich heritage and contemporary style.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/designs">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto shadow-xl hover:shadow-2xl"
              >
                Explore Designs
              </Button>
            </Link>
            <Link href="/auth/register?role=designer">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-dark shadow-xl"
              >
                Join as Designer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
    </section>
  );
};

export default Hero;
