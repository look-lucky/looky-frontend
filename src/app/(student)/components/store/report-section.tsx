import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
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
    <View style={[styles.container, { marginTop: rs(10) }]} >
      <View style={styles.thickDivider} />
      <TouchableOpacity style={styles.reportContainer} onPress={handlePress}>
        <View style={styles.reportContent}>
          <ThemedText style={styles.reportTitle}>잘못된 정보가 있나요?</ThemedText>
          <ThemedText style={styles.reportDescription}>
            수정이 필요하거나 다른 혜택을 제공한다면 알려주세요!
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={rs(24)} color="#828282" />
      </TouchableOpacity>
      <View style={styles.thickDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  thickDivider: {
    height: rs(10),
    backgroundColor: '#F5F5F5',
    marginHorizontal: -rs(20),
  },
  reportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(16),
  },
  reportContent: {
    flex: 1,
    gap: rs(4),
  },
  reportTitle: {
    fontSize: rs(15),
    fontFamily: 'Pretendard',
    fontWeight: '700',
    color: '#000000',
  },
  reportDescription: {
    fontSize: rs(12),
    fontFamily: 'Pretendard',
    color: '#828282',
    lineHeight: rs(20),
  },
});
