import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export async function runSeed(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository('User');
  const designRepo = dataSource.getRepository('Design');
  const rtwRepo = dataSource.getRepository('ReadyToWearProduct');
  const fabricRepo = dataSource.getRepository('Fabric');
  const settingsRepo = dataSource.getRepository('PlatformSettings');
  const taxRepo = dataSource.getRepository('TaxConfiguration');
  const carrierRepo = dataSource.getRepository('ShippingCarrier');

  console.log('🌱 Seeding database...');

  const userCount = await userRepo.count();
  let designer: any;
  let designer2: any;
  let designer3: any;
  let seller: any;

  const hash = async (p: string) => bcrypt.hash(p, 10);
  const defaultPassword = await hash('Password123!');

  // Always ensure the admin user exists (upsert logic)
  let adminUser = await userRepo.findOne({ where: { email: 'admin@africanfashion.com' } });
  if (!adminUser) {
    adminUser = await userRepo.save(
      userRepo.create({
        email: 'admin@africanfashion.com',
        password: defaultPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        city: 'Lagos',
        addressLine1: '1 Admin Street',
      }),
    );
    console.log('✅ Admin user created');
  } else {
    // Reset admin password and clear any lockout
    adminUser.password = defaultPassword;
    adminUser.isEmailVerified = true;
    adminUser.failedLoginAttempts = 0;
    adminUser.lockedUntil = null;
    adminUser.isActive = true;
    await userRepo.save(adminUser);
    console.log('✅ Admin user reset (password + lockout cleared)');
  }

  if (userCount === 0) {
    const users = await userRepo.save([
      userRepo.create({
        email: 'designer@africanfashion.com',
        password: defaultPassword,
        firstName: 'Amara',
        lastName: 'Diallo',
        role: 'designer',
        isActive: true,
        isEmailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        city: 'Lagos',
        addressLine1: '5 Design Lane',
        state: 'Lagos State',
        postalCode: '100001',
      }),
      userRepo.create({
        email: 'designer2@africanfashion.com',
        password: defaultPassword,
        firstName: 'Fatima',
        lastName: 'Ouattara',
        role: 'designer',
        isActive: true,
        isEmailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        city: 'Abidjan',
        addressLine1: '22 Rue des Tissus',
        state: 'Abidjan',
        postalCode: '01BP2090',
      }),
      userRepo.create({
        email: 'designer3@africanfashion.com',
        password: defaultPassword,
        firstName: 'Tendai',
        lastName: 'Moyo',
        role: 'designer',
        isActive: true,
        isEmailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        city: 'Cape Town',
        addressLine1: '7 Fashion Walk, Green Point',
        state: 'Western Cape',
        postalCode: '8001',
      }),
      userRepo.create({
        email: 'seller@africanfashion.com',
        password: defaultPassword,
        firstName: 'Kofi',
        lastName: 'Mensah',
        role: 'fabric_seller',
        isActive: true,
        isEmailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        city: 'Kano',
        addressLine1: '12 Fabric Market Road',
        state: 'Kano State',
        postalCode: '700001',
      }),
      userRepo.create({
        email: 'qa@africanfashion.com',
        password: defaultPassword,
        firstName: 'QA',
        lastName: 'Inspector',
        role: 'qa',
        isActive: true,
        isEmailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        city: 'Abuja',
        addressLine1: 'QA Facility, Plot 5 Central Business District',
        state: 'FCT',
        postalCode: '900001',
      }),
      userRepo.create({
        email: 'customer@africanfashion.com',
        password: defaultPassword,
        firstName: 'Customer',
        lastName: 'User',
        role: 'customer',
        isActive: true,
        isEmailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        city: 'Port Harcourt',
        addressLine1: '8 Residential Avenue',
        state: 'Rivers State',
        postalCode: '500001',
      }),
    ]);

    designer = users.find(u => u.email === 'designer@africanfashion.com');
    designer2 = users.find(u => u.email === 'designer2@africanfashion.com');
    designer3 = users.find(u => u.email === 'designer3@africanfashion.com');
    seller = users.find(u => u.role === 'fabric_seller');

    console.log('✅ Users seeded');
  } else {
    console.log('ℹ️  Users already exist, skipping user seed');
    designer = await userRepo.findOne({ where: { email: 'designer@africanfashion.com' } });
    designer2 = await userRepo.findOne({ where: { email: 'designer2@africanfashion.com' } });
    designer3 = await userRepo.findOne({ where: { email: 'designer3@africanfashion.com' } });
    seller = await userRepo.findOne({ where: { role: 'fabric_seller' } });
  }

  const designCount = await designRepo.count();
  if (designCount === 0 && designer) {
    const d1 = { id: designer.id };
    const d2 = designer2 ? { id: designer2.id } : d1;
    const d3 = designer3 ? { id: designer3.id } : d1;

    // Seed Designs (templates for custom orders)
    await designRepo.save([
      designRepo.create({
        name: 'Ankara Wrap Dress Design',
        description: 'A stunning wrap dress made from vibrant Ankara print fabric. Features bold geometric patterns and a flattering silhouette perfect for formal occasions.',
        category: 'Dresses',
        tags: ['ankara', 'wrap', 'formal', 'vibrant'],
        designerPrice: 40.00,
        customerPrice: 85.00,
        images: ['https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&q=80'],
        averageRating: 4.8,
        totalReviews: 32,
        designer: d1,
        isActive: true,
        isFeatured: true,
      }),
      designRepo.create({
        name: 'Adire Evening Gown Design',
        description: 'An elegant evening gown featuring hand-dyed Adire fabric with intricate resist-dye patterns. Each piece is entirely unique.',
        category: 'Gowns',
        tags: ['adire', 'evening', 'gown', 'handmade', 'yoruba'],
        designerPrice: 75.00,
        customerPrice: 160.00,
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&q=80'],
        averageRating: 4.9,
        totalReviews: 24,
        designer: d1,
        isActive: true,
        isFeatured: true,
      }),
      designRepo.create({
        name: 'Kente Blazer Design',
        description: 'A sophisticated blazer crafted from authentic hand-woven Kente cloth sourced from Ghanaian master weavers.',
        category: 'Jackets',
        tags: ['kente', 'blazer', 'business', 'heritage', 'ghana'],
        designerPrice: 58.00,
        customerPrice: 120.00,
        images: ['https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80'],
        averageRating: 4.5,
        totalReviews: 18,
        designer: d1,
        isActive: true,
        isFeatured: false,
      }),
      designRepo.create({
        name: 'Bogolan Bomber Jacket Design',
        description: 'A street-ready bomber jacket made from West African Bogolan (mudcloth) fabric.',
        category: 'Jackets',
        tags: ['bogolan', 'mudcloth', 'bomber', 'streetwear', 'ivory coast'],
        designerPrice: 65.00,
        customerPrice: 140.00,
        images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'],
        averageRating: 4.4,
        totalReviews: 12,
        designer: d2,
        isActive: true,
        isFeatured: true,
      }),
      designRepo.create({
        name: 'Aso-Oke Wedding Set Design',
        description: 'A complete ceremonial Aso-Oke bridal set including gele headwrap, iro wrapper, and buba top.',
        category: 'Sets',
        tags: ['aso-oke', 'wedding', 'bridal', 'yoruba', 'ceremonial'],
        designerPrice: 160.00,
        customerPrice: 350.00,
        images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80'],
        averageRating: 5.0,
        totalReviews: 8,
        designer: d1,
        isActive: true,
        isFeatured: false,
      }),
      designRepo.create({
        name: 'Kitenge Maxi Skirt Design',
        description: 'A floor-length maxi skirt crafted from Kenyan Kitenge fabric bursting with bold tropical prints.',
        category: 'Dresses',
        tags: ['kitenge', 'maxi', 'skirt', 'kenya', 'tropical'],
        designerPrice: 30.00,
        customerPrice: 65.00,
        images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80'],
        averageRating: 4.6,
        totalReviews: 21,
        designer: d2,
        isActive: true,
        isFeatured: false,
      }),
    ]);
    console.log('✅ Designs seeded');

    // Seed Ready-to-Wear products (items with stock ready to ship)
    await rtwRepo.save([
      rtwRepo.create({
        name: 'Dashiki Kaftan Top',
        description: 'A breezy, embroidered Dashiki kaftan top ideal for warm weather and festive occasions.',
        category: 'Tops',
        tags: ['dashiki', 'kaftan', 'embroidered', 'casual', 'festive'],
        designerPrice: 24.00,
        customerPrice: 55.00,
        images: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80'],
        averageRating: 4.3,
        totalReviews: 15,
        stock: 40,
        trackInventory: true,
        designer: d1,
        isActive: true,
        isFeatured: true,
      }),
      rtwRepo.create({
        name: 'Shweshwe A-Line Dress',
        description: 'A chic A-line dress tailored from South African Shweshwe cotton.',
        category: 'Dresses',
        tags: ['shweshwe', 'a-line', 'south africa', 'cotton', 'cultural'],
        designerPrice: 45.00,
        customerPrice: 95.00,
        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'],
        averageRating: 4.7,
        totalReviews: 28,
        stock: 20,
        trackInventory: true,
        designer: d3,
        isActive: true,
        isFeatured: true,
      }),
      rtwRepo.create({
        name: 'Fugu Smock Top',
        description: 'A classic Northern Ghanaian Fugu (Smock) top hand-woven on narrow-band looms.',
        category: 'Tops',
        tags: ['fugu', 'smock', 'ghana', 'hand-woven', 'cotton'],
        designerPrice: 20.00,
        customerPrice: 45.00,
        images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80'],
        averageRating: 4.1,
        totalReviews: 19,
        stock: 35,
        trackInventory: true,
        designer: d1,
        isActive: true,
        isFeatured: false,
      }),
      rtwRepo.create({
        name: 'Maasai Beaded Clutch',
        description: 'A hand-beaded clutch bag crafted by Maasai artisan women using traditional glass bead techniques.',
        category: 'Accessories',
        tags: ['maasai', 'beaded', 'clutch', 'kenya', 'handcrafted'],
        designerPrice: 16.00,
        customerPrice: 40.00,
        images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
        averageRating: 4.4,
        totalReviews: 35,
        stock: 50,
        trackInventory: true,
        designer: d2,
        isActive: true,
        isFeatured: true,
      }),
      rtwRepo.create({
        name: 'Kente Graduation Stole',
        description: 'A prestigious hand-woven Kente stole perfect for graduations and academic ceremonies.',
        category: 'Accessories',
        tags: ['kente', 'graduation', 'stole', 'ghana', 'academic'],
        designerPrice: 20.00,
        customerPrice: 45.00,
        images: ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80'],
        averageRating: 4.9,
        totalReviews: 44,
        stock: 60,
        trackInventory: true,
        designer: d1,
        isActive: true,
        isFeatured: false,
      }),
    ]);
    console.log('✅ Ready-to-wear products seeded');
  } else {
    console.log('ℹ️  Designs/RTW already exist, skipping product seed');
  }

  const fabricCount = await fabricRepo.count();
  if (fabricCount === 0 && seller) {
    await fabricRepo.save([
      fabricRepo.create({
        name: 'Vibrant Ankara Print',
        description: 'High-quality Ankara print fabric with bold geometric and floral patterns. 100% cotton, perfect for dresses and skirts.',
        type: 'Ankara',
        colors: ['red', 'yellow', 'green', 'black'],
        patterns: ['geometric', 'floral'],
        material: 'Cotton',
        width: 115,
        sellerPrice: 12.00,
        customerPrice: 22.00,
        seller: { id: seller.id },
        stock: 50,
        isActive: true,
        isFeatured: true,
      }),
      fabricRepo.create({
        name: 'Royal Kente Cloth',
        description: 'Authentic hand-woven Kente fabric from artisan weavers. Features traditional gold, green and red patterns symbolizing royalty and prosperity.',
        type: 'Kente',
        colors: ['gold', 'green', 'red', 'black'],
        patterns: ['traditional', 'woven'],
        material: 'Silk blend',
        width: 110,
        sellerPrice: 35.00,
        customerPrice: 65.00,
        seller: { id: seller.id },
        stock: 20,
        isActive: true,
      }),
      fabricRepo.create({
        name: 'Indigo Adire Fabric',
        description: 'Beautiful hand-dyed Adire fabric using traditional indigo resist-dyeing techniques. Each piece has unique patterns making it one-of-a-kind.',
        type: 'Adire',
        colors: ['indigo', 'white', 'blue'],
        patterns: ['tie-dye', 'resist-dye'],
        material: 'Cotton',
        width: 120,
        sellerPrice: 18.00,
        customerPrice: 35.00,
        seller: { id: seller.id },
        stock: 30,
        isActive: true,
      }),
      fabricRepo.create({
        name: 'Kitenge Print Fabric',
        description: 'Vibrant East African Kitenge cotton fabric featuring large tropical floral and geometric prints. Widely used for dresses, shirts, and home décor across Kenya, Tanzania, and Uganda.',
        type: 'Kitenge',
        colors: ['orange', 'teal', 'purple', 'white'],
        patterns: ['floral', 'geometric'],
        material: 'Cotton',
        width: 114,
        sellerPrice: 14.00,
        customerPrice: 28.00,
        seller: { id: seller.id },
        stock: 40,
        isActive: true,
      }),
      fabricRepo.create({
        name: 'Shweshwe Cotton Fabric',
        description: 'Iconic South African Shweshwe fabric with its distinctive ditsy geometric print and characteristic starchy finish. Originally produced for the Sotho people, it is now a beloved fabric across Southern Africa.',
        type: 'Shweshwe',
        colors: ['navy', 'white', 'burgundy'],
        patterns: ['geometric', 'ditsy'],
        material: 'Cotton',
        width: 90,
        sellerPrice: 9.00,
        customerPrice: 18.00,
        seller: { id: seller.id },
        stock: 60,
        isActive: true,
      }),
      fabricRepo.create({
        name: 'Bogolan Mudcloth',
        description: 'Handcrafted West African Bogolan (mudcloth) fabric from Mali and Ivory Coast. Made by painting fermented mud onto hand-spun cotton strips, creating unique earth-toned geometric and symbolic patterns.',
        type: 'Bogolan',
        colors: ['brown', 'cream', 'black', 'ochre'],
        patterns: ['geometric', 'symbolic'],
        material: 'Cotton',
        width: 100,
        sellerPrice: 22.00,
        customerPrice: 42.00,
        seller: { id: seller.id },
        stock: 25,
        isActive: true,
      }),
    ]);
    console.log('✅ Fabrics seeded');
  } else {
    console.log('ℹ️  Fabrics already exist, skipping fabric seed');
  }

  const settingsCount = await settingsRepo.count();
  if (settingsCount === 0) {
    await settingsRepo.save(
      settingsRepo.create({
        key: 'default',
        percentageFee: 10,
        currency: 'USD',
        description: 'Default 10% platform commission',
        isActive: true,
      }),
    );
    console.log('✅ Platform settings seeded');
  } else {
    console.log('ℹ️  Platform settings already exist, skipping');
  }

  const taxCount = await taxRepo.count();
  if (taxCount === 0) {
    await taxRepo.save([
      taxRepo.create({
        taxName: 'VAT',
        baseTaxRate: 7.5,
        adminMarkupRate: 0,
        description: 'Nigeria Value Added Tax',
        isActive: true,
      }),
      taxRepo.create({
        country: 'Ghana',
        taxName: 'VAT',
        baseTaxRate: 15,
        adminMarkupRate: 0,
        description: 'Ghana Value Added Tax',
        isActive: true,
      }),
    ]);
    console.log('✅ Tax configurations seeded');
  } else {
    console.log('ℹ️  Tax configurations already exist, skipping');
  }

  const carrierCount = await carrierRepo.count();
  if (carrierCount === 0) {
    await carrierRepo.save(
      carrierRepo.create({
        name: 'Flat Rate Shipping',
        provider: 'FLAT_RATE',
        settings: { rate: 5.00, currency: 'USD' },
        supportedCountries: ['Nigeria', 'Ghana'],
        supportedCurrencies: ['USD', 'NGN', 'GHS'],
        isActive: true,
        priority: 1,
      }),
    );
    console.log('✅ Shipping carrier seeded');
  } else {
    console.log('ℹ️  Shipping carriers already exist, skipping');
  }


  // ── Hero Banners ──────────────────────────────────────────────────────────────
  const heroBannerRepo = dataSource.getRepository('HeroBanner');
  const heroBannerCount = await heroBannerRepo.count();
  if (heroBannerCount === 0) {
    await heroBannerRepo.save([
      heroBannerRepo.create({
        title: 'Where African Fashion Meets the World',
        subtitle: "Discover thousands of authentic designs from Africa's most talented designers and artisans.",
        ctaText: 'Shop Now →',
        ctaLink: '/ready-to-wear',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=1920&q=80',
        sortOrder: 0,
        isActive: true,
        overlayOpacity: 40,
      }),
      heroBannerRepo.create({
        title: 'New Collection: Spring/Summer 2026',
        subtitle: 'Bold prints, vibrant colours, and master craftsmanship — the new season is here.',
        ctaText: 'Explore Collection',
        ctaLink: '/designs',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=1920&q=80',
        sortOrder: 1,
        isActive: true,
        overlayOpacity: 40,
      }),
      heroBannerRepo.create({
        title: 'Discover Authentic African Designs',
        subtitle: 'From Kente to Ankara — celebrate your heritage with fashion crafted by African hands.',
        ctaText: 'Browse Designers',
        ctaLink: '/designers',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1920&q=80',
        sortOrder: 2,
        isActive: true,
        overlayOpacity: 40,
      }),
    ]);
    console.log('✅ Hero banners seeded');
  } else {
    console.log('ℹ️  Hero banners already exist, skipping');
  }

  // ── Country Heroes ────────────────────────────────────────────────────────────
  const countryHeroRepo = dataSource.getRepository('CountryHero');
  const countryHeroCount = await countryHeroRepo.count();
  if (countryHeroCount === 0) {
    await countryHeroRepo.save([
      countryHeroRepo.create({
        countryName: 'Nigeria',
        countryCode: 'NG',
        heroImages: [
          'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&q=80',
          'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=800&q=80',
        ],
        displayOrder: 1,
        isActive: true,
        rotationInterval: 5000,
      }),
      countryHeroRepo.create({
        countryName: 'Ghana',
        countryCode: 'GH',
        heroImages: [
          'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
        ],
        displayOrder: 2,
        isActive: true,
        rotationInterval: 5000,
      }),
      countryHeroRepo.create({
        countryName: 'Kenya',
        countryCode: 'KE',
        heroImages: [
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
        ],
        displayOrder: 3,
        isActive: true,
        rotationInterval: 5000,
      }),
      countryHeroRepo.create({
        countryName: 'South Africa',
        countryCode: 'ZA',
        heroImages: [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
        ],
        displayOrder: 4,
        isActive: true,
        rotationInterval: 5000,
      }),
      countryHeroRepo.create({
        countryName: 'Tanzania',
        countryCode: 'TZ',
        heroImages: [
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
        ],
        displayOrder: 5,
        isActive: true,
        rotationInterval: 5000,
      }),
      countryHeroRepo.create({
        countryName: 'Cameroon',
        countryCode: 'CM',
        heroImages: [
          'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
        ],
        displayOrder: 6,
        isActive: true,
        rotationInterval: 5000,
      }),
    ]);
    console.log('✅ Country heroes seeded');
  } else {
    console.log('ℹ️  Country heroes already exist, skipping');
  }

  // ── Promo Banners ─────────────────────────────────────────────────────────────
  const promoBannerRepo = dataSource.getRepository('PromoBanner');
  const promoBannerCount = await promoBannerRepo.count();
  if (promoBannerCount === 0) {
    await promoBannerRepo.save(
      promoBannerRepo.create({
        title: 'New Collection: Spring/Summer 2026',
        subtitle: 'Discover our latest curated collection of authentic African designs from 50+ African countries',
        imageUrl: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=1200&q=80',
        ctaText: 'Shop the Collection',
        ctaLink: '/ready-to-wear',
        displayOrder: 0,
        isActive: true,
      }),
    );
    console.log('✅ Promo banners seeded');
  } else {
    console.log('ℹ️  Promo banners already exist, skipping');
  }

  // ── Heritage Stories ──────────────────────────────────────────────────────────
  const heritageStoryRepo = dataSource.getRepository('HeritageStory');
  const heritageStoryCount = await heritageStoryRepo.count();
  if (heritageStoryCount === 0) {
    await heritageStoryRepo.save([
      heritageStoryRepo.create({
        title: 'The Royal Art of Kente Weaving',
        excerpt: "Kente cloth, with its vibrant geometric patterns and rich symbolism, has adorned Ghanaian royalty for centuries and remains one of Africa's most iconic textiles.",
        body: "Originating from the Ashanti people of Ghana, Kente cloth (known as nwentoma in Twi) has been woven on narrow-band looms since the 17th century. Each pattern carries deep symbolic meaning — colours represent values like gold for royalty, green for renewal, and red for political passion. Today, master weavers in Bonwire, Adanwomase, and Ntonso continue this tradition, producing hand-woven strips that are sewn together into magnificent garments worn at festivals, graduations, and rites of passage.",
        coverImage: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
        country: 'Ghana',
        fabricType: 'Kente',
        tags: ['Ghana', 'Kente', 'Weaving', 'Heritage'],
        displayOrder: 1,
        isActive: true,
      }),
      heritageStoryRepo.create({
        title: 'Ankara: A Canvas of African Expression',
        excerpt: 'Bold, vibrant, and deeply personal — Ankara wax print fabric has become the definitive symbol of modern African identity, creativity, and pride.',
        body: 'Ankara fabric, also known as African wax print or Dutch wax, has a fascinating history that spans three continents. Originally manufactured in the Netherlands for the Indonesian batik market, it found its true home in West Africa — particularly Nigeria — where designers embraced its vivid colours and bold patterns as a canvas for self-expression. Today, Nigerian designers use Ankara to create everything from everyday wear to haute couture, exporting African aesthetic sensibility to fashion capitals around the world.',
        coverImage: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&q=80',
        country: 'Nigeria',
        fabricType: 'Ankara',
        tags: ['Nigeria', 'Ankara', 'Wax Print', 'Heritage'],
        displayOrder: 2,
        isActive: true,
      }),
      heritageStoryRepo.create({
        title: "Kitenge: East Africa's Vibrant Tradition",
        excerpt: 'Kitenge fabric pulses with the energy of East Africa — its bold patterns telling stories of community, celebration, and cultural identity across Kenya, Tanzania, and Uganda.',
        body: 'Kitenge (also called chitenge or kanga depending on the region) is a brightly coloured cotton fabric widely used across East and Central Africa. In Tanzania and Kenya, kitenge is far more than clothing — it carries messages, proverbs, and commemorates life events. Women wrap it as skirts, use it as baby carriers, and exchange it as gifts at weddings and funerals. Modern East African designers have elevated kitenge to international runways, blending traditional patterns with contemporary silhouettes.',
        coverImage: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
        country: 'Tanzania',
        fabricType: 'Kitenge',
        tags: ['Tanzania', 'Kitenge', 'East Africa', 'Heritage'],
        displayOrder: 3,
        isActive: true,
      }),
      heritageStoryRepo.create({
        title: "Shweshwe: South Africa's Iconic Printed Fabric",
        excerpt: 'With its distinctive geometric prints and characteristic starchy finish, Shweshwe has evolved from a trade fabric into a proud symbol of South African cultural identity.',
        body: 'Shweshwe (also written as seshoeshoe) was originally a simple blue cotton fabric brought to South Africa by German settlers in the 19th century. It was quickly adopted by the Sotho people and became central to their dress culture. Over time it expanded to include a rainbow of colours and intricate geometric patterns. Today, South African designers use Shweshwe in contemporary fashion — from wedding garments to international collections — celebrating it as an emblem of national pride and creative heritage.',
        coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
        country: 'South Africa',
        fabricType: 'Shweshwe',
        tags: ['South Africa', 'Shweshwe', 'Sotho', 'Heritage'],
        displayOrder: 4,
        isActive: true,
      }),
    ]);
    console.log('✅ Heritage stories seeded');
  } else {
    console.log('ℹ️  Heritage stories already exist, skipping');
  }

  // ── How It Works Steps ────────────────────────────────────────────────────────
  const howItWorksRepo = dataSource.getRepository('HowItWorksStep');
  const howItWorksCount = await howItWorksRepo.count();
  if (howItWorksCount === 0) {
    await howItWorksRepo.save([
      howItWorksRepo.create({
        stepNumber: 1,
        title: 'Browse',
        description: 'Explore thousands of designs from African artisans and designers across the continent.',
        icon: 'search',
        isActive: true,
        displayOrder: 1,
      }),
      howItWorksRepo.create({
        stepNumber: 2,
        title: 'Choose',
        description: 'Select your perfect piece — ready-to-wear, custom design, or premium fabric.',
        icon: 'check',
        isActive: true,
        displayOrder: 2,
      }),
      howItWorksRepo.create({
        stepNumber: 3,
        title: 'QA Verified',
        description: 'Every item passes our rigorous quality assurance inspection before shipping.',
        icon: 'shield',
        isActive: true,
        displayOrder: 3,
      }),
      howItWorksRepo.create({
        stepNumber: 4,
        title: 'Delivered',
        description: 'Your order is carefully packaged and delivered worldwide to your doorstep.',
        icon: 'package',
        isActive: true,
        displayOrder: 4,
      }),
    ]);
    console.log('✅ How it works steps seeded');
  } else {
    console.log('ℹ️  How it works steps already exist, skipping');
  }

  // ── Collection Displays ───────────────────────────────────────────────────────
  const collectionDisplayRepo = dataSource.getRepository('CollectionDisplay');
  const collectionDisplayCount = await collectionDisplayRepo.count();
  if (collectionDisplayCount === 0) {
    await collectionDisplayRepo.save([
      collectionDisplayRepo.create({
        name: 'Ready-to-Wear',
        description: 'Curated African Fashion, Ready to Ship',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
        ctaText: 'Shop Now →',
        ctaLink: '/ready-to-wear',
        displayOrder: 1,
        isActive: true,
      }),
      collectionDisplayRepo.create({
        name: 'Premium Fabrics',
        description: 'Authentic African Textiles from Master Weavers',
        image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
        ctaText: 'Browse Fabrics →',
        ctaLink: '/fabrics',
        displayOrder: 2,
        isActive: true,
      }),
      collectionDisplayRepo.create({
        name: 'Custom Designs',
        description: 'Your Body, Your Fabric, Your Style',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=800&q=80',
        ctaText: 'Start Designing →',
        ctaLink: '/designs',
        displayOrder: 3,
        isActive: true,
      }),
    ]);
    console.log('✅ Collection displays seeded');
  } else {
    console.log('ℹ️  Collection displays already exist, skipping');
  }

  // ── TryOn Config ──────────────────────────────────────────────────────────────
  const tryOnConfigRepo = dataSource.getRepository('TryOnConfig');
  const tryOnConfigCount = await tryOnConfigRepo.count();
  if (tryOnConfigCount === 0) {
    await tryOnConfigRepo.save(
      tryOnConfigRepo.create({
        isEnabled: false,
        providerName: 'Virtual Stylist AI',
        showcaseImages: [
          'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&q=80',
          'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=800&q=80',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
        ],
        apiEndpoint: null,
        apiKey: null,
        configVariables: {},
      }),
    );
    console.log('✅ TryOn config seeded');
  } else {
    console.log('ℹ️  TryOn config already exists, skipping');
  }

  // ── Featured Sections ─────────────────────────────────────────────────────────
  const featuredSectionRepo = dataSource.getRepository('FeaturedSection');
  const featuredSectionCount = await featuredSectionRepo.count();
  if (featuredSectionCount === 0) {
    await featuredSectionRepo.save([
      featuredSectionRepo.create({
        title: 'Featured Ready-to-Wear',
        category: 'ready-to-wear',
        selectionMode: 'AUTO_NEWEST',
        maxRows: 3,
        displayOrder: 1,
        isActive: true,
      }),
      featuredSectionRepo.create({
        title: 'Featured Designs',
        category: 'designs',
        selectionMode: 'AUTO_NEWEST',
        maxRows: 2,
        displayOrder: 2,
        isActive: true,
      }),
      featuredSectionRepo.create({
        title: 'Featured Fabrics',
        category: 'fabrics',
        selectionMode: 'AUTO_NEWEST',
        maxRows: 2,
        displayOrder: 3,
        isActive: true,
      }),
    ]);
    console.log('✅ Featured sections seeded');
  } else {
    console.log('ℹ️  Featured sections already exist, skipping');
  }

  console.log('�� Database seeded successfully!');
}


