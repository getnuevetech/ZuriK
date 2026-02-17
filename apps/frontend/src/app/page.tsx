import {
  Hero,
  FeaturedDesigns,
  DesignerSpotlight,
  LocationHighlight,
  TestimonialSection,
} from '@/components/home';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedDesigns />
      <DesignerSpotlight />
      <LocationHighlight />
      <TestimonialSection />
    </main>
  );
}
