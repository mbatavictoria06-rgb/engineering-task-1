import express from 'express';
import cors from 'cors';
import { v1Router } from './routes/index';
import { apiRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Trust Render's reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors({ methods: ['GET'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all API routes
app.use('/api', apiRateLimiter);

// API Routes
app.use('/api/v1', v1Router);

// Error Handling (Must be last)
app.use(errorHandler);

export default app;
