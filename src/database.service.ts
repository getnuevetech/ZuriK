// src/database.service.ts

import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Product } from './entities/Product';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'your_username',
    password: 'your_password',
    database: 'your_database',
    entities: [User, Product],
    synchronize: true,
});

const seedDatabase = async () => {
    await AppDataSource.initialize();
    console.log('Database initialized');

    const userRepository = AppDataSource.getRepository(User);
    const productRepository = AppDataSource.getRepository(Product);

    // Seed Users
    const user1 = new User();
    user1.name = 'John Doe';
    user1.email = 'john.doe@example.com';
    await userRepository.save(user1);

    // Seed Products
    const product1 = new Product();
    product1.name = 'African Shirt';
    product1.price = 20.99;
    await productRepository.save(product1);

    console.log('Database seeded');
};

seedDatabase().catch(error => console.log(error));
