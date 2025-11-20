import { ActiveThinkingCard } from "@/src/components/ActiveThinkingCard";
import { MessageRenderer } from "@/src/components/MessageRenderer";
import { ThinkingIndicator } from "@/src/components/ThinkingIndicator";
import { ThinkingLogModal } from "@/src/components/ThinkingLogModal";
import { ThoughtsButton } from "@/src/components/ThoughtsButton";
import { db } from "@/src/db/client";
import { chatMessages, chatSessions } from "@/src/db/schema";
import { currentSessionIdAtom, sessionsAtom } from "@/src/store/chat-session";
import { generateAPIUrl } from "@/src/utils/expoUrl";
import { calculateThinkingTime, extractActiveThinkingInfo, extractCurrentActivity, groupThinkingLogs, hasThinkingLogs } from "@/src/utils/message-utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { asc, desc, eq, isNull } from "drizzle-orm";
import { fetch as expoFetch } from "expo/fetch";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const currentSessionId = useAtomValue(currentSessionIdAtom);
  const [sessions, setSessions] = useAtom(sessionsAtom);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Thinking Logs State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMessageLogs, setSelectedMessageLogs] = useState<any[]>([]);
  const [selectedMessageTime, setSelectedMessageTime] = useState("");

  // Function to refresh sessions list
  const refreshSessions = async () => {
    try {
      const result = await db
        .select()
        .from(chatSessions)
        .where(isNull(chatSessions.deletedAt))
        .orderBy(desc(chatSessions.createdAt));
      setSessions(result);
    } catch (e) {
      console.error("Failed to refresh sessions", e);
    }
  };

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
                
                // Sanitize message structure
                const sanitizedMessage = {
                  ...parsedMessage,
                  id: msg.id, // Ensure we use the DB ID
                  parts: Array.isArray(parsedMessage.parts) ? parsedMessage.parts : undefined,
                  content: parsedMessage.content || '',
                };

                // If parts are missing but content exists, create text part (optional but good for consistency)
                if (!sanitizedMessage.parts && sanitizedMessage.content) {
                   sanitizedMessage.parts = [{ type: 'text', text: sanitizedMessage.content }];
                }

                return sanitizedMessage;
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

  const { messages, error, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
    onFinish: async ({ message }) => {
      const sessionId = currentSessionIdRef.current;
      
      if (!sessionId) {
        console.log("No current session ID in onFinish");
        return;
      }
      
      // Save assistant message
      try {
        await db.insert(chatMessages).values({
          id: message.id,
          sessionId: sessionId,
          message: JSON.stringify(message),
          createdAt: new Date(),
        });
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

    // Update session title to first message if it's still the default "New Chat" title
    try {
      const currentSession = sessions.find(s => s.id === currentSessionId);
      if (currentSession && currentSession.title.startsWith('New Chat')) {
        const newTitle = userMessageContent.length > 30
          ? userMessageContent.substring(0, 30) + "..."
          : userMessageContent;

        await db
          .update(chatSessions)
          .set({ title: newTitle })
          .where(eq(chatSessions.id, currentSessionId));

        // Refresh sessions to show updated title and allow creating new empty sessions
        await refreshSessions();
      }
    } catch (e) {
      console.error("Failed to update session title", e);
    }

    // Optimistically add user message is handled by useChat, but we need to save it
    const messageId = Math.random().toString(36).substring(7);
    const userMessage = {
      id: messageId,
      role: "user",
      parts: [
        {
          type: "text",
          text: userMessageContent,
        }
      ],
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
  }, [messages, status]);

  const handleShowLogs = (message: any) => {
    const logs = groupThinkingLogs(message);
    const time = calculateThinkingTime(message.createdAt);
    setSelectedMessageLogs(logs);
    setSelectedMessageTime(time);
    setIsModalVisible(true);
  };

  if (error) return <Text>{error.message}</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View className="flex-1" style={{ backgroundColor: '#000000' }}>
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
            {messages.map((m, index) => {
              const isLastMessage = index === messages.length - 1;
              const isStreaming = status === 'streaming' || status === 'submitted';
              const showThinkingIndicator = isLastMessage && isStreaming && m.role === 'assistant';
              
              // Helper to extract text content from parts
              const getTextContent = (message: any) => {
                if (message.parts) {
                  return message.parts
                    .filter((part: any) => part.type === 'text')
                    .map((part: any) => part.text)
                    .join('');
                }
                return message.content || '';
              };

              const messageContent = getTextContent(m);

              return (
                <View key={m.id}>
                  {m.role === 'user' ? (
                     <MessageRenderer
                       role="user"
                       content={messageContent}
                     />
                  ) : (
                    <View>
                       {/* Active Thinking Card (Streaming) - NOW FIRST */}
                       {showThinkingIndicator && (
                         (() => {
                           const activeInfo = extractActiveThinkingInfo(m);
                           return activeInfo ? (
                             <ActiveThinkingCard 
                               title={activeInfo.title}
                               content={activeInfo.content}
                               type={activeInfo.type}
                             />
                           ) : (
                             <ThinkingIndicator status={extractCurrentActivity(m)} />
                           );
                         })()
                       )}

                       {/* Thoughts Button (Finished) - NOW FIRST */}
                       {!isStreaming && m.role === 'assistant' && hasThinkingLogs(m) && (
                         <ThoughtsButton onPress={() => handleShowLogs(m)} />
                       )}

                       {/* Render Text Content Only - NOW SECOND */}
                       <MessageRenderer
                         role="assistant"
                         content={messageContent}
                       />
                    </View>
                  )}
                </View>
              );
            })}


          </ScrollView>
          <View
            style={{
              paddingHorizontal: 12,
              paddingTop: 12,
              paddingBottom: 12,
              backgroundColor: "#000000",
              borderTopWidth: 1,
              borderTopColor: "#333",
            }}
          >
            <TextInput
              style={{
                backgroundColor: "#27272a",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: "#fff",
              }}
              placeholder={currentSessionId ? "Say something..." : "Create a new chat to start"}
              placeholderTextColor="#666"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit={false}
              editable={!!currentSessionId}
            />
          </View>
        </View>
        
        <ThinkingLogModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          logs={selectedMessageLogs}
          totalTime={selectedMessageTime}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
