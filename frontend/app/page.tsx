'use client';

import React from 'react';
import { MuebleHero } from '../components/homepage/MuebleHero';
import { MuebleCategoryShowcase } from '../components/homepage/MuebleCategoryShowcase';
import { MuebleProducts } from '../components/homepage/MuebleProducts';
import { MuebleJournal } from '../components/homepage/MuebleJournal';
import { MuebleFeatures } from '../components/homepage/MuebleFeatures';
import { MuebleInstagram } from '../components/homepage/MuebleInstagram';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <MuebleHero />
      <MuebleCategoryShowcase />
      <MuebleProducts />
      <MuebleJournal />
      <MuebleFeatures />
      <MuebleInstagram />
    </div>
  );
}