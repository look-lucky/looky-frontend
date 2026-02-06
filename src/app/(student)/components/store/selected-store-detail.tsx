import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import type { Store } from '@/src/shared/types/store';
import { formatOperatingHours } from '@/src/shared/utils/store-transform';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SelectedStoreDetailProps {
  store: Store;
  onCall?: () => void;
  onNavigate?: () => void;
  onShare?: () => void;
  onViewDetail?: () => void;
}

export function SelectedStoreDetail({
  store,
  onCall,
  onNavigate,
  onShare,
  onViewDetail,
}: SelectedStoreDetailProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onViewDetail} activeOpacity={0.8}>
        <Image
          source={{ uri: store.image }}
          style={styles.image}
        />
        <View style={styles.info}>
          <ThemedText style={styles.name}>
            {store.name}
          </ThemedText>
          <View style={styles.rating}>
            <Ionicons name="star" size={18} color="#FFB800" />
            <ThemedText style={styles.ratingText}>
              {store.rating}
            </ThemedText>
            <ThemedText style={styles.reviewCount}>
              리뷰 {store.reviewCount}개
            </ThemedText>
          </View>
          <View style={styles.detail}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <ThemedText style={styles.detailText}>
              내 위치에서 {store.distance}
            </ThemedText>
          </View>
          <View style={styles.detail}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <ThemedText style={styles.openStatus}>
              {store.openStatus}
            </ThemedText>
            <ThemedText style={styles.detailText}>
              {formatOperatingHours(store.openHours)}
            </ThemedText>
          </View>
          {store.benefits.length > 0 && (
            <View style={styles.benefits}>
              <Ionicons name="gift-outline" size={16} color="#34b262" />
              <View style={styles.benefitsList}>
                {store.benefits.map((benefit, index) => (
                  <ThemedText key={index} style={styles.benefitItem}>
                    {benefit}
                  </ThemedText>
                ))}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onCall}>
          <Ionicons name="call-outline" size={20} color="#34b262" />
          <ThemedText style={styles.actionButtonText}>전화</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onNavigate}>
          <Ionicons name="navigate-outline" size={20} color="#34b262" />
          <ThemedText style={styles.actionButtonText}>길찾기</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color="#34b262" />
          <ThemedText style={styles.actionButtonText}>공유</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  image: {
    width: '100%',
    height: rs(150),
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  info: {
    gap: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1d1b20',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1b20',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  openStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34b262',
  },
  benefits: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f5fff8',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  benefitsList: {
    flex: 1,
    gap: 4,
  },
  benefitItem: {
    fontSize: 13,
    color: '#34b262',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    fontSize: 13,
    color: '#34b262',
    fontWeight: '500',
  },
});
