const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const ApiResponse = require('./utils/apiResponse');
const connectDB = require('./config/db');
const autoSeed = require('./config/seeder');
const { startAISeederJob } = require('./jobs/aiSeederJob');
const { purgeIncompletePosts } = require('./controllers/postController');
const routes = require('./routes');

// Load environment variables
dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet()); // Basic security headers
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static Files
app.use('/uploads', express.static('uploads'));

// Serve Frontend in production
if (process.env.NODE_ENV === 'production' || true) { // Force for now as per user request to run from backend URL
  const frontendPath = path.join(__dirname, '../FrontEnd/dist');
  app.use(express.static(frontendPath));
  
  // All other routes should serve the frontend's index.html
  app.get('{/*path}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Health Check
app.get('/api/health', (req, res) => {
  ApiResponse.success(res, { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }, 'Sorzal API is healthy');
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  ApiResponse.error(res, `Route ${req.originalUrl} not found`, 404);
});

// Global Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`[Error Handler] ${err.message}\n${err.stack}`);
  
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  
  ApiResponse.error(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
});

const PORT = process.env.PORT || 5000;

/**
 * Robust Server Initialization Sequence
 */
const startServer = async () => {
  try {
    // 1. Database Connection
    await connectDB();
    
    // 2. Data Initialization
    await autoSeed();
    await purgeIncompletePosts();
    
    // 3. Background Jobs
    startAISeederJob();
    
    // 4. Listen
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Sorzal Server operating on http://0.0.0.0:${PORT}`);
      logger.info(`API Documentation health check: http://0.0.0.0:${PORT}/api/health`);
    });

    // Graceful Shutdown
    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed. Closing database connection...');
        mongoose.connection.close(false, () => {
          logger.info('Database connection closed. Process exit.');
          process.exit(0);
        });
      });
      
      // If server doesn't close in 10s, force exit
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error(`Critical error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
