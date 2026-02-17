import React from 'react';
import Link from 'next/link';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-african-dark text-african-cream">
      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-gold font-serif text-xl mb-4">AFRIQUE Fashion</h3>
            <p className="text-sm text-gray-400 mb-4">
              Connecting authentic African fashion designers with global customers. 
              Celebrating heritage, craftsmanship, and creativity.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                <FiTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/designs" className="text-gray-400 hover:text-gold transition-colors">
                  All Designs
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Traditional Wear" className="text-gray-400 hover:text-gold transition-colors">
                  Traditional Wear
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Contemporary Fashion" className="text-gray-400 hover:text-gold transition-colors">
                  Contemporary Fashion
                </Link>
              </li>
              <li>
                <Link href="/designs?category=Accessories" className="text-gray-400 hover:text-gold transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/fabrics" className="text-gray-400 hover:text-gold transition-colors">
                  Fabrics
                </Link>
              </li>
            </ul>
          </div>

          {/* For Designers */}
          <div>
            <h4 className="font-semibold mb-4">For Designers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/designers/join" className="text-gray-400 hover:text-gold transition-colors">
                  Join as Designer
                </Link>
              </li>
              <li>
                <Link href="/designers" className="text-gray-400 hover:text-gold transition-colors">
                  Designer Directory
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-400 hover:text-gold transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-gray-400 hover:text-gold transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-gold transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-gold transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-400 hover:text-gold transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-gold transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-400 hover:text-gold transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© {currentYear} AFRIQUE Fashion. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gold transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-gold transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
