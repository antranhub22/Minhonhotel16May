import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  callId: text("call_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertTranscriptSchema = createInsertSchema(transcripts).pick({
  callId: true,
  role: true,
  content: true,
});

// Define valid order statuses
export const OrderStatus = {
  PENDING: 'pending',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in_progress',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  NOTE: 'note'
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

// Validate order status
export const orderStatusSchema = z.enum([
  OrderStatus.PENDING,
  OrderStatus.ACKNOWLEDGED,
  OrderStatus.IN_PROGRESS,
  OrderStatus.DELIVERING,
  OrderStatus.COMPLETED,
  OrderStatus.NOTE
]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  callId: text("call_id").notNull(),
  roomNumber: text("room_number").notNull(),
  orderType: text("order_type").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  specialInstructions: text("special_instructions"),
  items: jsonb("items").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default(OrderStatus.PENDING),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const callSummaries = pgTable("call_summaries", {
  id: serial("id").primaryKey(),
  callId: text("call_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  roomNumber: text("room_number"),
  duration: text("duration"),
});

export const insertCallSummarySchema = createInsertSchema(callSummaries).pick({
  callId: true,
  content: true,
  timestamp: true,
  roomNumber: true,
  duration: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  callId: true,
  roomNumber: true,
  orderType: true,
  deliveryTime: true,
  specialInstructions: true,
  items: true,
  totalAmount: true,
});

// Define relations between tables
export const transcriptsRelations = relations(transcripts, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  transcripts: many(transcripts),
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcripts.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertCallSummary = z.infer<typeof insertCallSummarySchema>;
export type CallSummary = typeof callSummaries.$inferSelect;
