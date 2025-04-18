import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import initDatabase from './db/initDb.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Initialize database
initDatabase();

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Allow specified frontend or any origin during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Allow cookies and credentials
  maxAge: 86400 // Cache preflight requests for 24 hours
};

// Middleware
app.use(cors(corsOptions));

// JSON and URL-encoded body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced static file serving for public directory
// This serves all files in the public directory
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // Cache static files for 1 day
  etag: true,   // Enable ETags for caching
  lastModified: true // Enable Last-Modified headers
}));

// Dedicated route for images with specific cache settings
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  maxAge: '7d', // Cache images for 7 days
  immutable: true, // Indicates the file won't change during cache lifetime
  setHeaders: (res, path) => {
    // Set additional headers for images
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    // Set proper content type based on file extension
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 5000;

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'REST API with User Authentication'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`CORS enabled for: ${corsOptions.origin}`);
  console.log(`Static files served from: ${path.join(__dirname, 'public')}`);
  console.log(`Images available at: http://localhost:${PORT}/images/`);
});
