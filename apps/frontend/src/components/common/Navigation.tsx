'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Home,
  ShoppingBag,
  Users,
  Info,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
  user?: {
    name: string;
    role: 'customer' | 'designer' | 'admin';
    avatar?: string;
  } | null;
}

export default function Navigation({
  isOpen,
  onClose,
  isAuthenticated = false,
  user = null,
}: NavigationProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-[#C41E3A] text-white';
      case 'designer':
        return 'bg-[#D4AF37] text-[#1a1a1a]';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    // eslint-disable-next-line no-console
    console.log('Logging out...');
    onClose();
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/designs', label: 'Designs', icon: ShoppingBag },
    { href: '/designers', label: 'Designers', icon: Users },
    { href: '/about', label: 'About', icon: Info },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#D4AF37] to-[#C41E3A]">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#D4AF37] font-bold text-xl">AF</span>
              </div>
              <span className="text-xl font-bold text-white">Menu</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* User Section */}
          {isAuthenticated && user && (
            <div className="p-6 bg-[#F5F1E8] border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C41E3A] flex items-center justify-center text-white font-semibold text-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a1a]">{user.name}</p>
                  <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-[#1a1a1a] hover:bg-[#F5F1E8] hover:text-[#D4AF37] transition-colors group"
                  >
                    <Icon className="w-5 h-5 group-hover:text-[#D4AF37]" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}

              {isAuthenticated && user && (
                <>
                  <div className="my-4 border-t border-gray-200"></div>
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-[#1a1a1a] hover:bg-[#F5F1E8] hover:text-[#D4AF37] transition-colors group"
                  >
                    <LayoutDashboard className="w-5 h-5 group-hover:text-[#D4AF37]" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Bottom Section - Auth Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            {isAuthenticated && user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-[#C41E3A] text-white hover:bg-[#B01E3A] transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="space-y-3">
                <Link href="/login" onClick={onClose}>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link href="/register" onClick={onClose}>
                  <Button className="w-full flex items-center justify-center space-x-2 bg-[#D4AF37] hover:bg-[#C4A137] text-[#1a1a1a]">
                    <UserPlus className="w-5 h-5" />
                    <span>Register</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
