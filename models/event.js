import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Initialize database connection
const db = await open({
  filename: './database.sqlite',
  driver: sqlite3.Database
});

// Create events table if it doesn't exist
await db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    createdBy INTEGER NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id)
  )
`);

export const Event = {
  // Get all events
  async findAll() {
    return await db.all('SELECT * FROM events');
  },

  // Get event by id
  async findById(id) {
    return await db.get('SELECT * FROM events WHERE id = ?', id);
  },

  // Create new event
  async create(eventData) {
    console.log('Creating event with data:', eventData); // Debug log
    const { title, description, date, location, createdBy } = eventData;
    
    if (!createdBy) {
      throw new Error('createdBy is required');
    }

    const result = await db.run(
      'INSERT INTO events (title, description, date, location, createdBy) VALUES (?, ?, ?, ?, ?)',
      [title, description, date, location, createdBy]
    );
    
    const newEvent = await this.findById(result.lastID);
    return newEvent;
  },

  // Update event
  async update(id, eventData) {
    const { title, description, date, location } = eventData;
    await db.run(
      'UPDATE events SET title = ?, description = ?, date = ?, location = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, date, location, id]
    );
    return await this.findById(id);
  },

  // Delete event
  async delete(id) {
    await db.run('DELETE FROM events WHERE id = ?', id);
  }
}; 