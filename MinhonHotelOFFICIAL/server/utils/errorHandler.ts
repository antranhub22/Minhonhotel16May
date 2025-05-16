import { Response } from 'express';

export function handleApiError(res: Response, error: unknown, message: string): void {
  console.error(message, error);
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage 
  });
} 