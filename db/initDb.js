import db from './dbService.js';

// Initialize database with required tables
const initDatabase = () => {
  // Create users table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);
  
  // Create events table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT,
      date TEXT NOT NULL,
      time TEXT,
      organizer TEXT,
      createdAt TEXT NOT NULL
    )
  `);
  
  console.log('Database initialized successfully');
};

export default initDatabase; 