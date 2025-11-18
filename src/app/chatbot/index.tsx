import { generateAPIUrl } from "@/src/utils/expoUrl";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function App() {
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

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
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{
                paddingBottom: 20,
                paddingHorizontal: 8,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
            >
              {messages.map((m) => (
                <View key={m.id} style={{ marginVertical: 12 }}>
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    {m.role === "user" ? "You" : "Assistant"}
                  </Text>
                  {m.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <Text key={i} style={{ lineHeight: 20 }}>
                          {part.text}
                        </Text>
                      );
                    }
                    return (
                      <Text key={i} style={{ color: "gray", fontSize: 12 }}>
                        [Tool Result] {JSON.stringify(part)}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
            <View
              style={{
                paddingHorizontal: 12,
                paddingTop: 12,
                paddingBottom: insets.bottom - 12,
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
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
