const products = [
  {
    id: 1,
    name: 'Kente Gown',
    category: 'Dresses',
    price: 450,
    image: '/images/product-1.jpg',
    isNew: false,
  },
  {
    id: 2,
    name: 'Ankara Set',
    category: 'Dresses',
    price: 295,
    image: '/images/product-2.jpg',
    isNew: true,
  },
  {
    id: 3,
    name: 'Royal Dashiki',
    category: 'Dresses',
    price: 180,
    image: '/images/product-3.jpg',
    isNew: false,
  },
  {
    id: 4,
    name: 'Emerald Caftan',
    category: 'Dresses',
    price: 380,
    image: '/images/product-4.jpg',
    isNew: false,
  },
  {
    id: 5,
    name: 'Kitenge Fabric',
    category: 'Fabrics',
    price: 85,
    image: '/images/product-5.jpg',
    isNew: false,
  },
  {
    id: 6,
    name: 'Headwrap Set',
    category: 'Accessories',
    price: 120,
    image: '/images/product-6.jpg',
    isNew: true,
  },
  {
    id: 7,
    name: 'Boubou Gown',
    category: 'Dresses',
    price: 520,
    image: '/images/product-7.jpg',
    isNew: false,
  },
  {
    id: 8,
    name: 'Wax Print Bundle',
    category: 'Fabrics',
    price: 150,
    image: '/images/product-8.jpg',
    isNew: false,
  },
];

export default function Products() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a237e]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Latest products added
          </h2>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group bg-white">
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-[#ff5722] text-white text-xs px-2 py-1">
                    NEW
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <span className="text-xs uppercase tracking-wider text-gray-500">{product.category}</span>
                <h3 className="text-lg font-semibold text-[#1a237e] mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {product.name}
                </h3>
                <p className="text-gray-500 mt-1">$ {product.price}.00 USD</p>
                <button className="mt-3 bg-[#00c853] hover:bg-[#00b248] text-white text-sm px-4 py-2 transition-colors">
                  View more
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <a
            href="#"
            className="inline-block text-[#1a237e] hover:text-[#00c853] transition-colors underline underline-offset-4"
          >
            view all products
          </a>
        </div>
      </div>
    </section>
  );
}
