import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../utils/cache';

export interface CacheOptions {
  ttl?: number;
  key?: string;
  excludeQueryParams?: string[];
}

export function cache(options: CacheOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = options.key || generateCacheKey(req, options.excludeQueryParams);

    try {
      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        return res.json(cachedData);
      }

      // If not in cache, modify res.json to cache the response
      const originalJson = res.json;
      res.json = function(data: any) {
        cacheService.set(cacheKey, data, options.ttl);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

function generateCacheKey(req: Request, excludeParams?: string[]): string {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const queryParams = new URLSearchParams(url.search);
  
  // Remove excluded query parameters
  if (excludeParams) {
    excludeParams.forEach(param => queryParams.delete(param));
  }

  // Sort query parameters for consistent cache keys
  const sortedParams = Array.from(queryParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${req.path}:${sortedParams}`;
} 