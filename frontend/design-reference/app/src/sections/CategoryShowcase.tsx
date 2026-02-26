export default function CategoryShowcase() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category 1 - Fabrics */}
          <div className="relative group overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src="/images/category-fabrics.jpg"
                alt="African Fabrics"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-white p-6 lg:p-8">
              <span className="text-xs uppercase tracking-wider text-gray-500">Fabrics</span>
              <h3 className="text-xl lg:text-2xl font-bold text-[#1a237e] mt-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                —Find authentic fabrics your wardrobe will love
              </h3>
              <a
                href="#"
                className="inline-block mt-4 text-sm text-gray-500 hover:text-[#00c853] transition-colors underline underline-offset-4"
              >
                shop now
              </a>
            </div>
          </div>

          {/* Category 2 - Dresses */}
          <div className="relative group overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src="/images/category-dresses.jpg"
                alt="African Dresses"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-white p-6 lg:p-8">
              <span className="text-xs uppercase tracking-wider text-gray-500">Dresses</span>
              <h3 className="text-xl lg:text-2xl font-bold text-[#1a237e] mt-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                —Top colors for our new season collection
              </h3>
              <a
                href="#"
                className="inline-block mt-4 text-sm text-gray-500 hover:text-[#00c853] transition-colors underline underline-offset-4"
              >
                shop now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
