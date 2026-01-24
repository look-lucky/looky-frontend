import { ThemedText } from '@/src/components/common/themed-text';
import type { Store } from '@/src/types/store';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

// Re-export type for convenience
export type { Store };

interface StoreCardProps {
  store: Store;
  onPress?: () => void;
}

export function StoreCard({ store, onPress }: StoreCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: store.image }}
        style={styles.image}
      />
      <View style={styles.info}>
        <ThemedText style={styles.name}>{store.name}</ThemedText>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <ThemedText style={styles.ratingText}>
            {store.rating} (리뷰 {store.reviewCount}개)
          </ThemedText>
          <ThemedText style={styles.distance}>
            내 위치에서 {store.distance}
          </ThemedText>
        </View>
        <ThemedText style={styles.hours}>
          <ThemedText style={styles.openStatus}>{store.openStatus}</ThemedText>
          {' '}{store.openHours}
        </ThemedText>
        {store.benefits.length > 0 && (
          <ThemedText style={styles.benefits} numberOfLines={1}>
            {store.benefits.join(', ')}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1b20',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
  },
  distance: {
    fontSize: 13,
    color: '#34b262',
    marginLeft: 8,
  },
  hours: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  openStatus: {
    color: '#34b262',
    fontWeight: '500',
  },
  benefits: {
    fontSize: 12,
    color: '#999',
  },
});
