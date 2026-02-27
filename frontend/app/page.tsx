'use client';

import React from 'react';
import MuebleHero from '../components/home/mueble/MuebleHero';
import MuebeCategoryShowcase from '../components/home/mueble/MuebeCategoryShowcase';
import MuebleProducts from '../components/home/mueble/MuebleProducts';
import MuebleJournal from '../components/home/mueble/MuebleJournal';
import MuebleFeatures from '../components/home/mueble/MuebleFeatures';
import MuebleInstagram from '../components/home/mueble/MuebleInstagram';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <MuebleHero />
      <MuebeCategoryShowcase />
      <MuebleProducts />
      <MuebleJournal />
      <MuebleFeatures />
      <MuebleInstagram />
    </div>
  );
}