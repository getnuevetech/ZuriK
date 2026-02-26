import { Globe, Shield, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Browse',
    description:
      'Explore designs and fabrics from across Africa. Filter by country, style, or designer to find your perfect piece.',
  },
  {
    number: '02',
    title: 'Choose',
    description:
      'Select your design, fabric, and provide your measurements. Our artisans will craft your garment with precision.',
  },
  {
    number: '03',
    title: 'QA Verified',
    description:
      'Every order undergoes rigorous quality checking before shipping. We ensure perfection in every stitch.',
  },
  {
    number: '04',
    title: 'Delivered',
    description:
      'Receive authentic African fashion at your doorstep, worldwide. Track your order every step of the way.',
  },
];

const stats = [
  {
    icon: Globe,
    value: '150+',
    label: 'Countries',
    description: 'We ship to 150+ countries with reliable tracking and fast delivery times.',
  },
  {
    icon: Shield,
    value: '100%',
    label: 'Secure',
    description: 'Your transactions are protected with bank-level encryption and fraud protection.',
  },
  {
    icon: CheckCircle,
    value: '99.9%',
    label: 'Satisfaction',
    description: 'Every item is inspected before dispatch. Quality you can trust, guaranteed.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[#e07a3d] text-sm uppercase tracking-widest mb-4 block">
            The Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Your journey from discovery to doorstep — worldwide. Simple, transparent, and delightful.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white/5 p-6 h-full">
                <div className="text-4xl font-bold text-white/10 mb-4">{step.number}</div>
                <h3 className="text-white text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
              </div>
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-white/20" />
              )}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 p-6 flex gap-4">
              <div className="flex-shrink-0">
                <stat.icon className="w-8 h-8 text-[#e07a3d]" />
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                  <span className="text-white/60 text-sm">{stat.label}</span>
                </div>
                <p className="text-white/50 text-sm">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
