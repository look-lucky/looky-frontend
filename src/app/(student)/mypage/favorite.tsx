import { useGetMyFavorites, useRemoveFavorite } from '@/src/api/favorite';
import type {
  FavoriteStoreResponse,
  PageResponseFavoriteStoreResponse,
  StoreResponseStoreCategoriesItem,
} from '@/src/api/generated.schemas';
import { rs } from '@/src/shared/theme/scale';
import { formatStoreCategories } from '@/src/shared/utils/store-transform';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Favorite() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: favoritesRes, refetch } = useGetMyFavorites({
    pageable: { page: 0, size: 100 },
  });

  const { mutate: removeFavorite } = useRemoveFavorite();

  const stores = useMemo(() => {
    const raw = (favoritesRes as any)?.data?.data as
      | PageResponseFavoriteStoreResponse
      | undefined;
    return raw?.content ?? [];
  }, [favoritesRes]);

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const handleRemoveFavorite = (store: FavoriteStoreResponse) => {
    if (!store.storeId) return;
    removeFavorite({ storeId: store.storeId }, { onSuccess: () => refetch() });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>찜한 매장</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isFilterOpen}
        >
          <View style={{ height: rs(40) }} />

          {stores.map((store) => (
            <TouchableOpacity
              key={store.storeId}
              style={styles.storeCard}
              onPress={() => router.push({ pathname: '/store/[id]', params: { id: String(store.storeId) } })}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <Image
                  source={{ uri: store.imageUrl || undefined }}
                  style={styles.storeImage}
                />
                <View style={styles.storeInfo}>
                  <Text style={styles.storeCategory}>
                    {formatStoreCategories(
                      store.storeCategories as StoreResponseStoreCategoriesItem[]
                    )}
                  </Text>
                  <Text style={styles.storeName}>{store.name}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.bookmarkBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  handleRemoveFavorite(store);
                }}
              >
                <Ionicons name="bookmark" size={rs(20)} color="#40CE2B" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <View style={{ height: rs(50) }} />
        </ScrollView>

        <View style={styles.filterContainer}>
          {isFilterOpen ? (
            <View style={styles.filterDropdown}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === 'recent' && styles.filterOptionSelected,
                ]}
                onPress={() => selectFilter('recent')}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterType === 'recent'
                      ? styles.textSelected
                      : styles.textUnselected,
                  ]}
                >
                  최근 찜한 순
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === 'rating' && styles.filterOptionSelected,
                ]}
                onPress={() => selectFilter('rating')}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterType === 'rating'
                      ? styles.textSelected
                      : styles.textUnselected,
                  ]}
                >
                  별점 높은 순
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.filterClosed} onPress={toggleFilter}>
              <Text style={styles.filterText}>
                {filterType === 'recent' ? '최근 찜한 순' : '별점 높은 순'}
              </Text>
              <Ionicons name="chevron-down" size={rs(12)} color="#828282" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(10),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  contentContainer: { flex: 1, paddingHorizontal: rs(20) },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: rs(10),
    marginBottom: rs(20),
  },
  pageTitle: {
    fontSize: rs(20),
    fontWeight: '600',
    color: 'black',
    fontFamily: 'Pretendard',
  },
  scrollContent: { paddingTop: rs(10) },
  storeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: rs(12),
    padding: rs(20),
    marginBottom: rs(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: rs(13) },
  storeImage: {
    width: rs(60),
    height: rs(60),
    borderRadius: rs(12),
    backgroundColor: '#D9D9D9',
  },
  storeInfo: { gap: rs(3) },
  storeCategory: {
    fontSize: rs(12),
    fontWeight: '500',
    color: '#828282',
    fontFamily: 'Pretendard',
  },
  storeName: {
    fontSize: rs(16),
    fontWeight: '600',
    color: 'black',
    fontFamily: 'Pretendard',
  },
  bookmarkBtn: { padding: rs(4) },
  filterContainer: { position: 'absolute', top: rs(50), left: rs(20), zIndex: 100 },
  filterClosed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    backgroundColor: 'rgba(217, 217, 217, 0.50)',
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(20),
  },
  filterText: {
    fontSize: rs(12),
    fontWeight: '400',
    color: 'black',
    fontFamily: 'Inter',
  },
  filterDropdown: {
    backgroundColor: 'white',
    borderRadius: rs(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: rs(110),
  },
  filterOption: {
    paddingVertical: rs(10),
    paddingHorizontal: rs(12),
    backgroundColor: 'white',
  },
  filterOptionSelected: { backgroundColor: '#D0E9D9' },
  filterOptionText: { fontSize: rs(13), fontFamily: 'Inter', fontWeight: '400' },
  textSelected: { color: '#34B262', fontWeight: '600' },
  textUnselected: { color: 'black' },
});
