import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GroupedLog } from '../utils/message-utils';
import { AccordionSection } from './AccordionSection';

interface ThinkingLogModalProps {
  visible: boolean;
  onClose: () => void;
  logs: GroupedLog[];
  totalTime: string;
}

export const ThinkingLogModal: React.FC<ThinkingLogModalProps> = ({ visible, onClose, logs, totalTime }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Thinking Process</Text>
              <Text style={styles.timeText}>Thought for {totalTime}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
              {logs.map((log, index) => (
                <AccordionSection
                  key={index}
                  title={log.title}
                  content={
                    log.type === 'tool' ? (
                      <View>
                        <Text style={styles.label}>Args:</Text>
                        <Text style={styles.codeBlock}>{JSON.stringify(log.content.args, null, 2)}</Text>
                        <Text style={styles.label}>Result:</Text>
                        <Text style={styles.codeBlock}>{JSON.stringify(log.content.result, null, 2)}</Text>
                      </View>
                    ) : (
                      log.content
                    )
                  }
                />
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={styles.doneButton}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  doneButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 8,
    marginBottom: 4,
  },
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
});
