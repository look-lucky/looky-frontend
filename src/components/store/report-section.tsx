import { ThemedText } from '@/src/components/common/themed-text';
import { rs } from '@/src/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ReportSectionProps {
  storeId: string;
}

export function ReportSection({ storeId }: ReportSectionProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/store/${storeId}/feedback`);
  };

  return (
    <TouchableOpacity style={styles.reportContainer} onPress={handlePress}>
      <View style={styles.reportContent}>
        <ThemedText style={styles.reportTitle}>잘못된 정보가 있나요?</ThemedText>
        <ThemedText style={styles.reportDescription}>
          수정이 필요하거나 다른 혜택을 제공한다면 알려주세요!
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={rs(20)} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  reportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: rs(16),
    marginBottom: rs(16),
  },
  reportContent: {
    flex: 1,
    gap: rs(4),
  },
  reportTitle: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#1d1b20',
  },
  reportDescription: {
    fontSize: rs(12),
    color: '#666',
  },
});
