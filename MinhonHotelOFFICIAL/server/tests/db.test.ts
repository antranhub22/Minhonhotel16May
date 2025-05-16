import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { db } from '../db/pool';
import { request } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('Database Tests', () => {
  beforeAll(async () => {
    // Ensure database is ready
    await db.execute(sql`SELECT 1`);
  });

  afterAll(async () => {
    // Clean up
    await db.execute(sql`TRUNCATE TABLE request CASCADE`);
  });

  it('should create a new request', async () => {
    const newRequest = {
      room_number: '101',
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.insert(request).values(newRequest).returning();
    expect(result[0]).toMatchObject({
      room_number: '101',
      status: 'pending'
    });
  });

  it('should find request by room number', async () => {
    const requests = await db
      .select()
      .from(request)
      .where(eq(request.room_number, '101'));

    expect(requests.length).toBeGreaterThan(0);
    expect(requests[0].room_number).toBe('101');
  });

  it('should update request status', async () => {
    const updated = await db
      .update(request)
      .set({ status: 'completed' })
      .where(eq(request.room_number, '101'))
      .returning();

    expect(updated[0].status).toBe('completed');
  });
}); 