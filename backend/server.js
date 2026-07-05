require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Database connection and seeding omitted for in-memory setup in Week 4


// Configure CORS to allow access from the frontend
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Built-in body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log incoming requests in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'CropMax AI Backend Service is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// Import Crop Routes
const cropRouter = require('./routes/crops');
app.use('/api/crops', cropRouter);

// Catch-all route for unmatched paths (404 Not Found)
app.use((req, res, next) => {
  const err = new Error(`Cannot ${req.method} ${req.url}`);
  err.status = 404;
  next(err);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`[Error Handler] Status ${status}: ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🌾 CropMax AI Backend Server Started`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed Origin: ${FRONTEND_URL}`);
  console.log(`==================================================`);
});

// Handle termination signals gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
