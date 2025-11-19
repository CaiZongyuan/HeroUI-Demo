import { atom } from "jotai";
import { chatSessions } from "../db/schema";

export type ChatSession = typeof chatSessions.$inferSelect;

export const currentSessionIdAtom = atom<string | null>(null);
export const sessionsAtom = atom<ChatSession[]>([]);
