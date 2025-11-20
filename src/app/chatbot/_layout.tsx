import { Ionicons } from "@expo/vector-icons";
import {
    DrawerContentScrollView,
    DrawerItem
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

        // Auto-create new session if none exists
        if (!currentSessionId && result.length === 0) {
          await createNewSession();
        } else if (!currentSessionId && result.length > 0) {
          setCurrentSessionId(result[0].id);
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    };

    loadSessions();
  }, [success, setSessions, currentSessionId, setCurrentSessionId]);

  const createNewSession = async () => {
    try {
      // Check if there's already a session with default "New Chat" title pattern
      const existingNewSession = sessions.find(session =>
        session.title.startsWith('New Chat')
      );

      if (existingNewSession) {
        // Jump to existing new session instead of creating a new one
        setCurrentSessionId(existingNewSession.id);
        return;
      }

      // Create new session only if no empty one exists
      const newId = Math.random().toString(36).substring(7);
      const newSession = {
        id: newId,
        title: `New Chat ${new Date().toLocaleTimeString()}`,
        createdAt: new Date(),
        deletedAt: null,
      };

      await db.insert(chatSessions).values(newSession);

      // Reload sessions from database to get updated list
      const result = await db
        .select()
        .from(chatSessions)
        .where(isNull(chatSessions.deletedAt))
        .orderBy(desc(chatSessions.createdAt));
      setSessions(result);
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
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={createNewSession}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          ),
        })}
        drawerContent={(props) => (
          <DrawerContentScrollView {...props}>
            <TouchableOpacity
              onPress={createNewSession}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0',
                backgroundColor: '#f8f9fa',
              }}
            >
              <Ionicons name="add-circle" size={24} color="#007AFF" />
              <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#007AFF' }}>
                New Chat
              </Text>
            </TouchableOpacity>

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
            drawerLabel: () => null, // Hide the default drawer item
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
