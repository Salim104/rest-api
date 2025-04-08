import sqlite3 from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

// Get directory path using ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set database path
const dbPath = path.join(__dirname, 'data', 'users.db');

// Create database connection
const db = sqlite3(dbPath, { verbose: console.log });

// Export database instance
export default db; 