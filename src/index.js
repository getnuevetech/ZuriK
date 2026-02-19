const express = require('express');
const { Pool } = require('pg');
const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Get all products
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products;');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all fabrics
app.get('/fabrics', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fabrics;');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching fabrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all designers
app.get('/designers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM designers;');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching designers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});