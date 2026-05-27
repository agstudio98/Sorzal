const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

/**
 * Connects to MongoDB with retry logic and robust error handling.
 */
const connectDB = async (retryCount = 0) => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    logger.error('MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4 to avoid some localhost resolution issues
    });
    
    logger.success(`MongoDB Connected: ${conn.connection.host} (Port: ${conn.connection.port})`);
    
    mongoose.connection.on('error', err => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.success('MongoDB reconnected.');
    });

  } catch (error) {
    logger.error(`Error connecting to MongoDB (Attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      logger.warn(`Connection refused on port 27020. Please ensure MongoDB is running:`);
      logger.warn(`Check your service with: sudo systemctl status mongod-Sorzal`);
    }

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      setTimeout(() => connectDB(retryCount + 1), RETRY_INTERVAL);
    } else {
      logger.error('Could not establish connection to MongoDB after maximum retries. Shutting down.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
