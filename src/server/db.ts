import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql: string, values: any[] = []) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.query(sql, values);
    return results;
  } finally {
    connection.release();
  }
}

const createTables = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipe_id INT NOT NULL,
        ingredient_id INT NOT NULL,
        quantity VARCHAR(255) NOT NULL,
        unit VARCHAR(255),
        FOREIGN KEY (recipe_id) REFERENCES recipes(id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ingredient_id INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(255),
        quantity INT,
        date DATE NOT NULL,
        user_id INT,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS cooking_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipe_id INT NOT NULL,
        date DATE NOT NULL,
        yield VARCHAR(255) NOT NULL,
        user_id INT,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS cooking_session_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cooking_session_id INT NOT NULL,
        ingredient_id INT NOT NULL,
        quantity VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(255) NOT NULL,
        FOREIGN KEY (cooking_session_id) REFERENCES cooking_sessions(id),
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        telegram VARCHAR(255),
        instagram VARCHAR(255),
        phone VARCHAR(255),
        address TEXT,
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source VARCHAR(255),
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(255),
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS product_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        recipe_id INT NOT NULL,
        package_id INT NOT NULL,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (recipe_id) REFERENCES recipes(id),
        FOREIGN KEY (package_id) REFERENCES packages(id)
      )
    `);

    console.log('All tables created successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

createTables().catch(err => console.error('Error initializing database:', err));

export default pool;
