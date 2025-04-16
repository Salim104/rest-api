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
    imageUrl TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id)
  )
`);

// Check if imageUrl column exists, if not add it
const tableInfo = await db.all("PRAGMA table_info(events)");
const hasImageUrl = tableInfo.some(column => column.name === 'imageUrl');
if (!hasImageUrl) {
  try {
    await db.exec('ALTER TABLE events ADD COLUMN imageUrl TEXT');
    console.log('Added imageUrl column to events table');
  } catch (error) {
    console.error('Error adding imageUrl column:', error.message);
  }
}

// Create event registrations table if it doesn't exist
await db.exec(`
  CREATE TABLE IF NOT EXISTS event_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    registeredAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(eventId, userId)
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
    const { title, description, date, location, createdBy, imageUrl } = eventData;
    
    if (!createdBy) {
      throw new Error('createdBy is required');
    }

    const result = await db.run(
      'INSERT INTO events (title, description, date, location, createdBy, imageUrl) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, date, location, createdBy, imageUrl || null]
    );
    
    const newEvent = await this.findById(result.lastID);
    return newEvent;
  },

  // Update event
  async update(id, eventData) {
    const { title, description, date, location, imageUrl } = eventData;
    
    // Get current event data to fill in any missing fields
    const currentEvent = await this.findById(id);
    if (!currentEvent) {
      throw new Error('Event not found');
    }
    
    // Only update the image if a new one is provided
    const updatedImageUrl = imageUrl !== undefined ? imageUrl : currentEvent.imageUrl;
    
    await db.run(
      'UPDATE events SET title = ?, description = ?, date = ?, location = ?, imageUrl = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [
        title || currentEvent.title,
        description || currentEvent.description,
        date || currentEvent.date,
        location || currentEvent.location,
        updatedImageUrl,
        id
      ]
    );
    
    return await this.findById(id);
  },

  // Delete event
  async delete(id) {
    await db.run('DELETE FROM events WHERE id = ?', id);
  },

  // Register user for an event
  async registerUser(eventId, userId) {
    try {
      await db.run(
        'INSERT INTO event_registrations (eventId, userId) VALUES (?, ?)',
        [eventId, userId]
      );
      return { success: true };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('User is already registered for this event');
      }
      throw error;
    }
  },

  // Unregister user from an event
  async unregisterUser(eventId, userId) {
    const result = await db.run(
      'DELETE FROM event_registrations WHERE eventId = ? AND userId = ?',
      [eventId, userId]
    );
    if (result.changes === 0) {
      throw new Error('User is not registered for this event');
    }
    return { success: true };
  },

  // Get all users registered for an event
  async getRegisteredUsers(eventId) {
    return await db.all(`
      SELECT u.id, u.username, u.email, er.registeredAt
      FROM event_registrations er
      JOIN users u ON er.userId = u.id
      WHERE er.eventId = ?
    `, eventId);
  },

  // Check if user is registered for an event
  async isUserRegistered(eventId, userId) {
    const registration = await db.get(
      'SELECT * FROM event_registrations WHERE eventId = ? AND userId = ?',
      [eventId, userId]
    );
    return !!registration;
  },

  // Get all events user is registered for
  async getUserRegisteredEvents(userId) {
    return await db.all(`
      SELECT e.*, er.registeredAt
      FROM event_registrations er
      JOIN events e ON er.eventId = e.id
      WHERE er.userId = ?
    `, userId);
  }
}; 