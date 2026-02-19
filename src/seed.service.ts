import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Fabric } from './fabric.entity';
import { Designer } from './designer.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Fabric) private fabricRepo: Repository<Fabric>,
    @InjectRepository(Designer) private designerRepo: Repository<Designer>,
  ) {}

  async onModuleInit() {
    console.log('🌱 SeedService.onModuleInit() called');
    try {
      await this.seed();
    } catch (error) {
      console.error('❌ SeedService error:', error);
    }
  }

  async seed() {
    try {
      console.log('🌱 Starting database seed...');
      
      const productCount = await this.productRepo.count();
      console.log(`📊 Products count: ${productCount}`);
      
      if (productCount === 0) {
        console.log('🌱 Seeding products...');
        await this.productRepo.insert([
          { name: 'Ankara Fabric Bundle', description: 'Premium quality Ankara fabric', price: 45.99, active: true },
          { name: 'Kente Cloth', description: 'Traditional Kente weaving', price: 89.99, active: true },
          { name: 'Adire Indigo Dye', description: 'Authentic Adire indigo fabric', price: 52.50, active: true },
          { name: 'Bogolan Mud Cloth', description: 'Traditional Bogolan pattern', price: 67.99, active: true },
        ]);
        console.log('✅ Products seeded!');
      }

      const fabricCount = await this.fabricRepo.count();
      console.log(`📊 Fabrics count: ${fabricCount}`);
      if (fabricCount === 0) {
        console.log('🌱 Seeding fabrics...');
        await this.fabricRepo.insert([
          { name: '100% Cotton Ankara', type: 'Ankara', width: '45 inches', price: 12.99, origin: 'Ghana' },
          { name: 'Silk Blend Kente', type: 'Kente', width: '36 inches', price: 25.50, origin: 'Ghana' },
          { name: 'Pure Adire Cotton', type: 'Adire', width: '45 inches', price: 15.99, origin: 'Nigeria' },
        ]);
        console.log('✅ Fabrics seeded!');
      }

      const designerCount = await this.designerRepo.count();
      console.log(`📊 Designers count: ${designerCount}`);
      if (designerCount === 0) {
        console.log('🌱 Seeding designers...');
        await this.designerRepo.insert([
          { name: 'Stella Jean', country: 'Haiti/Italy', specialty: 'Contemporary African Fashion', bio: 'Stella Jean brings African aesthetics to modern design' },
          { name: 'Tunde Ajakaiye', country: 'Nigeria', specialty: 'Traditional & Contemporary', bio: 'Master of Ankara and luxury African wear' },
          { name: 'Ozwald Boateng', country: 'Ghana', specialty: 'Luxury Tailoring', bio: 'High-end bespoke African fashion' },
        ]);
        console.log('✅ Designers seeded!');
      }
      
      console.log('✅ Database seeding complete!');
    } catch (error) {
      console.error('❌ Seed error:', error.message, error);
    }
  }
}