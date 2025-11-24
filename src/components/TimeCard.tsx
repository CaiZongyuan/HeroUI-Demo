import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface TimeCardProps {
  timestamp: string;
}

export function TimeCard({ timestamp }: TimeCardProps) {
  // Parse ISO 8601 timestamp
  const date = new Date(timestamp);
  
  // Format date and time
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  
  const timezone = date.toLocaleTimeString('en-US', {
    timeZoneName: 'short',
  }).split(' ').pop();

  return (
    <View
      style={{
        marginVertical: 8,
        marginHorizontal: 4,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#2d2d44',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {/* Header with icon */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#6366f1',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="time-outline" size={24} color="#ffffff" />
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#a0a0b8',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Current Time
        </Text>
      </View>

      {/* Time display */}
      <Text
        style={{
          fontSize: 32,
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: 4,
          letterSpacing: -0.5,
        }}
      >
        {formattedTime}
      </Text>

      {/* Date and timezone */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: '500',
          color: '#8b8b9f',
          marginBottom: 2,
        }}
      >
        {formattedDate}
      </Text>
      
      <Text
        style={{
          fontSize: 14,
          fontWeight: '400',
          color: '#6b6b7f',
        }}
      >
        {timezone}
      </Text>

      {/* Accent gradient bar */}
      <View
        style={{
          marginTop: 12,
          height: 3,
          borderRadius: 2,
          backgroundColor: '#6366f1',
          opacity: 0.6,
        }}
      />
    </View>
  );
}
