import React from 'react';
import { Text, View } from "react-native";
import { useMarkdown } from "react-native-marked";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

export const MessageRenderer: React.FC<MessageProps> = ({ role, content }) => {
  const markdownElements = useMarkdown(content, {
    colors: {
      text: '#FFFFFF',
      code: '#27272a',
      link: '#3b82f6',
      background: 'transparent',
      border: '#333',
    },
  });

  return (
    <View 
      style={{ 
        marginVertical: 8, 
        alignItems: role === 'user' ? 'flex-end' : 'flex-start',
        width: '100%',
      }}
    >
      {role === 'assistant' ? (
        <View style={{ width: '100%' }}>
          {markdownElements.map((element, index) => (
            <View key={`markdown-${index}`}>
              {/* We might need to pass styles to markdown renderer for dark mode text */}
              {element}
            </View>
          ))}
        </View>
      ) : (
        <View 
          style={{ 
            backgroundColor: '#27272a', // Zinc 800
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 10,
            maxWidth: '80%',
          }}
        >
          <Text style={{ fontSize: 16, lineHeight: 22, color: "#fff" }}>
            {content}
          </Text>
        </View>
      )}
    </View>
  );
};