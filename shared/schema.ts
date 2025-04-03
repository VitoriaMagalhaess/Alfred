import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Definição das tabelas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  profilePicture: text("profile_picture"),
  role: text("role").default("user"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("medium"), // low, medium, high
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  priority: text("priority").default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email"),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull(), // email, whatsapp, etc.
  read: boolean("read").default(false),
  receivedAt: timestamp("received_at").defaultNow(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  amount: text("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  category: text("category"),
  paid: boolean("paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Esquemas de inserção
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  profilePicture: true,
  role: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  completed: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  userId: true,
  title: true,
  description: true,
  location: true,
  startDate: true,
  endDate: true,
  priority: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  senderName: true,
  senderEmail: true,
  subject: true,
  content: true,
  source: true,
  read: true,
});

export const insertBillSchema = createInsertSchema(bills).pick({
  userId: true,
  name: true,
  description: true,
  amount: true,
  dueDate: true,
  category: true,
  paid: true,
});

// Tipos
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;