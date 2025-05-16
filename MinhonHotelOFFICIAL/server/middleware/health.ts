import { Request, Response } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { cacheService } from '../utils/cache';

export async function healthCheck(req: Request, res: Response) {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {
      database: 'unknown',
      cache: 'unknown',
      memory: {
        total: process.memoryUsage().heapTotal,
        used: process.memoryUsage().heapUsed
      }
    }
  };

  try {
    // Check database
    await db.execute(sql`SELECT 1`);
    health.services.database = 'OK';
  } catch (error) {
    health.services.database = 'ERROR';
    health.status = 'ERROR';
  }

  try {
    // Check cache
    await cacheService.set('health-check', 'ok', 1000);
    const cacheResult = await cacheService.get('health-check');
    health.services.cache = cacheResult === 'ok' ? 'OK' : 'ERROR';
  } catch (error) {
    health.services.cache = 'ERROR';
    health.status = 'ERROR';
  }

  res.status(health.status === 'OK' ? 200 : 503).json(health);
}

export async function detailedHealthCheck(req: Request, res: Response) {
  const detailedHealth = {
    ...await getBasicHealth(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      ...process.memoryUsage(),
      external: process.memoryUsage().external
    },
    cpu: process.cpuUsage(),
    activeRequests: (global as any).activeRequests || 0,
    lastError: (global as any).lastError || null
  };

  res.status(200).json(detailedHealth);
}

async function getBasicHealth() {
  return {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {
      database: 'unknown',
      cache: 'unknown'
    }
  };
} 