import express from 'express';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent } from '../controllers/eventController.js';

const router = express.Router();

// GET all events
router.get('/', getEvents);

// GET single event by ID
router.get('/:id', getEventById);

// POST create a new event
router.post('/', createEvent);

// PUT update an event by ID
router.put('/:id', updateEvent);

// DELETE an event by ID
router.delete('/:id', deleteEvent);

export default router;
