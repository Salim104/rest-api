import express from 'express';
import { authenticateToken } from '../util/auth.js';
import upload from '../util/upload.js';
import { Event } from '../models/event.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event with image upload (protected)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    
    // Clean up form field names (trim whitespace)
    const cleanBody = {};
    Object.keys(req.body).forEach(key => {
      cleanBody[key.trim()] = req.body[key];
    });
    
    console.log('Cleaned body:', cleanBody);
    
    // Check if required fields are provided
    if (!cleanBody.title || !cleanBody.description || !cleanBody.date || !cleanBody.location) {
      return res.status(400).json({ 
        message: 'Missing required fields. Please provide title, description, date, and location.',
        receivedFields: Object.keys(req.body),
        cleanedFields: Object.keys(cleanBody)
      });
    }
    
    // Build event data from request
    const eventData = {
      title: cleanBody.title,
      description: cleanBody.description,
      date: cleanBody.date,
      location: cleanBody.location,
      createdBy: req.user.id
    };
    
    // If image was uploaded, add the URL to eventData
    if (req.file) {
      console.log('Image file uploaded:', req.file);
      // Generate relative path for the image URL
      const imageUrl = `/images/${req.file.filename}`;
      console.log('Generated image URL:', imageUrl);
      eventData.imageUrl = imageUrl;
    } else {
      console.log('No image file uploaded');
    }
    
    console.log('Event data before creation:', eventData);
    const newEvent = await Event.create(eventData);
    console.log('New event created:', newEvent);
    
    res.status(201).json(newEvent);
  } catch (error) {
    // If there was an error and file was uploaded, delete it
    if (req.file) {
      console.log('Error occurred, deleting uploaded file:', req.file.path);
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error creating event:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update event with image upload (protected - only creator)
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    console.log('Update file:', req.file);
    
    // Clean up form field names (trim whitespace)
    const cleanBody = {};
    Object.keys(req.body).forEach(key => {
      cleanBody[key.trim()] = req.body[key];
    });
    
    console.log('Cleaned update body:', cleanBody);
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Convert IDs to numbers for comparison (SQLite may return strings)
    const eventCreatorId = Number(event.createdBy);
    const currentUserId = Number(req.user.id);

    // Check if the user is the creator of the event
    if (eventCreatorId !== currentUserId) {
      return res.status(403).json({ 
        message: 'Not authorized to update this event. Only the creator can update it.'
      });
    }

    // Prepare update data
    const eventData = {
      title: cleanBody.title,
      description: cleanBody.description,
      date: cleanBody.date,
      location: cleanBody.location
    };

    // If a new image was uploaded, update the image URL
    if (req.file) {
      console.log('New image uploaded for update:', req.file);
      // Generate relative path for the image URL
      const imageUrl = `/images/${req.file.filename}`;
      console.log('Generated new image URL:', imageUrl);
      eventData.imageUrl = imageUrl;
      
      // If there was an old image, delete it
      if (event.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', 'public', event.imageUrl);
        console.log('Attempting to delete old image at:', oldImagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Old image deleted successfully');
        } else {
          console.log('Old image file not found');
        }
      }
    } else {
      console.log('No new image uploaded for update');
    }

    console.log('Updating event with data:', eventData);
    const updatedEvent = await Event.update(req.params.id, eventData);
    console.log('Event updated:', updatedEvent);
    
    res.json(updatedEvent);
  } catch (error) {
    // If there was an error and file was uploaded, delete it
    if (req.file) {
      console.log('Error occurred, deleting uploaded file:', req.file.path);
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error updating event:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete event (protected - only creator)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Convert IDs to numbers for comparison (SQLite may return strings)
    const eventCreatorId = Number(event.createdBy);
    const currentUserId = Number(req.user.id);

    // Check if the user is the creator of the event
    if (eventCreatorId !== currentUserId) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this event. Only the creator can delete it.'
      });
    }

    // If there was an image, delete it
    if (event.imageUrl) {
      const imagePath = path.join(__dirname, '..', 'public', event.imageUrl);
      console.log('Attempting to delete image at:', imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Image deleted successfully');
      } else {
        console.log('Image file not found');
      }
    }

    await Event.delete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: error.message });
  }
});

// Register for an event (protected)
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Register user for the event
    await Event.registerUser(eventId, userId);
    
    res.status(201).json({ 
      message: 'Successfully registered for the event',
      event: event
    });
  } catch (error) {
    if (error.message.includes('already registered')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Unregister from an event (protected)
router.delete('/:id/register', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Unregister user from the event
    await Event.unregisterUser(eventId, userId);
    
    res.json({ message: 'Successfully unregistered from the event' });
  } catch (error) {
    if (error.message.includes('not registered')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get all registered users for an event (protected - only for event creator)
router.get('/:id/attendees', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only allow the event creator to see the list of registered users
    if (Number(event.createdBy) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Only the event creator can view the attendees list' });
    }

    const registeredUsers = await Event.getRegisteredUsers(eventId);
    res.json(registeredUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check registration status for the current user (protected)
router.get('/:id/registration-status', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isRegistered = await Event.isUserRegistered(eventId, userId);
    
    res.json({ 
      eventId: eventId,
      isRegistered: isRegistered
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all events the current user is registered for (protected)
router.get('/user/registrations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const registeredEvents = await Event.getUserRegisteredEvents(userId);
    
    res.json(registeredEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
