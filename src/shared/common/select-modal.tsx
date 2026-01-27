import { ThemedText } from '@/src/shared/common/themed-text';
import { Gray, Text } from '@/src/shared/theme/theme';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface SelectOption {
  id: string | number;
  label: string;
}

interface SelectModalProps {
  visible: boolean;
  options: SelectOption[];
  selectedId: string | number;
  onSelect: (id: string | number) => void;
  onClose: () => void;
  title?: string;
}

export function SelectModal({
  visible,
  options,
  selectedId,
  onSelect,
  onClose,
  title,
}: SelectModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          {title && (
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{title}</ThemedText>
            </View>
          )}
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.modalOption, selectedId === option.id && styles.modalOptionActive]}
              onPress={() => {
                onSelect(option.id);
                onClose();
              }}
            >
              <ThemedText
                style={[
                  styles.modalOptionText,
                  selectedId === option.id && styles.modalOptionTextActive,
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <ThemedText style={styles.modalCloseText}>닫기</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Gray.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#4A90D9',
  },
  modalHeader: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Text.primary,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalOptionActive: {
    backgroundColor: '#f9f9f9',
  },
  modalOptionText: {
    fontSize: 15,
    color: Text.primary,
  },
  modalOptionTextActive: {
    color: '#4A90D9',
    fontWeight: '600',
  },
  modalCloseButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    color: Text.secondary,
  },
});
