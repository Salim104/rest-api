import { 
  getAllEvents, 
  getEventById as getEventByIdFromModel, 
  createEvent as createEventInModel, 
  updateEvent as updateEventInModel, 
  deleteEvent as deleteEventInModel 
} from '../models/eventModel.js';

// Get all events
export const getEvents = (req, res) => {
  try {
    const events = getAllEvents();
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single event by ID
export const getEventById = (req, res) => {
  try {
    const { id } = req.params;
    
    const event = getEventByIdFromModel(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new event
export const createEvent = (req, res) => {
  try {
    const { title, description, location, date, time, organizer } = req.body;
    
    // Basic validation
    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description and date'
      });
    }
    
    const newEvent = createEventInModel({ title, description, location, date, time, organizer });
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update an event by ID
export const updateEvent = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, date, time, organizer } = req.body;
    
    const updatedEvent = updateEventInModel(id, { title, description, location, date, time, organizer });
    
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete an event by ID
export const deleteEvent = (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = deleteEventInModel(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 