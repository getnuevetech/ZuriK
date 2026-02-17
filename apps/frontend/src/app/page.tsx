export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="container-custom py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-dark mb-6">
          Discover African Fashion
        </h1>
        <p className="text-xl md:text-2xl text-dark-lighter max-w-2xl mx-auto mb-8">
          Connect with talented African designers and find unique, authentic designs
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/designs" className="btn btn-primary">
            Explore Designs
          </a>
          <a href="/auth/register" className="btn btn-outline">
            Join as Designer
          </a>
        </div>
      </div>
    </main>
  );
}
