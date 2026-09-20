import rateLimit from 'express-rate-limit';

const windowMs = process.env.RATE_LIMIT_WINDOW_MS 
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) 
  : 60 * 1000; // 1 minute default

const max = process.env.RATE_LIMIT_MAX 
  ? parseInt(process.env.RATE_LIMIT_MAX, 10) 
  : 100; // 100 requests default

console.log('RATE LIMIT CONFIG:', { windowMs, max });

export const apiRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
    },
  },
  handler: (req, res, next, options) => {
    res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000));
    res.status(429).json(options.message);
  }
});
