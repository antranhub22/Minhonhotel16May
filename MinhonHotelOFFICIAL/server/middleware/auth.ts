import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: any;
}

// Fallback JWT secret for development
const FALLBACK_JWT_SECRET = 'minhon_mui_ne_development_secret_key';

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || FALLBACK_JWT_SECRET;
    
    // Log for debugging but don't expose the secret
    console.log('Verifying JWT with secret:', secret === FALLBACK_JWT_SECRET ? 'FALLBACK_SECRET' : 'ENV_SECRET');
    
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    // Gắn payload lên request để sử dụng ở các middleware/route sau
    (req as any).user = payload;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
} 