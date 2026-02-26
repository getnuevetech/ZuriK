import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribing:', email);
    setEmail('');
  };

  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-xl mx-auto text-center"
        >
          <p className="text-sm text-primary font-medium mb-3">Stay Connected</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-4">
            Join the Movement
          </h2>
          <p className="text-white/60 mb-8">
            Exclusive access to new designs, fabrics, and designer collections. Be the first to discover the latest in African fashion.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-background border-border text-white placeholder:text-white/40 rounded-md h-12"
              required
            />
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white rounded-md h-12 px-8"
            >
              Subscribe
            </Button>
          </form>

          <p className="text-xs text-white/40 mt-4">
            No spam, ever. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
