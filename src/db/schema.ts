import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const chatSessions = sqliteTable("chat_sessions", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    createdAt: int("created_at", { mode: "timestamp" }).notNull(),
});

export const chatMessages = sqliteTable("chat_messages", {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
        .notNull()
        .references(() => chatSessions.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
    content: text("content").notNull(),
    createdAt: int("created_at", { mode: "timestamp" }).notNull(),
});
