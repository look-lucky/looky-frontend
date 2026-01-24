import { NaverMap } from '@/src/components/map/naver-map-view';
import { SelectedStoreDetail } from '@/src/components/map/selected-store-detail';
import { SortDropdown } from '@/src/components/map/sort-dropdown';
import { Store, StoreCard } from '@/src/components/map/store-card';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import {
  BOTTOM_FILTERS,
  DUMMY_STORES,
  FILTER_CATEGORIES,
  SNAP_INDEX,
  SORT_OPTIONS,
} from '@/src/constants/map';
import { useTabBar } from '@/src/contexts/tab-bar-context';
import { rs } from '@/src/theme/scale';
import { Gray, Owner, Text } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapTab() {
  const { setTabBarVisible } = useTabBar();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('distance');
  const [mapCenter] = useState({ lat: 35.8448, lng: 127.1294 }); // 전북대학교
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Store[]>([]);
  const [hasSearched, setHasSearched] = useState(false); // 검색 실행 여부
  const [showSortOptions, setShowSortOptions] = useState(false);

  // 가게 데이터에서 마커 생성
  const markers = useMemo(() =>
    DUMMY_STORES.map(store => ({
      id: store.id,
      lat: store.lat,
      lng: store.lng,
      title: store.name,
    })),
  []);

  const selectedStore = useMemo(() => {
    if (!selectedStoreId) return null;
      return DUMMY_STORES.find(store => store.id === selectedStoreId) ?? null;
  }, [selectedStoreId]);

  // 바텀시트 ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const currentIndexRef = useRef(0); // 현재 바텀시트 인덱스 추적

  // 화면 이탈 시 탭바 복구
  useEffect(() => {
    return () => {
      setTabBarVisible(true);
    };
  }, [setTabBarVisible]);

  // snap points: 접힌 상태 / 중간 / 풀
  const snapPoints = useMemo(() => {
    const collapsedHeight = 220; // 헤더 + 필터 버튼만 보이는 높이
    return [collapsedHeight, '50%', '80%'];
  }, []);

  // 바텀시트 인덱스 변경 시 탭바 숨김/표시
  const handleSheetChanges = useCallback((index: number) => {
    currentIndexRef.current = index;
    // index 0 (접힌 상태)일 때만 탭바 보임
    setTabBarVisible(index === SNAP_INDEX.COLLAPSED);
  }, [setTabBarVisible]);

  // 뒤로가기 버튼: 바텀시트 확장 상태면 접기, 아니면 검색 초기화
  const handleBack = useCallback(() => {
    if (currentIndexRef.current > SNAP_INDEX.COLLAPSED) {
      // 바텀시트가 확장된 상태면 접기
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.COLLAPSED);
    } else {
      // 이미 접힌 상태면 검색 초기화
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
    }
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked:', lat, lng);
    // 지도 클릭 시 선택 해제 및 바텀시트 접기
    setSelectedStoreId(null);
    bottomSheetRef.current?.snapToIndex(SNAP_INDEX.COLLAPSED);
  };

  const handleMarkerClick = (markerId: string) => {
    console.log('Marker clicked:', markerId);
    // 마커에 해당하는 가게 찾기
    const store = DUMMY_STORES.find(s => s.id === markerId);
    if (store) {
      setSelectedStoreId(store.id);
      // 마커 클릭 시 바텀시트 중간으로
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    }
  };

  const handleMapReady = () => {
    console.log('Map ready');
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return; // 빈 검색어 무시

    setHasSearched(true);
    // 검색 실행 - 실제로는 API 호출
    // 더미: 검색어가 포함된 가게만 필터링
    const filtered = DUMMY_STORES.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
    // 바텀시트 중간으로 확장
    bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
  };

  const handleSortSelect = (sortId: string) => {
    setSelectedSort(sortId);
    setShowSortOptions(false);
  };

  const handleViewStoreDetail = (storeId: string) => {
    router.push(`/store/${storeId}`);
  };

  return (
    <ThemedView style={styles.container}>
      {/* 지도 (전체 화면 배경) */}
      <NaverMap
        center={mapCenter}
        markers={markers}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
        onMapReady={handleMapReady}
        style={styles.map}
      />

      {/* 오버레이 UI */}
      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        {/* 검색바 */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <TouchableOpacity style={styles.searchIconButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color={Text.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="행운의 가게를 검색하세요!"
              placeholderTextColor={Text.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchIconButton} onPress={handleSearch}>
              <Ionicons name="search" size={24} color={Text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 필터 버튼 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {FILTER_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                selectedFilter === category.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(category.id)}
            >
              {selectedFilter === category.id && (
                <Ionicons name="checkmark" size={16} color={Gray.white} style={styles.filterCheck} />
              )}
              <ThemedText
                style={[
                  styles.filterText,
                  selectedFilter === category.id && styles.filterTextActive,
                ]}
              >
                {category.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* 지도 컨트롤 버튼 (오른쪽) */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="refresh" size={20} color={Owner.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF)}
        >
          <Ionicons name="list" size={20} color={Owner.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="locate" size={20} color={Owner.primary} />
        </TouchableOpacity>
      </View>

      {/* 바텀시트 */}
      <BottomSheet
        ref={bottomSheetRef}
        index={SNAP_INDEX.COLLAPSED}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
        enablePanDownToClose={false}
      >
        <View style={styles.bottomSheetContent}>
          {/* 바텀시트 헤더 */}
          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetTriggerContent}>
              <ThemedText style={styles.bottomSheetTriggerText}>
                주변 0km
              </ThemedText>
              <Ionicons name="chevron-up" size={20} color={Text.primary} />
            </View>

            {/* 필터 버튼 행 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.bottomFilterContainer}
              contentContainerStyle={styles.bottomFilterContent}
            >
              {/* 거리순 드롭다운 */}
              <TouchableOpacity
                style={styles.bottomFilterButton}
                onPress={() => setShowSortOptions(!showSortOptions)}
              >
                <ThemedText style={styles.bottomFilterText}>
                  {SORT_OPTIONS.find(o => o.id === selectedSort)?.label}
                </ThemedText>
                <Ionicons
                  name={showSortOptions ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={Text.primary}
                />
              </TouchableOpacity>

              {/* 다른 필터 버튼들 */}
              {BOTTOM_FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={styles.bottomFilterButton}
                >
                  <ThemedText style={styles.bottomFilterText}>
                    {filter.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 정렬 옵션 드롭다운 */}
            {showSortOptions && (
              <SortDropdown
                options={SORT_OPTIONS}
                selectedId={selectedSort}
                onSelect={handleSortSelect}
              />
            )}
          </View>

          {/* 선택된 가게 상세 또는 검색 결과 목록 */}
          <BottomSheetScrollView style={styles.scrollView} contentContainerStyle={styles.storeListContent}>
          {selectedStore  ? (
            <SelectedStoreDetail
              store={selectedStore}
              onViewDetail={() => handleViewStoreDetail(selectedStore.id)}
            />
          ) : searchResults.length > 0 ? (
            searchResults.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))
          ) : hasSearched ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                검색 결과가 없습니다
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                다른 검색어로 시도해보세요
              </ThemedText>
            </View>
          ) : null}
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Gray.white,
    borderRadius: 12,
    height: rs(56),
    paddingHorizontal: 8,
  },
  searchIconButton: {
    width: rs(40),
    height: rs(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Text.primary,
  },
  filterContainer: {
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Gray.white,
    borderWidth: 1,
    borderColor: Owner.primary,
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: Gray.black,
    borderColor: Owner.primary,
  },
  filterCheck: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    color: Text.primary,
  },
  filterTextActive: {
    color: Gray.white,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -60 }],
    gap: 12,
  },
  controlButton: {
    width: rs(44),
    height: rs(44),
    borderRadius: 20,
    backgroundColor: Gray.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Gray.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // 바텀시트 스타일
  bottomSheetBackground: {
    backgroundColor: Gray.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  bottomSheetHandle: {
    backgroundColor: Gray.gray4,
    width: 40,
    height: 4,
  },
  bottomSheetHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: Gray.white,
    zIndex: 1,
  },
  bottomSheetTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bottomSheetTriggerText: {
    fontSize: 16,
    fontWeight: '600',
    color: Text.primary,
  },
  bottomFilterContainer: {
  },
  bottomFilterContent: {
    gap: 8,
    paddingBottom: 12,
  },
  bottomFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Gray.gray2,
    borderWidth: 1,
    borderColor: Gray.gray4,
    gap: 4,
  },
  bottomFilterText: {
    fontSize: 13,
    color: Text.primary,
  },
  // 가게 목록
  storeListContent: {
    paddingHorizontal: 16,
  },
  // 빈 상태
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Text.secondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Text.tertiary,
  },
});
