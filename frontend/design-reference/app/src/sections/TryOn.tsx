import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: '01',
    title: 'Choose Fabric',
    description: 'Browse our collection of premium African fabrics',
  },
  {
    number: '02',
    title: 'Visualise Design',
    description: 'See how the garment looks on your silhouette',
  },
  {
    number: '03',
    title: 'Place Order',
    description: 'Order with confidence, tailored to your measurements',
  },
];

export default function TryOn() {
  return (
    <section className="py-20 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e07a3d]/20 text-[#e07a3d] text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              New Feature
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              See How It Looks
              <br />
              Before You Buy
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-lg">
              Our Try-On preview lets you visualise any garment on your own body silhouette —
              adjusted to your measurements — before you order. Experience the future of African
              fashion shopping.
            </p>

            {/* Steps */}
            <div className="space-y-6 mb-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 flex items-center justify-center text-white/60 text-sm font-medium">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{step.title}</h4>
                    <p className="text-white/60 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-[#e07a3d] hover:bg-[#c96a33] text-white px-6 py-5 rounded-none text-base font-medium">
                Try It Now
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-6 py-5 rounded-none text-base font-medium bg-transparent"
              >
                Explore Custom Designs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Content - Stats Card */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80"
                alt="Virtual Try-On"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/60 to-transparent" />
            </div>

            {/* Stats Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-[#1a1a1a]/90 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Virtual Try-On</p>
                  <p className="text-white font-semibold">AI-Powered Preview</p>
                </div>
                <div className="text-right">
                  <p className="text-[#e07a3d] text-3xl font-bold">75%</p>
                  <p className="text-white/60 text-sm">Size Match</p>
                </div>
                <div className="text-right">
                  <p className="text-[#e07a3d] text-3xl font-bold">98%</p>
                  <p className="text-white/60 text-sm">Accuracy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
