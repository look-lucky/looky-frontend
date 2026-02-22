import { useGetStorePartnerships } from '@/src/api/partnership';
import type { StorePartnershipResponse } from '@/src/api/generated.schemas';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Owner, System, Text } from '@/src/shared/theme/theme';
import type { Store } from '@/src/shared/types/store';
import {
  formatOperatingHours,
  getOpenStatus,
} from '@/src/shared/utils/store-transform';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

// Re-export type for convenience
export type { Store };

function PartnershipLabel({ storeId }: { storeId: number }) {
  const { data: res } = useGetStorePartnerships(storeId, {
    query: { staleTime: Infinity },
  });
  const partnerships = (res as any)?.data?.data as StorePartnershipResponse[] | undefined;

  if (!partnerships?.length) return null;

  const orgNames = partnerships
    .map((p) => p.organizationName)
    .filter(Boolean)
    .join(', ');

  return (
    <View style={partnershipStyles.row}>
      <ThemedText style={partnershipStyles.clover}>🍀</ThemedText>
      <ThemedText style={partnershipStyles.text} numberOfLines={1}>
        {orgNames} 제휴
      </ThemedText>
    </View>
  );
}

const partnershipStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  clover: {
    fontSize: rs(14),
  },
  text: {
    fontSize: rs(13),
    color: Owner.primary,
    fontWeight: '500',
    flex: 1,
  },
});

interface StoreCardProps {
  store: Store;
  onPress?: () => void;
  onBookmarkPress?: (storeId: string) => void;
}

export function StoreCard({ store, onPress, onBookmarkPress }: StoreCardProps) {
  const handleBookmarkPress = () => {
    onBookmarkPress?.(store.id);
  };

  const formattedHours = formatOperatingHours(store.openHours);
  const openStatus = getOpenStatus(store.openHours);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* 이미지 + 북마크 */}
      <View style={styles.imageWrapper}>
        <Image
          source={store.image ? { uri: store.image } : require('@/assets/images/icon.png')}
          style={styles.image}
        />
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={handleBookmarkPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={store.isFavorite ? 'bookmark' : 'bookmark-outline'}
            size={rs(22)}
            color={store.isFavorite ? Gray.black : Gray.gray5}
          />
        </TouchableOpacity>
      </View>

      {/* 정보 영역 */}
      <View style={styles.info}>
        {/* 매장명 */}
        <ThemedText style={styles.name} numberOfLines={1}>
          {store.name}
        </ThemedText>

        {/* 별점 + 리뷰 + 카테고리 */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={rs(14)} color={System.star} />
          <ThemedText style={styles.ratingText}>
            {store.rating > 0 ? store.rating.toFixed(1) : '-'}
          </ThemedText>
          <ThemedText style={styles.reviewCount}>
            (리뷰 {store.reviewCount}개)
          </ThemedText>
          {store.category && (
            <>
              <View style={styles.separator} />
              <ThemedText style={styles.category} numberOfLines={1}>
                {store.category}
              </ThemedText>
            </>
          )}
        </View>

        {/* 영업시간 */}
        <View style={styles.hoursRow}>
          <Ionicons name="time-outline" size={rs(14)} color={Text.tertiary} />
          <ThemedText
            style={[
              styles.openStatus,
              openStatus === '휴무' && styles.closedStatus,
              openStatus === '영업종료' && styles.closedStatus,
            ]}
          >
            {openStatus || '정보없음'}
          </ThemedText>
          {formattedHours && formattedHours !== '휴무' && (
            <>
              <ThemedText style={styles.dot}>•</ThemedText>
              <ThemedText style={styles.hoursText}>{formattedHours}</ThemedText>
            </>
          )}
        </View>

        {/* 제휴 혜택 */}
        <PartnershipLabel storeId={Number(store.id)} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: Gray.gray3,
    paddingBottom: rs(16),
    marginTop: rs(16),
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: rs(180),
    borderRadius: rs(12),
    backgroundColor: Gray.gray3,
  },
  info: {
    marginTop: rs(12),
    gap: rs(4),
  },
  name: {
    fontSize: rs(16),
    fontWeight: '600',
    color: Text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    flexWrap: 'wrap',
  },
  ratingText: {
    fontSize: rs(13),
    fontWeight: '500',
    color: Text.primary,
  },
  reviewCount: {
    fontSize: rs(13),
    color: Text.tertiary,
  },
  separator: {
    width: 1,
    height: rs(12),
    backgroundColor: Gray.gray4,
    marginHorizontal: rs(4),
  },
  category: {
    fontSize: rs(13),
    color: Text.secondary,
    flex: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  openStatus: {
    fontSize: rs(13),
    fontWeight: '500',
    color: Owner.primary,
  },
  closedStatus: {
    color: Text.tertiary,
  },
  dot: {
    fontSize: rs(13),
    color: Text.tertiary,
  },
  hoursText: {
    fontSize: rs(13),
    color: Text.secondary,
  },
  bookmarkButton: {
    position: 'absolute',
    top: rs(8),
    right: rs(8),
    padding: rs(4),
  },
});
