import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import CategoryShowcase from './sections/CategoryShowcase';
import Products from './sections/Products';
import Journal from './sections/Journal';
import Features from './sections/Features';
import Instagram from './sections/Instagram';
import Footer from './sections/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <CategoryShowcase />
        <Products />
        <Journal />
        <Features />
        <Instagram />
      </main>
      <Footer />
    </div>
  );
}

export default App;
