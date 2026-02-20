'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { useCart } from '../../lib/cart-context';
import { useWishlist } from '../WishlistContext';

export function NavbarWrapper() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  return <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />;
}
