import { Database } from 'some-database-library';

class DatabaseService {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  public async createTables(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL
      );
    `;
    await this.db.query(createTableQuery);
  }

  public async seedData(): Promise<void> {
    const seedUsersQuery = `
      INSERT INTO users (name, email) VALUES
      ('Alice', 'alice@example.com'),
      ('Bob', 'bob@example.com');
    `;

    const seedProductsQuery = `
      INSERT INTO products (title, description, price) VALUES
      ('Product 1', 'Description for product 1', 29.99),
      ('Product 2', 'Description for product 2', 49.99);
    `;

    await this.db.query(seedUsersQuery);
    await this.db.query(seedProductsQuery);
  }
}

export default DatabaseService;