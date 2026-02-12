import TrendingUpIcon from '@/assets/images/icons/home/Vector.svg';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Brand, Gray, Text as TextColor } from '@/src/shared/theme/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SectionHeader } from './section-header';

export interface HotPlaceItem {
  id: number;
  rank: number;
  name: string;
  category: string;
  organization: string;
  weeklyFavoriteCount: number;
}

interface HotPlaceSectionProps {
  places: HotPlaceItem[];
}

const RANK_COLORS = ['#34B262', '#3B82F6', '#F59E0B'];

export function HotPlaceSection({ places }: HotPlaceSectionProps) {
  const router = useRouter();

  const handleMorePress = () => {
    router.push('/map');
  };

  const handlePlacePress = (placeId: number) => {
    router.push(`/store/${placeId}`);
  };

  if (places.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader
          icon="🔥"
          title="지금 인기있는 곳"
          subtitle="이번 주에 가장 인기있는 매장"
          onMorePress={handleMorePress}
        />
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>아직 순위가 없습니다</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader
        icon="🔥"
        title="지금 인기있는 곳"
        subtitle="이번 주에 가장 인기있는 매장"
        onMorePress={handleMorePress}
      />
      <View style={styles.rankingContainer}>
        {places.slice(0, 3).map((place, index) => (
          <TouchableOpacity
            key={place.id}
            style={[
              styles.rankingItem,
              index < places.length - 1 && styles.rankingItemBorder,
            ]}
            onPress={() => handlePlacePress(place.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.rankCircle,
                { backgroundColor: RANK_COLORS[index] || Gray.gray5 },
              ]}
            >
              <ThemedText style={styles.rankNumber}>{place.rank}</ThemedText>
            </View>
            <View style={styles.placeInfo}>
              <View style={styles.placeNameRow}>
                <ThemedText type="defaultSemiBold">{place.name}</ThemedText>
                <ThemedText type="caption" lightColor={Gray.gray9}>
                  {place.category}
                </ThemedText>
              </View>
              <ThemedText style={styles.placeOrganization}>
                {place.organization}
              </ThemedText>
            </View>
            <View style={styles.favoriteContainer}>
              <TrendingUpIcon width={rs(11)} height={rs(6)} />
              <ThemedText style={styles.favoriteCount}>
                +{place.weeklyFavoriteCount}회
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: rs(8),
  },
  rankingContainer: {
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    overflow: 'hidden',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
  },
  rankingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Gray.gray3,
  },
  rankCircle: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: rs(14),
    fontWeight: '700',
    color: Gray.white,
  },
  placeInfo: {
    flex: 1,
    paddingHorizontal: rs(12),
  },
  placeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  placeName: {
    fontSize: rs(14),
    fontWeight: '600',
    color: TextColor.primary,
  },
  placeCategory: {
    fontSize: rs(12),
    color: TextColor.tertiary,
  },
  placeOrganization: {
    fontSize: rs(11),
    color: Brand.primary,
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(2),
  },
  favoriteArrow: {
    fontSize: rs(12),
    color: Brand.primary,
  },
  favoriteCount: {
    fontSize: rs(12),
    fontWeight: '600',
    color: Brand.primary,
  },
  emptyContainer: {
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    padding: rs(24),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: rs(14),
    color: TextColor.tertiary,
  },
});
