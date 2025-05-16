import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env';

// Connection pool configuration
const connectionString = env.DATABASE_URL;
const poolSize = parseInt(env.DB_POOL_SIZE || '10', 10);
const idleTimeoutMillis = parseInt(env.DB_IDLE_TIMEOUT || '30000', 10);
const connectionTimeoutMillis = parseInt(env.DB_CONNECTION_TIMEOUT || '2000', 10);

// Create connection pool
const client = postgres(connectionString, {
  max: poolSize,
  idle_timeout: idleTimeoutMillis,
  connect_timeout: connectionTimeoutMillis,
  prepare: false, // Disable prepared statements for better performance
  debug: process.env.NODE_ENV === 'development'
});

// Create drizzle instance with connection pool
export const db = drizzle(client);

// Export client for direct pool access if needed
export { client as pool };

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await client.end();
  process.exit(0);
}); 