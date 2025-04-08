import db from '../db/dbService.js';

// Get all events from the database
const getAllEvents = () => {
  try {
    const stmt = db.prepare('SELECT * FROM events');
    return stmt.all();
  } catch (error) {
    console.error('Error getting all events:', error.message);
    throw error;
  }
};

// Get a single event by ID
const getEventById = (id) => {
  try {
    const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
    return stmt.get(id);
  } catch (error) {
    console.error('Error getting event by id:', error.message);
    throw error;
  }
};

// Create a new event
const createEvent = (eventData) => {
  try {
    const { title, description, location, date, time, organizer } = eventData;
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO events (id, title, description, location, date, time, organizer, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, title, description, location, date, time, organizer, createdAt);
    
    return {
      id,
      title,
      description,
      location,
      date,
      time,
      organizer,
      createdAt
    };
  } catch (error) {
    console.error('Error creating event:', error.message);
    throw error;
  }
};

// Update an event by ID
const updateEvent = (id, eventData) => {
  try {
    // Check if event exists first
    const existingEvent = getEventById(id);
    if (!existingEvent) {
      return null;
    }
    
    const { title, description, location, date, time, organizer } = eventData;
    
    // Update fields that are provided
    const updates = {};
    const params = [];
    
    if (title !== undefined) {
      updates.title = '?';
      params.push(title);
    }
    
    if (description !== undefined) {
      updates.description = '?';
      params.push(description);
    }
    
    if (location !== undefined) {
      updates.location = '?';
      params.push(location);
    }
    
    if (date !== undefined) {
      updates.date = '?';
      params.push(date);
    }
    
    if (time !== undefined) {
      updates.time = '?';
      params.push(time);
    }
    
    if (organizer !== undefined) {
      updates.organizer = '?';
      params.push(organizer);
    }
    
    // If no fields to update
    if (Object.keys(updates).length === 0) {
      return existingEvent;
    }
    
    // Create update statement
    const updateFields = Object.keys(updates).map(key => `${key} = ${updates[key]}`).join(', ');
    params.push(id); // Add id as the last parameter
    
    const updateStmt = db.prepare(`UPDATE events SET ${updateFields} WHERE id = ?`);
    updateStmt.run(...params);
    
    // Return the updated event
    return getEventById(id);
  } catch (error) {
    console.error('Error updating event:', error.message);
    throw error;
  }
};

// Delete an event by ID
const deleteEvent = (id) => {
  try {
    // Check if event exists first
    const existingEvent = getEventById(id);
    if (!existingEvent) {
      return false;
    }
    
    // Delete the event
    const deleteStmt = db.prepare('DELETE FROM events WHERE id = ?');
    deleteStmt.run(id);
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error.message);
    throw error;
  }
};

export { 
  getAllEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent 
}; 