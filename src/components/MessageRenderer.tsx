import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MarkedStyles, useMarkdown } from 'react-native-marked';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const MessageRenderer: React.FC<MessageProps> = ({ role, content }) => {
  // Custom styles that override defaults for Markdown elements
  const customStyles: MarkedStyles = StyleSheet.create({
    // Base text (paragraphs, spans, etc.)
    text: {
      color: '#FFFFFF',
      fontSize: 16,
      lineHeight: 22,
    },

    // Headings with white text and margins
    heading1: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
    heading2: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginVertical: 6 },
    heading3: { color: '#FFFFFF', fontSize: 20, fontWeight: '600', marginVertical: 6 },

    // Inline code styling
    codeInline: {
      backgroundColor: '#374151',
      color: '#FED7AA',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'Courier New', // Monospace for code
    },

    // Code block container and text
    codeBlock: {
      backgroundColor: '#1e1e1e',
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
    codeBlockText: {
      color: '#C9D1D9',
      fontFamily: 'Courier New',
    },

    // Links with blue color and underline
    link: {
      color: '#60A5FA',
      textDecorationLine: 'underline',
    },

    // Blockquote with left border
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#4B5563',
      paddingLeft: 12,
      marginVertical: 8,
      backgroundColor: '#1f2937', // Slight background for visibility
    },

    // List items with white text
    listItem: {
      color: '#FFFFFF',
      marginBottom: 4,
    },

    // Paragraph margins
    paragraph: {
      marginBottom: 10,
    },
  });

  // Hook call: Returns ReactNode[] — pass theme for colors, styles for overrides
  const markdownElements = useMarkdown(content, {
    // Theme: Includes colors for global elements (e.g., text, code bg)
    theme: {
      colors: {
        text: '#FFFFFF',
        background: 'transparent',
        link: '#60A5FA',
        code: '#1e1e1e', // Code block background
        border: '#333333',
      },
    },
    // Custom styles: Merge with defaults for element-specific tweaks
    styles: customStyles,
  });

  return (
    <View
      style={{
        marginVertical: 8,
        alignItems: role === 'user' ? 'flex-end' : 'flex-start',
        width: '100%',
      }}
    >
      {/* User message: Bubble with background, render Markdown elements */}
      {role === 'user' ? (
        <View
          style={{
            backgroundColor: '#27272a',
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 10,
            maxWidth: '80%',
          }}
        >
          {markdownElements}
        </View>
      ) : (
        <View style={{ width: '100%' }}>
          {markdownElements}
        </View>
      )}
    </View>
  );
};