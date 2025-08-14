/**
 * Main Application Entry Point
 * Clean Architecture Inventory Management System
 */
import dotenv from 'dotenv';
import { Application } from './presentation/Application.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

async function startApplication() {
  try {
    const app = new Application();
    const port = process.env.PORT || 3000;
    
    await app.start(port);
    
    console.log(`
    🚀 Inventory Management API is running!
    
    🌐 Server: http://localhost:${port}
    📚 Environment: ${process.env.NODE_ENV || 'development'}
    🗄️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}
    📖 Health Check: http://localhost:${port}/health
    
    Press Ctrl+C to stop the server
    `);
    
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

startApplication();
