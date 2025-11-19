import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { desc, eq, isNull } from "drizzle-orm";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Drawer } from "expo-router/drawer";
import * as SQLite from "expo-sqlite";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import migrations from "../../../drizzle/migrations";
import { db } from "../../db/client";
import { chatSessions } from "../../db/schema";
import { currentSessionIdAtom, sessionsAtom } from "../../store/chat-session";

const dbName = SQLite.openDatabaseSync("db.db");

export default function ChatbotLayout() {
  const { success, error } = useMigrations(db, migrations);
  const [sessions, setSessions] = useAtom(sessionsAtom);
  const [currentSessionId, setCurrentSessionId] = useAtom(currentSessionIdAtom);
  useDrizzleStudio(dbName)

  useEffect(() => {
    if (!success) return;

    const loadSessions = async () => {
      try {
        const result = await db
          .select()
          .from(chatSessions)
          .where(isNull(chatSessions.deletedAt))
          .orderBy(desc(chatSessions.createdAt));
        setSessions(result);
        
        // Select the most recent session if none selected
        if (!currentSessionId && result.length > 0) {
          setCurrentSessionId(result[0].id);
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    };

    loadSessions();
  }, [success, setSessions, currentSessionId, setCurrentSessionId]);

  const createNewSession = async () => {
    const newId = Math.random().toString(36).substring(7);
    const newSession = {
      id: newId,
      title: `New Chat ${new Date().toLocaleTimeString()}`,
      createdAt: new Date(),
      deletedAt: null,
    };

    try {
      await db.insert(chatSessions).values(newSession);
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newId);
    } catch (e) {
      console.error("Failed to create session", e);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await db
        .update(chatSessions)
        .set({ deletedAt: new Date() })
        .where(eq(chatSessions.id, id));
      
      setSessions((prev) => prev.filter((s) => s.id !== id));
      
      if (currentSessionId === id) {
        setCurrentSessionId(null);
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Migration Error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Setting up database...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={({ navigation }) => ({
          headerShown: true,
          swipeEnabled: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={createNewSession}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="add" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
        drawerContent={(props) => (
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            {sessions.map((session) => (
              <View key={session.id} style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                <DrawerItem
                  label={session.title}
                  focused={session.id === currentSessionId}
                  onPress={() => {
                    setCurrentSessionId(session.id);
                    props.navigation.dispatch(DrawerActions.closeDrawer());
                  }}
                  style={{ flex: 1 }}
                />
                <TouchableOpacity 
                  onPress={() => deleteSession(session.id)}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </DrawerContentScrollView>
        )}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "Chatbot",
            drawerLabel: "Current Chat",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
