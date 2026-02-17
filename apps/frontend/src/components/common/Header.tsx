'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ShoppingCart, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock auth state - replace with real auth later
  const isAuthenticated = false; // Change to true to test authenticated state
  const user = isAuthenticated
    ? {
        name: 'John Doe',
        role: 'customer', // 'customer', 'designer', or 'admin'
        avatar: '/avatar-placeholder.png',
      }
    : null;

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    // eslint-disable-next-line no-console
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#C41E3A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AF</span>
              </div>
              <span className="hidden sm:block text-xl font-bold text-[#1a1a1a]">
                AfriStyle
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search designs, designers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </form>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/designs"
              className="text-[#1a1a1a] hover:text-[#D4AF37] transition-colors font-medium"
            >
              Designs
            </Link>
            <Link
              href="/designers"
              className="text-[#1a1a1a] hover:text-[#D4AF37] transition-colors font-medium"
            >
              Designers
            </Link>
            <Link
              href="/about"
              className="text-[#1a1a1a] hover:text-[#D4AF37] transition-colors font-medium"
            >
              About
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative p-2 border-0 hover:bg-gray-100">
                <ShoppingCart className="w-6 h-6 text-[#1a1a1a]" />
                <span className="absolute -top-1 -right-1 bg-[#C41E3A] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>

            {/* User Menu - Desktop */}
            {isAuthenticated && user ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C41E3A] flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-[#1a1a1a]">{user.name}</p>
                      <Badge className={`mt-1 ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-[#1a1a1a] hover:bg-[#F5F1E8] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        // TODO: Implement logout functionality
                        // eslint-disable-next-line no-console
                        console.log('Logging out...');
                      }}
                      className="w-full flex items-center px-4 py-2 text-[#C41E3A] hover:bg-[#F5F1E8] transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-[#1a1a1a]">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-[#D4AF37] hover:bg-[#C4A137] text-[#1a1a1a]">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#1a1a1a]"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search designs, designers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-4 space-y-3">
            <Link
              href="/designs"
              className="block text-[#1a1a1a] hover:text-[#D4AF37] transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Designs
            </Link>
            <Link
              href="/designers"
              className="block text-[#1a1a1a] hover:text-[#D4AF37] transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Designers
            </Link>
            <Link
              href="/about"
              className="block text-[#1a1a1a] hover:text-[#D4AF37] transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>

            {isAuthenticated && user ? (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C41E3A] flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">{user.name}</p>
                    <Badge className={`${getRoleBadgeColor(user.role)} text-xs`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center text-[#1a1a1a] hover:text-[#D4AF37] py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    // TODO: Implement logout functionality
                    // eslint-disable-next-line no-console
                    console.log('Logging out...');
                  }}
                  className="w-full flex items-center text-[#C41E3A] hover:opacity-80 py-2"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#C4A137] text-[#1a1a1a]">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
