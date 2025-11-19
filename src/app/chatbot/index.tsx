import { MessageRenderer } from "@/src/components/MessageRenderer";
import { db } from "@/src/db/client";
import { chatMessages } from "@/src/db/schema";
import { currentSessionIdAtom } from "@/src/store/chat-session";
import { generateAPIUrl } from "@/src/utils/expoUrl";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { asc, eq } from "drizzle-orm";
import { fetch as expoFetch } from "expo/fetch";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const currentSessionId = useAtomValue(currentSessionIdAtom);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load history when session changes
  useEffect(() => {
    if (!currentSessionId) return;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const history = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, currentSessionId))
          .orderBy(asc(chatMessages.createdAt));

        setInitialMessages(
          history
            .map((msg) => {
              try {
                // Parse the stored JSON message
                const parsedMessage = JSON.parse(msg.message as string);
                return {
                  ...parsedMessage,
                  id: msg.id, // Ensure we use the DB ID if needed, or keep the one from JSON
                };
              } catch (e) {
                console.warn("Failed to parse message JSON:", msg.message);
                return null;
              }
            })
            .filter((msg) => msg !== null)
        );
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [currentSessionId]);

  const currentSessionIdRef = useRef(currentSessionId);

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  const { messages, error, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
    onFinish: async ({ message }) => {
      const sessionId = currentSessionIdRef.current;
      console.log("onFinish triggered, sessionId:", sessionId);
      
      if (!sessionId) {
        console.log("No current session ID in onFinish");
        return;
      }
      
      // Save assistant message
      try {
        console.log("Saving assistant message for session:", sessionId);

        await db.insert(chatMessages).values({
          id: message.id,
          sessionId: sessionId,
          message: JSON.stringify(message),
          createdAt: new Date(),
        });
        console.log("Assistant message saved");
      } catch (e) {
        console.error("Failed to save assistant message", e);
      }
    },
  });

  // Sync initialMessages to useChat
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      setMessages([]);
    }
  }, [initialMessages, setMessages]);

  // Save user messages
  const handleSend = async () => {
    if (!input.trim() || !currentSessionId) return;

    const userMessageContent = input;
    setInput("");

    // Optimistically add user message is handled by useChat, but we need to save it
    const messageId = Math.random().toString(36).substring(7);
    const userMessage = {
      id: messageId,
      role: "user",
      content: userMessageContent,
      createdAt: new Date(),
    };

    try {
      await db.insert(chatMessages).values({
        id: messageId,
        sessionId: currentSessionId,
        message: JSON.stringify(userMessage),
        createdAt: new Date(),
      });
      
      sendMessage({ text: userMessageContent });
    } catch (e) {
      console.error("Failed to save user message", e);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (error) return <Text>{error.message}</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View className="flex-1">
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, paddingHorizontal: 8 }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            bounces={true}
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m) => (
              <View key={m.id}>
                {m.parts ? (
                  m.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <MessageRenderer
                          key={i}
                          role={m.role as "user" | "assistant"}
                          content={part.text}
                        />
                      );
                    }
                    return (
                      <View key={i} style={{ marginVertical: 12 }}>
                        <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                          {m.role === "user" ? "You" : "Assistant"}
                        </Text>
                        <Text style={{ color: "gray", fontSize: 12 }}>
                          [Tool Result] {JSON.stringify(part)}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <MessageRenderer
                    role={m.role as "user" | "assistant"}
                    content={m.content}
                  />
                )}
              </View>
            ))}
          </ScrollView>
          <View
            style={{
              paddingHorizontal: 12,
              paddingTop: 12,
              paddingBottom: 12,
              backgroundColor: "#fff",
              borderTopWidth: 1,
              borderTopColor: "#eee",
            }}
          >
            <TextInput
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
              }}
              placeholder={currentSessionId ? "Say something..." : "Create a new chat to start"}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit={false}
              editable={!!currentSessionId}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
