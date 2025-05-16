import { sql } from 'drizzle-orm';
import { db } from '../pool';

export async function up() {
  // Index cho bảng request
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_request_room_number ON request(room_number);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_request_status ON request(status);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_request_created_at ON request(created_at);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_request_room_status ON request(room_number, status);`);

  // Index cho bảng transcript
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_transcript_call_id ON transcript(call_id);`);

  // Index cho bảng call_summary
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_call_summary_timestamp ON call_summary(timestamp);`);
}

export async function down() {
  await db.execute(sql`DROP INDEX IF EXISTS idx_request_room_number;`);
  await db.execute(sql`DROP INDEX IF EXISTS idx_request_status;`);
  await db.execute(sql`DROP INDEX IF EXISTS idx_request_created_at;`);
  await db.execute(sql`DROP INDEX IF EXISTS idx_request_room_status;`);
  await db.execute(sql`DROP INDEX IF EXISTS idx_transcript_call_id;`);
  await db.execute(sql`DROP INDEX IF EXISTS idx_call_summary_timestamp;`);
}

export default { up, down }; 