'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { useCart } from '../../lib/cart-context';

export function NavbarWrapper() {
  const { cartCount } = useCart();
  return <Navbar cartCount={cartCount} />;
}
