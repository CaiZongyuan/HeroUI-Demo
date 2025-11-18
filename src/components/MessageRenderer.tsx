import { Text, View } from "react-native";
import { useMarkdown } from "react-native-marked";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

export const MessageRenderer: React.FC<MessageProps> = ({ role, content }) => {
  const markdownElements = useMarkdown(content);

  return (
    <View style={{ marginVertical: 12 }}>
      <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
        {role === "user" ? "You" : "Assistant"}
      </Text>
      {role === "assistant" ? (
        <View>
          {markdownElements.map((element, index) => (
            <View key={`markdown-${index}`}>
              {element}
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ fontSize: 16, lineHeight: 20, color: "#333" }}>
          {content}
        </Text>
      )}
    </View>
  );
};