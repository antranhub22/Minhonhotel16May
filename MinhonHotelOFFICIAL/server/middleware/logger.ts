import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Log request
  logger.info({
    type: 'request',
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Track response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      type: 'response',
      requestId,
      statusCode: res.statusCode,
      duration,
      method: req.method,
      path: req.path
    });
  });

  next();
}

// Error logging middleware
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error({
    type: 'error',
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      ip: req.ip
    }
  });

  next(err);
}

// Export logger instance for direct use
export { logger }; 