import express from 'express';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/events.js';
import initDatabase from './db/initDb.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initDatabase();

// Middleware
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use('/events', eventRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'REST API with User Authentication'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
