import { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

const User = sequelize.define('User', {
  // Define attributes
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Product = sequelize.define('Product', {
  // Define attributes
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

const initDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync({ force: true }); // This creates tables

    // Seed data
    await User.bulkCreate([
      { username: 'user1', password: 'pass1' },
      { username: 'user2', password: 'pass2' }
    ]);

    await Product.bulkCreate([
      { name: 'Product 1', price: 10.99 },
      { name: 'Product 2', price: 22.99 }
    ]);

    console.log('Database initialized and data seeded successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

initDb();
