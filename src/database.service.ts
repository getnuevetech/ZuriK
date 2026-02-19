import { Client } from 'pg';

const client = new Client({
  user: 'your-username',
  host: 'localhost',
  database: 'your-database',
  password: 'your-password',
  port: 5432,
});

async function createTables() {
  await client.connect();

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `;

  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      description TEXT,
      imageUrl VARCHAR(255)
    )
  `;

  await client.query(createUsersTable);
  await client.query(createProductsTable);
  console.log('Tables created successfully');
}

async function seedData() {
  const seedUsers = `
    INSERT INTO users (name, email, password) VALUES 
    ('John Doe', 'john@example.com', 'password123'),
    ('Jane Smith', 'jane@example.com', 'password456')
    ON CONFLICT (email) DO NOTHING;
  `;

  const seedProducts = `
    INSERT INTO products (name, price, description, imageUrl) VALUES 
    ('T-shirt', 19.99, 'Comfortable cotton t-shirt', 'https://example.com/tshirt.jpg'),
    ('Jeans', 39.99, 'Stylish blue jeans', 'https://example.com/jeans.jpg')
    ON CONFLICT (name) DO NOTHING;
  `;

  await client.query(seedUsers);
  await client.query(seedProducts);
  console.log('Seed data inserted successfully');
}

async function main() {
  await createTables();
  await seedData();
  await client.end();
}

main().catch(err => console.error(err));