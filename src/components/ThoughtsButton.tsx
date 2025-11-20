import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ThoughtsButtonProps {
  onPress: () => void;
}

export const ThoughtsButton: React.FC<ThoughtsButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.text}>Thinking Logs {'>'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#27272a', // Zinc 800
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '500',
  },
});
