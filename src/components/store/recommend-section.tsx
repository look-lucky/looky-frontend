import { ThemedText } from '@/src/components/common/themed-text';
import { rs } from '@/src/theme/scale';
import type { RecommendStore } from '@/src/types/store';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface RecommendSectionProps {
  stores: RecommendStore[];
}

export function RecommendSection({ stores }: RecommendSectionProps) {
  if (stores.length === 0) return null;

  return (
    <View style={styles.recommendContainer}>
      <ThemedText style={styles.sectionTitle}>방문자들이 함께 찾은</ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendScrollContent}
      >
        {stores.map((store) => (
          <TouchableOpacity key={store.id} style={styles.storeCard}>
            <Image source={{ uri: store.image }} style={styles.storeImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  recommendContainer: {
    gap: rs(12),
  },
  sectionTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1d1b20',
  },
  recommendScrollContent: {
    gap: rs(12),
  },
  storeCard: {
    width: rs(100),
    height: rs(100),
    borderRadius: 16,
    overflow: 'hidden',
  },
  storeImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
});
