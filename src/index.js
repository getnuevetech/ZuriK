const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get products
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get fabrics
app.get('/fabrics', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fabrics ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get designers
app.get('/designers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM designers ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Initialize database
async function initDatabase() {
  try {
    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        active BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create fabrics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fabrics (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        width VARCHAR(100),
        price DECIMAL(10, 2),
        origin VARCHAR(100),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create designers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS designers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        specialty VARCHAR(255),
        bio TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed data if empty
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    if (productCount.rows[0].count == 0) {
      await pool.query(`
        INSERT INTO products (name, description, price, active) VALUES
        ('Ankara Fabric Bundle', 'Premium quality Ankara fabric', 45.99, true),
        ('Kente Cloth', 'Traditional Kente weaving', 89.99, true),
        ('Adire Indigo Dye', 'Authentic Adire indigo fabric', 52.50, true),
        ('Bogolan Mud Cloth', 'Traditional Bogolan pattern', 67.99, true)
      `);
      console.log('✅ Products seeded');
    }

    const fabricCount = await pool.query('SELECT COUNT(*) FROM fabrics');
    if (fabricCount.rows[0].count == 0) {
      await pool.query(`
        INSERT INTO fabrics (name, type, width, price, origin) VALUES
        ('100% Cotton Ankara', 'Ankara', '45 inches', 12.99, 'Ghana'),
        ('Silk Blend Kente', 'Kente', '36 inches', 25.50, 'Ghana'),
        ('Pure Adire Cotton', 'Adire', '45 inches', 15.99, 'Nigeria')
      `);
      console.log('✅ Fabrics seeded');
    }

    const designerCount = await pool.query('SELECT COUNT(*) FROM designers');
    if (designerCount.rows[0].count == 0) {
      await pool.query(`
        INSERT INTO designers (name, country, specialty, bio) VALUES
        ('Stella Jean', 'Haiti/Italy', 'Contemporary African Fashion', 'Stella Jean brings African aesthetics to modern design'),
        ('Tunde Ajakaiye', 'Nigeria', 'Traditional & Contemporary', 'Master of Ankara and luxury African wear'),
        ('Ozwald Boateng', 'Ghana', 'Luxury Tailoring', 'High-end bespoke African fashion')
      `);
      console.log('✅ Designers seeded');
    }

    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  }
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initDatabase();
});
