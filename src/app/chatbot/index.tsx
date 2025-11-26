import { ActiveThinkingCard } from "@/src/components/ActiveThinkingCard";
import { MessageRenderer } from "@/src/components/MessageRenderer";
import { PLUGIN_RENDERERS } from "@/src/components/plugin-renderers";
import { ThinkingIndicator } from "@/src/components/ThinkingIndicator";
import { ThinkingLogModal } from "@/src/components/ThinkingLogModal";
import { ThoughtsButton } from "@/src/components/ThoughtsButton";
import { ToolPartsRenderer } from "@/src/components/tooluse";
import { db } from "@/src/db/client";
import { chatMessages, chatSessions } from "@/src/db/schema";
import { currentSessionIdAtom, sessionsAtom } from "@/src/store/chat-session";
import { generateAPIUrl } from "@/src/utils/expoUrl";
import {
  calculateThinkingTime,
  extractActiveThinkingInfo,
  extractCurrentActivity,
  extractPluginOutputs,
  groupThinkingLogs,
  hasThinkingLogs,
} from "@/src/utils/message-utils";
import { useChat } from "@ai-sdk/react";
import { Ionicons } from "@expo/vector-icons";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { asc, desc, eq, isNull } from "drizzle-orm";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { fetch as expoFetch } from "expo/fetch";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

interface SelectedImage {
  uri: string;
  base64?: string | null;
  mimeType?: string;
}

export default function App() {
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const currentSessionId = useAtomValue(currentSessionIdAtom);
  const [sessions, setSessions] = useAtom(sessionsAtom);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  // Thinking Logs State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMessageLogs, setSelectedMessageLogs] = useState<any[]>([]);
  const [selectedMessageTime, setSelectedMessageTime] = useState("");
  const runtimeUserId =
    process.env.NEXT_PUBLIC_AGENTSCOPE_USER_ID ?? "user-ios";

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
                  parts: Array.isArray(parsedMessage.parts)
                    ? parsedMessage.parts
                    : undefined,
                  content: parsedMessage.content || "",
                };

                // If parts are missing but content exists, create text part (optional but good for consistency)
                if (!sanitizedMessage.parts && sanitizedMessage.content) {
                  sanitizedMessage.parts = [
                    { type: "text", text: sanitizedMessage.content },
                  ];
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

  const { messages, error, sendMessage, setMessages, status, addToolOutput } =
    useChat({
      transport: new DefaultChatTransport({
        fetch: expoFetch as unknown as typeof globalThis.fetch,
        api: generateAPIUrl("/api/chat"),
        body: {
          userId: runtimeUserId,
        },
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
          await db
            .insert(chatMessages)
            .values({
              id: message.id,
              sessionId: sessionId,
              message: JSON.stringify(message),
              createdAt: new Date(),
            })
            .onConflictDoUpdate({
              target: chatMessages.id,
              set: { message: JSON.stringify(message) },
            });
        } catch (e) {
          console.error("Failed to save assistant message", e);
        }
      },

      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        // 先检查是否为动态工具（dynamic tool），若是则跳过（由后端处理）
        if ((toolCall as any).dynamic) {
          return;
        }
        if (toolCall.toolName === "getLocation") {
          const cities = [
            "New York",
            "Los Angeles",
            "Chicago",
            "San Francisco",
          ];

          // No await - avoids potential deadlocks
          addToolOutput({
            tool: "getLocation",
            toolCallId: toolCall.toolCallId,
            output: cities[Math.floor(Math.random() * cities.length)],
          });
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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          base64: asset.base64,
          mimeType: asset.mimeType || "image/jpeg",
        }));
        setSelectedImages((prev) => [...prev, ...newImages]);
      }
    } catch (e) {
      console.error("Failed to pick image", e);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Save user messages
  const handleSend = async () => {
    if ((!input.trim() && selectedImages.length === 0) || !currentSessionId)
      return;

    const userMessageContent = input;
    const currentImages = [...selectedImages];
    setInput("");
    setSelectedImages([]);

    // Update session title to first message if it's still the default "New Chat" title
    try {
      const currentSession = sessions.find((s) => s.id === currentSessionId);
      if (currentSession && currentSession.title.startsWith("New Chat")) {
        const newTitle =
          userMessageContent.length > 0
            ? userMessageContent.length > 30
              ? userMessageContent.substring(0, 30) + "..."
              : userMessageContent
            : "Image Message";

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

    const savedImages = await Promise.all(
      currentImages.map(async (img) => {
        try {
          // ✅ 正确：FileSystem.documentDirectory 可能为 null，需要检查
          const docDir = FileSystem.documentDirectory;

          if (!docDir) {
            console.warn("FileSystem.documentDirectory is not available");
            return img;
          }

          const filename =
            img.uri.split("/").pop() || `image-${Date.now()}.jpg`;
          const newPath = `${docDir}${filename}`;

          await FileSystem.copyAsync({
            from: img.uri,
            to: newPath,
          });

          return { ...img, uri: newPath };
        } catch (e) {
          console.error("Failed to save image locally", e);
          return img;
        }
      })
    );

    // Construct message parts for DB (using local URIs)
    const dbMessageParts = [
      ...savedImages.map((img) => ({
        type: "file",
        mediaType: img.mimeType,
        url: img.uri,
      })),
      ...(userMessageContent
        ? [{ type: "text", text: userMessageContent }]
        : []),
    ];

    // Construct message parts for AI SDK (using base64)
    const aiMessageFiles = currentImages.map((img) => ({
      type: "file" as const,
      mediaType: img.mimeType || "image/jpeg",
      url: `data:${img.mimeType || "image/jpeg"};base64,${img.base64}`,
    }));

    const messageId = Math.random().toString(36).substring(7);
    const userMessage = {
      id: messageId,
      role: "user",
      parts: dbMessageParts,
      createdAt: new Date(),
    };

    try {
      await db.insert(chatMessages).values({
        id: messageId,
        sessionId: currentSessionId,
        message: JSON.stringify(userMessage),
        createdAt: new Date(),
      });

      sendMessage(
        {
          text: userMessageContent,
          files: aiMessageFiles.length > 0 ? aiMessageFiles : undefined,
        },
        {
          body: {
            sessionId: currentSessionId,
          },
        }
      );
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000000" }}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View className="flex-1" style={{ backgroundColor: "#000000" }}>
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
              const isStreaming =
                status === "streaming" || status === "submitted";
              const showThinkingIndicator =
                isLastMessage && isStreaming && m.role === "assistant";

              // Helper to extract text content from parts
              const getTextContent = (message: any) => {
                if (message.parts) {
                  return message.parts
                    .filter((part: any) => part.type === "text")
                    .map((part: any) => part.text)
                    .join("");
                }
                return message.content || "";
              };

              // Helper to extract images from parts
              const getImages = (message: any) => {
                if (message.parts) {
                  return message.parts
                    .filter(
                      (part: any) =>
                        part.type === "file" &&
                        part.mediaType?.startsWith("image/")
                    )
                    .map((part: any) => ({ uri: part.url }));
                }
                return [];
              };

              const messageContent = getTextContent(m);
              const messageImages = getImages(m);

              return (
                <View key={m.id}>
                  {m.role === "user" ? (
                    <MessageRenderer
                      role="user"
                      content={messageContent}
                      images={messageImages}
                    />
                  ) : (
                    <View>
                      {/* Active Thinking Card (Streaming) */}
                      {showThinkingIndicator &&
                        (() => {
                          const activeInfo = extractActiveThinkingInfo(m);
                          return activeInfo ? (
                            <ActiveThinkingCard
                              title={activeInfo.title}
                              content={activeInfo.content}
                              type={activeInfo.type}
                            />
                          ) : (
                            <ThinkingIndicator
                              status={extractCurrentActivity(m)}
                            />
                          );
                        })()}

                      {/* Thoughts Button (Finished) */}
                      {!isStreaming &&
                        m.role === "assistant" &&
                        hasThinkingLogs(m) && (
                          <ThoughtsButton onPress={() => handleShowLogs(m)} />
                        )}

                      {/* Plugin Outputs - Custom UI Cards */}
                      {(() => {
                        const plugins = extractPluginOutputs(m);

                        return plugins.map((plugin) => {
                          const Renderer = PLUGIN_RENDERERS[plugin.toolName];

                          return Renderer ? (
                            <Renderer
                              key={plugin.toolCallId}
                              result={plugin.result}
                              toolName={plugin.toolName}
                              toolCallId={plugin.toolCallId}
                            />
                          ) : null;
                        });
                      })()}

                      {/* Client-side Tool Parts */}
                      <ToolPartsRenderer
                        parts={m.parts || []}
                        addToolOutput={addToolOutput}
                      />

                      {/* Render Text Content Only */}
                      <MessageRenderer
                        role="assistant"
                        content={messageContent}
                        images={messageImages}
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
            {selectedImages.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}
              >
                {selectedImages.map((img, index) => (
                  <View
                    key={index}
                    style={{ marginRight: 8, position: "relative" }}
                  >
                    <Image
                      source={{ uri: img.uri }}
                      style={{ width: 60, height: 60, borderRadius: 8 }}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        backgroundColor: "#333",
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: "#000",
                      }}
                    >
                      <Ionicons name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#27272a",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="camera-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: "#27272a",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: "#fff",
                }}
                placeholder={
                  currentSessionId
                    ? "Say something..."
                    : "Create a new chat to start"
                }
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
