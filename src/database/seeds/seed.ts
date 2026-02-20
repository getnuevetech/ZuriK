import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export async function runSeed(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository('User');

  console.log('🌱 Seeding database...');

  const userCount = await userRepo.count();
  if (userCount === 0) {
    const hash = async (p: string) => bcrypt.hash(p, 10);
    const defaultPassword = await hash('Password123!');

    await userRepo.save([
      userRepo.create({
        email: 'admin@africanfashion.com',
        password: defaultPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      }),
      userRepo.create({
        email: 'designer@africanfashion.com',
        password: defaultPassword,
        firstName: 'Designer',
        lastName: 'User',
        role: 'designer',
        isActive: true,
      }),
      userRepo.create({
        email: 'seller@africanfashion.com',
        password: defaultPassword,
        firstName: 'Seller',
        lastName: 'User',
        role: 'fabric_seller',
        isActive: true,
      }),
      userRepo.create({
        email: 'qa@africanfashion.com',
        password: defaultPassword,
        firstName: 'QA',
        lastName: 'User',
        role: 'qa',
        isActive: true,
      }),
      userRepo.create({
        email: 'customer@africanfashion.com',
        password: defaultPassword,
        firstName: 'Customer',
        lastName: 'User',
        role: 'customer',
        isActive: true,
      }),
    ]);

    console.log('✅ Users seeded');
  } else {
    console.log('ℹ️  Users already exist, skipping seed');
  }

  console.log('🎉 Database seeded successfully!');
}

