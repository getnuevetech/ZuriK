import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export async function runSeed(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository('User');
  const productRepo = dataSource.getRepository('Product');
  const fabricRepo = dataSource.getRepository('Fabric');

  console.log('🌱 Seeding database...');

  const userCount = await userRepo.count();
  let designer: any;
  let seller: any;

  if (userCount === 0) {
    const hash = async (p: string) => bcrypt.hash(p, 10);
    const defaultPassword = await hash('Password123!');

    const users = await userRepo.save([
      userRepo.create({
        email: 'admin@africanfashion.com',
        password: defaultPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        country: 'Nigeria',
        city: 'Lagos',
        addressLine1: '1 Admin Street',
      }),
      userRepo.create({
        email: 'designer@africanfashion.com',
        password: defaultPassword,
        firstName: 'Amara',
        lastName: 'Diallo',
        role: 'designer',
        isActive: true,
        country: 'Nigeria',
        city: 'Lagos',
        addressLine1: '5 Design Lane',
        state: 'Lagos State',
        postalCode: '100001',
      }),
      userRepo.create({
        email: 'seller@africanfashion.com',
        password: defaultPassword,
        firstName: 'Kofi',
        lastName: 'Mensah',
        role: 'fabric_seller',
        isActive: true,
        country: 'Nigeria',
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
        country: 'Nigeria',
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
        country: 'Nigeria',
        city: 'Port Harcourt',
        addressLine1: '8 Residential Avenue',
        state: 'Rivers State',
        postalCode: '500001',
      }),
    ]);

    designer = users.find(u => u.role === 'designer');
    seller = users.find(u => u.role === 'fabric_seller');

    console.log('✅ Users seeded');
  } else {
    console.log('ℹ️  Users already exist, skipping user seed');
    designer = await userRepo.findOne({ where: { role: 'designer' } });
    seller = await userRepo.findOne({ where: { role: 'fabric_seller' } });
  }

  const productCount = await productRepo.count();
  if (productCount === 0 && designer) {
    await productRepo.save([
      productRepo.create({
        name: 'Ankara Wrap Dress',
        description: 'A stunning wrap dress made from vibrant Ankara print fabric. Features bold geometric patterns and a flattering silhouette perfect for formal occasions.',
        category: 'Dresses',
        tags: ['ankara', 'wrap', 'formal', 'vibrant'],
        country: 'Nigeria',
        designerPrice: 45.00,
        customerPrice: 85.00,
        designer: { id: designer.id },
        isActive: true,
      }),
      productRepo.create({
        name: 'Kente Blazer',
        description: 'A sophisticated blazer crafted from traditional Kente cloth. Modern tailoring meets African heritage in this versatile piece suitable for business and social events.',
        category: 'Jackets',
        tags: ['kente', 'blazer', 'business', 'heritage'],
        country: 'Nigeria',
        designerPrice: 60.00,
        customerPrice: 120.00,
        designer: { id: designer.id },
        isActive: true,
      }),
      productRepo.create({
        name: 'Adire Evening Gown',
        description: 'An elegant evening gown featuring hand-dyed Adire fabric with intricate patterns. Each piece is unique due to the traditional tie-dye process.',
        category: 'Gowns',
        tags: ['adire', 'evening', 'gown', 'handmade'],
        country: 'Nigeria',
        designerPrice: 80.00,
        customerPrice: 160.00,
        designer: { id: designer.id },
        isActive: true,
      }),
    ]);
    console.log('✅ Products seeded');
  } else {
    console.log('ℹ️  Products already exist, skipping product seed');
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
        country: 'Nigeria',
        sellerPrice: 12.00,
        customerPrice: 22.00,
        seller: { id: seller.id },
        stock: 50,
        isActive: true,
      }),
      fabricRepo.create({
        name: 'Royal Kente Cloth',
        description: 'Authentic hand-woven Kente fabric from artisan weavers. Features traditional gold, green and red patterns symbolizing royalty and prosperity.',
        type: 'Kente',
        colors: ['gold', 'green', 'red', 'black'],
        patterns: ['traditional', 'woven'],
        material: 'Silk blend',
        width: 110,
        country: 'Nigeria',
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
        country: 'Nigeria',
        sellerPrice: 18.00,
        customerPrice: 35.00,
        seller: { id: seller.id },
        stock: 30,
        isActive: true,
      }),
    ]);
    console.log('✅ Fabrics seeded');
  } else {
    console.log('ℹ️  Fabrics already exist, skipping fabric seed');
  }

  console.log('🎉 Database seeded successfully!');
}

