const express = require('express');
const { Sequelize } = require('sequelize');
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Sequelize
const sequelize = new Sequelize('sqlite::memory:'); // Adjust to your preferred database

// Define your models
const Item = sequelize.define('Item', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    }
});

// Create tables and seed data on startup
const initializeDatabase = async () => {
    await sequelize.sync({ force: true }); // Creates the tables
    console.log('Database & tables created!');

    // Seed data
    await Item.bulkCreate([
        { name: 'Dress', description: 'A beautiful dress' },
        { name: 'Hat', description: 'Stylish hat' },
        { name: 'Bag', description: 'Trendy bag' }
    ]);
    console.log('Sample data seeded!');
};

app.get('/', (req, res) => {
    res.send('Welcome to the African Fashion E-commerce API');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    initializeDatabase();
});
