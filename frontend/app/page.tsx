export default function Home() {
  return (
    <div className="max-w-7xl mx-auto py-12">
      <h2 className="text-4xl font-bold mb-4">Welcome to African Fashion</h2>
      <p className="text-xl text-gray-600 mb-8">
        Discover authentic African designs and fabrics
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold mb-2">Featured Products</h3>
          <p>Browse our latest collection</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold mb-2">Premium Fabrics</h3>
          <p>High-quality African textiles</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold mb-2">Designer Collections</h3>
          <p>From renowned African designers</p>
        </div>
      </div>
    </div>
  );
}
