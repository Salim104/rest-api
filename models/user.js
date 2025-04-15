import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Initialize database connection
const db = await open({
  filename: './database.sqlite',
  driver: sqlite3.Database
});

// Create users table if it doesn't exist
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export const User = {
  // Find user by email
  async findByEmail(email) {
    return await db.get('SELECT * FROM users WHERE email = ?', email);
  },

  // Find user by id
  async findById(id) {
    return await db.get('SELECT * FROM users WHERE id = ?', id);
  },

  // Create new user
  async create(userData) {
    const { username, email, password } = userData;
    const result = await db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return { id: result.lastID, ...userData };
  },

  // Update user
  async update(id, userData) {
    const { username, email, password } = userData;
    await db.run(
      'UPDATE users SET username = ?, email = ?, password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [username, email, password, id]
    );
    return await this.findById(id);
  },

  // Delete user
  async delete(id) {
    await db.run('DELETE FROM users WHERE id = ?', id);
  }
}; 