import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const documentsTable = pgTable("documents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  description: text(),
  dueDate: timestamp(),
  folderId: integer().references(() => foldersTable.id),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const foldersTable = pgTable("folders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});
