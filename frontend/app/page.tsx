'use client';

import React from 'react';
import { MuebleHero } from '../components/home/MuebleHero';
import { MuebleCategoryShowcase } from '../components/home/MuebleCategoryShowcase';
import { MuebleLatestProducts } from '../components/home/MuebleLatestProducts';
import { MuebleJournal } from '../components/home/MuebleJournal';
import { MuebleFeatures } from '../components/home/MuebleFeatures';
import { MuebleInstagram } from '../components/home/MuebleInstagram';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <MuebleHero />
      <MuebleCategoryShowcase />
      <MuebleLatestProducts />
      <MuebleJournal />
      <MuebleFeatures />
      <MuebleInstagram />
    </div>
  );
}
