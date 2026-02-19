import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Fabric } from './fabric.entity';
import { Designer } from './designer.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const productRepo = app.get(Repository);
  const fabricRepo = app.get(Repository);
  const designerRepo = app.get(Repository);

  console.log('🌱 Seeding database...');

  const products = [
    { name: 'Ankara Fabric Bundle', description: 'Premium quality Ankara fabric', price: 45.99 },
    { name: 'Kente Cloth', description: 'Traditional Kente weaving', price: 89.99 },
    { name: 'Adire Indigo Dye', description: 'Authentic Adire indigo fabric', price: 52.50 },
  ];

  const fabrics = [
    { name: '100% Cotton Ankara', type: 'Ankara', width: '45 inches', price: 12.99, origin: 'Ghana' },
    { name: 'Silk Blend Kente', type: 'Kente', width: '36 inches', price: 25.50, origin: 'Ghana' },
    { name: 'Pure Adire Cotton', type: 'Adire', width: '45 inches', price: 15.99, origin: 'Nigeria' },
  ];

  const designers = [
    { name: 'Stella Jean', country: 'Haiti/Italy', specialty: 'Contemporary African Fashion', bio: 'Stella Jean brings African aesthetics to modern design' },
    { name: 'Tunde Ajakaiye', country: 'Nigeria', specialty: 'Traditional & Contemporary', bio: 'Master of Ankara and luxury African wear' },
  ];

  await productRepo.insert(products);
  await fabricRepo.insert(fabrics);
  await designerRepo.insert(designers);

  console.log('✅ Database seeded successfully!');
  await app.close();
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
