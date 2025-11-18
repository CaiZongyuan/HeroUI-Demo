import { generateAPIUrl } from "@/src/utils/expoUrl";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MessageRenderer } from "@/src/components/MessageRenderer";
export default function App() {
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const { messages, error, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
  });

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (error) return <Text>{error.message}</Text>;

  return (
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
            {m.parts.map((part, i) => {
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
            })}
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
          placeholder="Say something..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => {
            if (input.trim()) {
              sendMessage({ text: input });
              setInput("");
            }
          }}
          returnKeyType="send"
          blurOnSubmit={false}
        />
      </View>
    </View>
  );
}
