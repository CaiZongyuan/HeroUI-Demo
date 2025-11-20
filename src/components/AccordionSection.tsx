import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface AccordionSectionProps {
  title: string;
  content: React.ReactNode;
  initialExpanded?: boolean;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({ title, content, initialExpanded = true }) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const rotation = useSharedValue(initialExpanded ? 90 : 0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    rotation.value = withTiming(expanded ? 0 : 90);
  };

  const arrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={arrowStyle}>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Animated.View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.content}>
          {typeof content === 'string' ? (
            <Text style={styles.contentText}>{content}</Text>
          ) : (
            content
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 12,
  },
  contentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});
