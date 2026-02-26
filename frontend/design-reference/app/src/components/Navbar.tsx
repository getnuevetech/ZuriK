import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, ShoppingBag, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { name: 'Home', href: '#' },
  { 
    name: 'Shop', 
    href: '#',
    dropdown: ['Ready-to-Wear', 'Premium Fabrics', 'Custom Designs']
  },
  { name: 'Designers', href: '#' },
  { name: '3D Try-On', href: '#', badge: 'Soon' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#1a1a1a]/90 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8 text-primary"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="font-serif text-xl font-semibold text-white">
              African Fashion
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <a
                  href={link.href}
                  className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
                >
                  {link.name}
                  {link.dropdown && (
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  )}
                  {link.badge && (
                    <span className="ml-1 px-2 py-0.5 text-[10px] bg-primary text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                </a>
                
                {/* Dropdown */}
                {link.dropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {link.dropdown.map((item) => (
                      <a
                        key={item}
                        href="#"
                        className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/80 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/80 hover:text-white transition-colors hidden sm:block">
              <ShoppingBag className="w-5 h-5" />
            </button>
            <a 
              href="#" 
              className="hidden sm:block text-sm text-white/80 hover:text-white transition-colors"
            >
              Sign in
            </a>
            <Button 
              className="hidden md:inline-flex bg-white text-black hover:bg-white/90 rounded-md"
            >
              Register
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <button className="p-2 text-white">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-card border-border">
                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-2 text-lg text-white/80 hover:text-white transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                      {link.badge && (
                        <span className="px-2 py-0.5 text-[10px] bg-primary text-white rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </a>
                  ))}
                  <hr className="border-border" />
                  <a href="#" className="text-lg text-white/80 hover:text-white">
                    Sign in
                  </a>
                  <Button className="bg-primary text-white hover:bg-primary/90 rounded-md">
                    Register
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
