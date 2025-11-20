import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ActiveThinkingCardProps {
  title: string;
  content: string;
  type: 'reasoning' | 'tool';
}

export const ActiveThinkingCard: React.FC<ActiveThinkingCardProps> = ({ title, content, type }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when content changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [content]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Ionicons 
          name={type === 'reasoning' ? "bulb-outline" : "construct-outline"} 
          size={18} 
          color="#a1a1aa" 
        />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spinner}>
            <Ionicons name="sync" size={14} color="#a1a1aa" />
        </View>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.content}>{content}</Text>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#18181b', // Dark zinc color
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#27272a',
    maxHeight: 200, // Limit height to keep it card-like
    minHeight: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  spinner: {
    // Simple rotation animation could be added here if needed
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    color: '#a1a1aa',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System', // Or use a monospaced font if preferred
  },
});
