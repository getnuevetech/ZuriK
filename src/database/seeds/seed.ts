import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export async function runSeed(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository('User');
  const settingsRepo = dataSource.getRepository('PlatformSettings');
  const taxRepo = dataSource.getRepository('TaxConfiguration');
  const gatewayRepo = dataSource.getRepository('PaymentGateway');
  const carrierRepo = dataSource.getRepository('ShippingCarrier');
  const productRepo = dataSource.getRepository('Product');
  const fabricRepo = dataSource.getRepository('Fabric');

  console.log('🌱 Seeding database...');

  // Seed Users
  const userCount = await userRepo.count();
  if (userCount === 0) {
    const hash = async (p: string) => bcrypt.hash(p, 10);

    const admin = await userRepo.save(userRepo.create({
      email: 'admin@africanfashion.com',
      passwordHash: await hash('Admin@123456'),
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    }));

    const qaLagos = await userRepo.save(userRepo.create({
      email: 'qa.lagos@africanfashion.com',
      passwordHash: await hash('QA@123456'),
      firstName: 'QA',
      lastName: 'Lagos',
      fullName: 'QA Lagos',
      role: 'QA',
      isActive: true,
      qaFacilityName: 'Lagos QA Center',
      qaAddressLine1: '123 Victoria Island',
      qaCity: 'Lagos',
      qaState: 'Lagos State',
      qaCountry: 'Nigeria',
      qaPostalCode: '100001',
      qaServesRegions: ['Lagos', 'Abuja', 'Port Harcourt'],
      qaPriority: 1,
      qaCapacity: 100,
    }));

    const qaNairobi = await userRepo.save(userRepo.create({
      email: 'qa.nairobi@africanfashion.com',
      passwordHash: await hash('QA@123456'),
      firstName: 'QA',
      lastName: 'Nairobi',
      fullName: 'QA Nairobi',
      role: 'QA',
      isActive: true,
      qaFacilityName: 'Nairobi QA Center',
      qaAddressLine1: '456 Westlands',
      qaCity: 'Nairobi',
      qaState: 'Nairobi County',
      qaCountry: 'Kenya',
      qaPostalCode: '00100',
      qaServesRegions: ['Nairobi', 'Mombasa'],
      qaPriority: 1,
      qaCapacity: 80,
    }));

    const designer1 = await userRepo.save(userRepo.create({
      email: 'designer1@africanfashion.com',
      passwordHash: await hash('Designer@123456'),
      firstName: 'Tunde',
      lastName: 'Ajakaiye',
      fullName: 'Tunde Ajakaiye',
      role: 'DESIGNER',
      country: 'Nigeria',
      isActive: true,
    }));

    const designer2 = await userRepo.save(userRepo.create({
      email: 'designer2@africanfashion.com',
      passwordHash: await hash('Designer@123456'),
      firstName: 'Stella',
      lastName: 'Jean',
      fullName: 'Stella Jean',
      role: 'DESIGNER',
      country: 'Ghana',
      isActive: true,
    }));

    const seller1 = await userRepo.save(userRepo.create({
      email: 'seller1@africanfashion.com',
      passwordHash: await hash('Seller@123456'),
      firstName: 'Fabric',
      lastName: 'Seller One',
      fullName: 'Fabric Seller One',
      role: 'FABRIC_SELLER',
      country: 'Nigeria',
      isActive: true,
    }));

    const seller2 = await userRepo.save(userRepo.create({
      email: 'seller2@africanfashion.com',
      passwordHash: await hash('Seller@123456'),
      firstName: 'Fabric',
      lastName: 'Seller Two',
      fullName: 'Fabric Seller Two',
      role: 'FABRIC_SELLER',
      country: 'Ghana',
      isActive: true,
    }));

    await userRepo.save(userRepo.create({
      email: 'customer@africanfashion.com',
      passwordHash: await hash('Customer@123456'),
      firstName: 'Test',
      lastName: 'Customer',
      fullName: 'Test Customer',
      role: 'CUSTOMER',
      country: 'USA',
      isActive: true,
    }));

    console.log('✅ Users seeded');

    // Seed Products
    await productRepo.save([
      productRepo.create({
        name: 'Ankara Maxi Dress',
        description: 'Elegant Ankara print maxi dress with contemporary cut',
        category: 'Dress',
        country: 'Nigeria',
        designerPrice: 45,
        customerPrice: 89.99,
        price: 89.99,
        designer: designer1,
        isActive: true,
      }),
      productRepo.create({
        name: 'Kente Blazer',
        description: 'Premium Kente cloth blazer for formal occasions',
        category: 'Blazer',
        country: 'Ghana',
        designerPrice: 55,
        customerPrice: 119.99,
        price: 119.99,
        designer: designer2,
        isActive: true,
      }),
      productRepo.create({
        name: 'Dashiki Shirt',
        description: 'Traditional Dashiki shirt with embroidered neckline',
        category: 'Shirt',
        country: 'Nigeria',
        designerPrice: 20,
        customerPrice: 45.99,
        price: 45.99,
        designer: designer1,
        isActive: true,
      }),
      productRepo.create({
        name: 'Kaftan Gown',
        description: 'Luxurious Kaftan gown with gold embroidery',
        category: 'Gown',
        country: 'Nigeria',
        designerPrice: 75,
        customerPrice: 159.99,
        price: 159.99,
        designer: designer2,
        isActive: true,
      }),
      productRepo.create({
        name: 'Agbada Set',
        description: 'Complete traditional Agbada set with cap',
        category: 'Set',
        country: 'Nigeria',
        designerPrice: 95,
        customerPrice: 199.99,
        price: 199.99,
        designer: designer1,
        isActive: true,
      }),
    ]);
    console.log('✅ Products seeded');

    // Seed Fabrics
    await fabricRepo.save([
      fabricRepo.create({
        name: 'Premium Ankara - Sunset Orange',
        description: 'High quality 100% cotton Ankara fabric in vibrant sunset orange',
        type: 'Ankara',
        country: 'Ghana',
        sellerPrice: 8,
        customerPrice: 18.99,
        price: 18.99,
        stock: 50,
        seller: seller1,
        isActive: true,
      }),
      fabricRepo.create({
        name: 'Royal Kente Cloth',
        description: 'Authentic hand-woven Kente cloth from Ghana',
        type: 'Kente',
        country: 'Ghana',
        sellerPrice: 25,
        customerPrice: 55.99,
        price: 55.99,
        stock: 20,
        seller: seller2,
        isActive: true,
      }),
      fabricRepo.create({
        name: 'Adire Indigo Fabric',
        description: 'Traditional Yoruba tie-dye indigo fabric',
        type: 'Adire',
        country: 'Nigeria',
        sellerPrice: 10,
        customerPrice: 22.99,
        price: 22.99,
        stock: 35,
        seller: seller1,
        isActive: true,
      }),
      fabricRepo.create({
        name: 'Kitenge Print - Safari',
        description: 'East African Kitenge with safari animal prints',
        type: 'Kitenge',
        country: 'Kenya',
        sellerPrice: 9,
        customerPrice: 19.99,
        price: 19.99,
        stock: 40,
        seller: seller2,
        isActive: true,
      }),
      fabricRepo.create({
        name: 'Aso-Oke Silk - Gold',
        description: 'Premium Aso-Oke with gold thread weaving',
        type: 'Aso-Oke',
        country: 'Nigeria',
        sellerPrice: 35,
        customerPrice: 79.99,
        price: 79.99,
        stock: 15,
        seller: seller1,
        isActive: true,
      }),
    ]);
    console.log('✅ Fabrics seeded');
  }

  // Seed Platform Settings
  const settingsCount = await settingsRepo.count();
  if (settingsCount === 0) {
    await settingsRepo.save(settingsRepo.create({
      key: 'default',
      platformFeeType: 'HYBRID',
      fixedFee: 10,
      percentageFee: 5,
      currency: 'USD',
      description: 'Platform fee: $10 + 5%',
      isActive: true,
    }));
    console.log('✅ Platform settings seeded');
  }

  // Seed Tax Configurations
  const taxCount = await taxRepo.count();
  if (taxCount === 0) {
    await taxRepo.save([
      taxRepo.create({ country: 'Nigeria', taxName: 'Nigeria VAT', baseTaxRate: 7.5, adminMarkupRate: 2.5, isActive: true }),
      taxRepo.create({ country: 'Kenya', taxName: 'Kenya VAT', baseTaxRate: 16, adminMarkupRate: 4, isActive: true }),
      taxRepo.create({ country: 'Ghana', taxName: 'Ghana VAT', baseTaxRate: 12.5, adminMarkupRate: 2.5, isActive: true }),
      taxRepo.create({ country: 'USA', taxName: 'US Sales Tax', baseTaxRate: 6, adminMarkupRate: 2, isActive: true }),
    ]);
    console.log('✅ Tax configurations seeded');
  }

  // Seed Payment Gateways
  const gatewayCount = await gatewayRepo.count();
  if (gatewayCount === 0) {
    await gatewayRepo.save([
      gatewayRepo.create({
        name: 'Stripe',
        provider: 'STRIPE',
        supportedCountries: ['US', 'UK', 'EU'],
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
        isActive: true,
        isPrimary: true,
        priority: 10,
      }),
      gatewayRepo.create({
        name: 'PayPal',
        provider: 'PAYPAL',
        supportedCountries: ['US', 'UK', 'EU', 'NG', 'GH', 'KE'],
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
        isActive: true,
        isPrimary: false,
        priority: 5,
      }),
    ]);
    console.log('✅ Payment gateways seeded');
  }

  // Seed Shipping Carriers
  const carrierCount = await carrierRepo.count();
  if (carrierCount === 0) {
    await carrierRepo.save([
      carrierRepo.create({
        name: 'Lagos Flat Rate',
        provider: 'FLAT_RATE',
        settings: { cost: 5, deliveryDays: '1-2' },
        supportedCountries: ['NG'],
        supportedCurrencies: ['USD', 'NGN'],
        isActive: true,
        priority: 10,
      }),
      carrierRepo.create({
        name: 'Nigeria Standard',
        provider: 'FLAT_RATE',
        settings: { cost: 8, deliveryDays: '3-5' },
        supportedCountries: ['NG'],
        supportedCurrencies: ['USD', 'NGN'],
        isActive: true,
        priority: 8,
      }),
      carrierRepo.create({
        name: 'Kenya Standard',
        provider: 'FLAT_RATE',
        settings: { cost: 7, deliveryDays: '2-4' },
        supportedCountries: ['KE'],
        supportedCurrencies: ['USD', 'KES'],
        isActive: true,
        priority: 8,
      }),
      carrierRepo.create({
        name: 'International Shipping',
        provider: 'DHL',
        settings: { cost: 15, deliveryDays: '7-14' },
        supportedCountries: ['US', 'UK', 'EU', 'NG', 'GH', 'KE'],
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
        isActive: true,
        priority: 5,
      }),
    ]);
    console.log('✅ Shipping carriers seeded');
  }

  console.log('🎉 Database seeded successfully!');
}
