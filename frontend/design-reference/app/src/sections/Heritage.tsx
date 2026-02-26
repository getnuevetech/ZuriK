import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fabrics = [
  { name: 'Kente', country: 'Ghana' },
  { name: 'Ankara', country: 'Nigeria' },
  { name: 'Kitenge', country: 'Tanzania' },
  { name: 'Shweshwe', country: 'South Africa' },
];

export function Heritage() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <p className="text-sm text-primary font-medium mb-3">Our Heritage</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight">
              The Story Behind<br />the Stitch
            </h2>
            
            <div className="space-y-4 text-white/70 mb-8">
              <p>
                Each fabric tells a story. Each pattern carries meaning. From the royal{' '}
                <span className="text-primary font-medium">Kente of Ghana</span> to the indigo{' '}
                <span className="text-primary font-medium">Adire of Nigeria</span> — discover the heritage woven into every thread.
              </p>
              <p>
                African fashion is not just clothing — it is identity, history, and pride. Every stitch connects generations, every colour carries tradition. When you wear African fashion, you wear a story.
              </p>
            </div>

            <Button
              className="bg-primary hover:bg-primary/90 text-white rounded-md group mb-8"
            >
              Explore Our Heritage
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>

            {/* Fabric Tags */}
            <div className="flex flex-wrap gap-3">
              {fabrics.map((fabric, index) => (
                <motion.div
                  key={fabric.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.3 + index * 0.05,
                    ease: [0.4, 0, 0.2, 1] 
                  }}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border sharp-corners text-sm text-white hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                    <span className="text-primary font-medium">{fabric.name}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/60">{fabric.country}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden sharp-corners">
              <img
                src="/images/country-ghana.jpg"
                alt="African Heritage"
                className="w-full h-full object-cover sharp-corners"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
            </div>
            
            {/* Decorative Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 sharp-corners"
            />
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-4 -left-4 w-12 h-12 border-2 border-primary/30 sharp-corners"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
