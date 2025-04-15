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

export default router;
