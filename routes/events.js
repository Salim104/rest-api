import express from 'express';
import { authenticateToken } from '../util/auth.js';
import { Event } from '../models/event.js';

const router = express.Router();

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

// Create event (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      createdBy: req.user.id
    };
    
    const newEvent = await Event.create(eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update event (protected - only creator)
router.put('/:id', authenticateToken, async (req, res) => {
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
        message: 'Not authorized to update this event. Only the creator can update it.',
        eventCreator: eventCreatorId,
        currentUser: currentUserId
      });
    }

    const eventData = {
      title: req.body.title || event.title,
      description: req.body.description || event.description,
      date: req.body.date || event.date,
      location: req.body.location || event.location
    };

    const updatedEvent = await Event.update(req.params.id, eventData);
    res.json(updatedEvent);
  } catch (error) {
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
        message: 'Not authorized to delete this event. Only the creator can delete it.',
        eventCreator: eventCreatorId,
        currentUser: currentUserId
      });
    }

    await Event.delete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
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
