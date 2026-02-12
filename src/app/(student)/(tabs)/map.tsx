import {
  useAddFavorite,
  useGetMyFavorites,
  useRemoveFavorite,
} from '@/src/api/favorite';
import { EventCard } from '@/src/app/(student)/components/event/event-card';
import { SelectedEventDetail } from '@/src/app/(student)/components/event/selected-event-detail';
import { NaverMap } from '@/src/app/(student)/components/map/naver-map-view';
import { SelectedStoreDetail } from '@/src/app/(student)/components/map/selected-store-detail';
import { FilterTab, StoreFilterModal } from '@/src/app/(student)/components/map/store-filter-modal';
import { StoreCard } from '@/src/app/(student)/components/store/store-card';
import { SelectModal } from '@/src/shared/common/select-modal';
import { ThemedText } from '@/src/shared/common/themed-text';
import { ThemedView } from '@/src/shared/common/themed-view';
import {
  CATEGORY_TABS,
  DISTANCE_OPTIONS,
  SNAP_INDEX,
  SORT_OPTIONS,
} from '@/src/shared/constants/map';
import { useTabBar } from '@/src/shared/contexts/tab-bar-context';
import { useEvents } from '@/src/shared/hooks/use-events';
import { useMapSearch } from '@/src/shared/hooks/use-map-search';
import type { Event, EventType } from '@/src/shared/types/event';
import type { Store } from '@/src/shared/types/store';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Owner, Text } from '@/src/shared/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapTab() {
  const { setTabBarVisible } = useTabBar();
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);
  const { category } = useLocalSearchParams<{ category?: string }>();

  const {
    keyword,
    setKeyword,
    viewMode,
    selectedCategory,
    selectedSort,
    setSelectedSort,
    selectedDistance,
    setSelectedDistance,
    selectedStoreTypes,
    selectedMoods,
    selectedEvents,
    mapCenter,
    setMapCenter,
    currentIndexRef,
    submittedKeyword,
    stores,
    markers,
    selectedStore,
    isLoading,
    refetchStores,
    myLocation,
    handleSearchFocus,
    handleSearch,
    handleCategorySelect,
    handleStoreSelect,
    handleMarkerClick,
    handleMapClick,
    handleBack,
    handleFilterApply,
    handleFilterReset,
    handleStoreTypeToggle,
    handleMoodToggle,
    handleEventToggle,
  } = useMapSearch();

  // 홈에서 카테고리 선택 후 진입 시 해당 카테고리 활성화
  useEffect(() => {
    if (category) {
      // category-section에서 'ALL'로 보내지만 CATEGORY_TABS는 'all'
      const normalizedCategory = category === 'ALL' ? 'all' : category;
      const validCategories = CATEGORY_TABS.map((tab) => tab.id);
      const targetCategory = validCategories.includes(normalizedCategory)
        ? normalizedCategory
        : 'all';
      handleCategorySelect(targetCategory);
    }
  }, [category, handleCategorySelect]);

  // 이벤트 훅
  const {
    events,
    eventMarkers,
    isLoading: isEventsLoading,
    refetchEvents,
  } = useEvents({
    myLocation,
    selectedDistance,
    selectedSort,
    selectedEventTypes: selectedEvents as EventType[],
  });

  // 즐겨찾기 훅
  const { data: favoritesData, refetch: refetchFavorites } = useGetMyFavorites(
    { pageable: { page: 0, size: 100 } },
    { query: { staleTime: 60 * 1000 } },
  );
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  // 즐겨찾기 ID Set
  const favoriteStoreIds = useMemo(() => {
    const response = favoritesData?.data as
      | { data?: { content?: { storeId?: number }[] } }
      | undefined;
    const favorites = response?.data?.content ?? [];
    return new Set(favorites.map((f) => String(f.storeId)));
  }, [favoritesData]);

  // stores에 isFavorite 매핑
  const storesWithFavorite: Store[] = useMemo(() => {
    return stores.map((store) => ({
      ...store,
      isFavorite: favoriteStoreIds.has(store.id),
    }));
  }, [stores, favoriteStoreIds]);

  // selectedStore에 isFavorite 매핑
  const selectedStoreWithFavorite = useMemo(() => {
    if (!selectedStore) return null;
    return {
      ...selectedStore,
      isFavorite: favoriteStoreIds.has(selectedStore.id),
    };
  }, [selectedStore, favoriteStoreIds]);

  // 북마크 토글 핸들러
  const handleBookmarkPress = useCallback(
    async (storeId: string) => {
      const isFavorite = favoriteStoreIds.has(storeId);
      try {
        if (isFavorite) {
          await removeFavoriteMutation.mutateAsync({ storeId: Number(storeId) });
        } else {
          await addFavoriteMutation.mutateAsync({ storeId: Number(storeId) });
        }
        refetchFavorites();
      } catch (error) {
        console.error('즐겨찾기 토글 실패:', error);
      }
    },
    [favoriteStoreIds, addFavoriteMutation, removeFavoriteMutation, refetchFavorites],
  );

  // 선택된 이벤트 상태
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return events.find((e) => e.id === selectedEventId) ?? null;
  }, [selectedEventId, events]);

  // 카테고리가 'EVENT'인지 확인 (이벤트만 보기 모드)
  const isEventOnlyMode = selectedCategory === 'EVENT';

  // 모달 state
  const [showSortModal, setShowSortModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('storeType');

  // 바텀시트 ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // 탭 포커스/블러 시 탭바 제어
  // - 다른 탭으로 이동(blur) → 탭바 강제 복구
  // - 다시 돌아올 때(focus) → 현재 상태에 맞게 탭바 적용
  useFocusEffect(
    useCallback(() => {
      if (viewMode === 'list') {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(currentIndexRef.current === SNAP_INDEX.COLLAPSED);
      }

      return () => {
        setTabBarVisible(true);
      };
    }, [viewMode, setTabBarVisible, currentIndexRef]),
  );

  // viewMode 변경 시 탭바 제어
  useEffect(() => {
    if (viewMode === 'list') {
      setTabBarVisible(false);
    } else {
      setTabBarVisible(currentIndexRef.current === SNAP_INDEX.COLLAPSED);
    }
  }, [viewMode, setTabBarVisible, currentIndexRef]);

  // snap points
  const snapPoints = useMemo(() => {
    const collapsedHeight = 220;
    return [collapsedHeight, '50%', '80%'];
  }, []);

  // 바텀시트 인덱스 변경
  const handleSheetChanges = useCallback(
    (index: number) => {
      currentIndexRef.current = index;
      setTabBarVisible(index === SNAP_INDEX.COLLAPSED);
    },
    [setTabBarVisible, currentIndexRef],
  );

  // 뒤로가기
  const handleBackPress = useCallback(() => {
    const handled = handleBack();
    if (!handled) {
      // 바텀시트가 확장된 상태면 접기
      if (currentIndexRef.current > SNAP_INDEX.COLLAPSED) {
        bottomSheetRef.current?.snapToIndex(SNAP_INDEX.COLLAPSED);
      }
    }
  }, [handleBack, currentIndexRef]);

  // 지도 클릭
  const onMapClick = useCallback(() => {
    handleMapClick();
    setSelectedEventId(null);
    bottomSheetRef.current?.snapToIndex(SNAP_INDEX.COLLAPSED);
  }, [handleMapClick]);

  // 가게 마커 클릭
  const onMarkerClick = useCallback(
    (markerId: string) => {
      setSelectedEventId(null);
      handleMarkerClick(markerId);
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    },
    [handleMarkerClick],
  );

  // 이벤트 마커 클릭
  const onEventMarkerClick = useCallback(
    (markerId: string) => {
      // markerId는 "event-{id}" 형식
      const eventId = markerId.replace('event-', '');
      handleMapClick(); // 가게 선택 해제
      setSelectedEventId(eventId);
      const event = events.find((e) => e.id === eventId);
      if (event) {
        setMapCenter({ lat: event.lat, lng: event.lng });
      }
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    },
    [events, handleMapClick, setMapCenter],
  );

  // 가게 상세 보기
  const handleViewStoreDetail = useCallback(
    (storeId: string) => {
      const store = stores.find((s) => s.id === storeId);
      router.push({
        pathname: '/store/[id]',
        params: {
          id: storeId,
          name: store?.name ?? '',
          image: store?.image ?? '',
          rating: String(store?.rating ?? 0),
          reviewCount: String(store?.reviewCount ?? 0),
        },
      });
    },
    [stores, router],
  );

  // 이벤트 상세 보기
  const handleViewEventDetail = useCallback(
    (eventId: string) => {
      router.push({
        pathname: '/event/[id]' as const,
        params: { id: eventId },
      } as any);
    },
    [router],
  );

  // 이벤트 카드 클릭
  const handleEventCardPress = useCallback(
    (eventId: string) => {
      Keyboard.dismiss();
      setSelectedEventId(eventId);
      handleMapClick(); // 가게 선택 해제
      const event = events.find((e) => e.id === eventId);
      if (event) {
        setMapCenter({ lat: event.lat, lng: event.lng });
      }
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    },
    [events, handleMapClick, setMapCenter],
  );

  // 리스트에서 가게 카드 클릭
  const handleStoreCardPress = useCallback(
    (storeId: string) => {
      Keyboard.dismiss();
      handleStoreSelect(storeId);
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    },
    [handleStoreSelect],
  );

  // 검색 포커스
  const onSearchFocus = useCallback(() => {
    handleSearchFocus();
  }, [handleSearchFocus]);

  // 검색 실행
  const onSearchSubmit = useCallback(() => {
    handleSearch();
    Keyboard.dismiss();
  }, [handleSearch]);

  // 필터 모달 핸들러
  const handleOpenFilterModal = (tab: FilterTab) => {
    setActiveFilterTab(tab);
    setShowFilterModal(true);
  };

  const handleSortSelect = (sortId: string | number) => {
    setSelectedSort(String(sortId));
  };

  const handleDistanceSelect = (distanceId: string | number) => {
    setSelectedDistance(String(distanceId));
  };

  const onFilterApply = () => {
    handleFilterApply();
    setShowFilterModal(false);
  };

  // ────────────────────────────────────────────
  // 공통: 검색바 + 카테고리 탭
  // ────────────────────────────────────────────
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBox}>
        <TouchableOpacity style={styles.searchIconButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color={Text.primary} />
        </TouchableOpacity>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="행운의 가게를 검색하세요!"
          placeholderTextColor={Text.placeholder}
          value={keyword}
          onChangeText={setKeyword}
          onFocus={onSearchFocus}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchIconButton} onPress={onSearchSubmit}>
          <Ionicons name="search" size={24} color={Text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {CATEGORY_TABS.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.filterButton,
            selectedCategory === category.id && styles.filterButtonActive,
          ]}
          onPress={() => handleCategorySelect(category.id)}
        >
          {selectedCategory === category.id && (
            <Ionicons
              name="checkmark"
              size={16}
              color={Gray.white}
              style={styles.filterCheck}
            />
          )}
          <ThemedText
            style={[
              styles.filterText,
              selectedCategory === category.id && styles.filterTextActive,
            ]}
          >
            {category.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // ────────────────────────────────────────────
  // 공통: 필터 칩 행
  // ────────────────────────────────────────────
  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.bottomFilterContent}
    >
      {/* 정렬 버튼 */}
      <TouchableOpacity
        style={styles.bottomFilterButton}
        onPress={() => setShowSortModal(true)}
      >
        <ThemedText style={styles.bottomFilterText}>
          {SORT_OPTIONS.find((o) => o.id === selectedSort)?.label}
        </ThemedText>
        <Ionicons name="chevron-down" size={14} color={Text.primary} />
      </TouchableOpacity>

      {/* 가게 종류 버튼 */}
      <TouchableOpacity
        style={[
          styles.bottomFilterButton,
          selectedStoreTypes.length > 0 && styles.bottomFilterButtonActive,
        ]}
        onPress={() => handleOpenFilterModal('storeType')}
      >
        <ThemedText
          style={[
            styles.bottomFilterText,
            selectedStoreTypes.length > 0 && styles.bottomFilterTextActive,
          ]}
        >
          가게 종류{selectedStoreTypes.length > 0 ? ` ${selectedStoreTypes.length}` : ''}
        </ThemedText>
        <Ionicons
          name="chevron-down"
          size={14}
          color={selectedStoreTypes.length > 0 ? Owner.primary : Text.primary}
        />
      </TouchableOpacity>

      {/* 이벤트 버튼 */}
      <TouchableOpacity
        style={[
          styles.bottomFilterButton,
          selectedEvents.length > 0 && styles.bottomFilterButtonActive,
        ]}
        onPress={() => handleOpenFilterModal('event')}
      >
        <ThemedText
          style={[
            styles.bottomFilterText,
            selectedEvents.length > 0 && styles.bottomFilterTextActive,
          ]}
        >
          이벤트{selectedEvents.length > 0 ? ` ${selectedEvents.length}` : ''}
        </ThemedText>
        <Ionicons
          name="chevron-down"
          size={14}
          color={selectedEvents.length > 0 ? Owner.primary : Text.primary}
        />
      </TouchableOpacity>
    </ScrollView>
  );

  // ────────────────────────────────────────────
  // 리스트 뷰 (전체화면)
  // ────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.listSafeArea} edges={['top']}>
          {renderSearchBar()}

          {/* 검색어 제출 전에는 카테고리/필터/목록 숨김 */}
          {submittedKeyword ? (
            <>
              {renderCategoryTabs()}
              <View style={styles.listFilterRow}>{renderFilterChips()}</View>

              {isLoading ? (
                <View style={styles.centerContent}>
                  <ActivityIndicator size="large" color={Owner.primary} />
                </View>
              ) : storesWithFavorite.length > 0 ? (
                <FlatList
                  data={storesWithFavorite}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <StoreCard
                      store={item}
                      onPress={() => handleStoreCardPress(item.id)}
                      onBookmarkPress={handleBookmarkPress}
                    />
                  )}
                  contentContainerStyle={styles.listContent}
                  keyboardShouldPersistTaps="handled"
                />
              ) : (
                <View style={styles.centerContent}>
                  <View style={styles.emptyStateCard}>
                    <ThemedText style={styles.emptyStateTitle}>
                      아직 찾으시는 데이터이 안 보여요...
                    </ThemedText>
                    <ThemedText style={styles.emptyStateText}>
                      {'\u2022'} 검색어의 철자가 정확한지 확인해 보세요.
                    </ThemedText>
                    <ThemedText style={styles.emptyStateText}>
                      {'\u2022'} 다른 키워드로 검색해 보시겠어요?
                    </ThemedText>
                    <ThemedText style={styles.emptyStateText}>
                      {'\u2022'} 필터 조건을 변경하면 더 많은 결과를 찾을 수 있어요!
                    </ThemedText>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.centerContent}>
              <ThemedText style={styles.emptyStateTitle}>
                검색어를 입력해 주세요
              </ThemedText>
            </View>
          )}
        </SafeAreaView>

        {/* 모달들 */}
        <SelectModal
          visible={showSortModal}
          options={SORT_OPTIONS}
          selectedId={selectedSort}
          onSelect={handleSortSelect}
          onClose={() => setShowSortModal(false)}
        />
        <StoreFilterModal
          visible={showFilterModal}
          activeTab={activeFilterTab}
          selectedStoreTypes={selectedStoreTypes}
          selectedMoods={selectedMoods}
          selectedEvents={selectedEvents}
          onTabChange={setActiveFilterTab}
          onStoreTypeToggle={handleStoreTypeToggle}
          onMoodToggle={handleMoodToggle}
          onEventToggle={handleEventToggle}
          onReset={handleFilterReset}
          onClose={() => setShowFilterModal(false)}
          onApply={onFilterApply}
        />
      </ThemedView>
    );
  }

  // ────────────────────────────────────────────
  // 지도 뷰 (기본)
  // ────────────────────────────────────────────
  return (
    <ThemedView style={styles.container}>
      {/* 지도 */}
      <NaverMap
        center={mapCenter}
        markers={isEventOnlyMode ? [] : markers}
        eventMarkers={eventMarkers}
        myLocation={myLocation}
        onMapClick={onMapClick}
        onMarkerClick={onMarkerClick}
        onEventMarkerClick={onEventMarkerClick}
        onMapReady={() => {}}
        style={styles.map}
        isShowZoomControls={false}
      />

      {/* 오버레이 UI */}
      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        {renderSearchBar()}
        {renderCategoryTabs()}
      </SafeAreaView>

      {/* 지도 컨트롤 버튼 */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            refetchStores();
            refetchEvents();
          }}
        >
          <Ionicons name="refresh" size={20} color={Owner.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF)}
        >
          <Ionicons name="list" size={20} color={Owner.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (myLocation) {
              setMapCenter({ lat: myLocation.lat, lng: myLocation.lng });
            }
          }}
        >
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
            <TouchableOpacity
              style={styles.bottomSheetTriggerContent}
              onPress={() => setShowDistanceModal(true)}
            >
              <ThemedText type="subtitle" lightColor={Text.primary}>
                주변 {DISTANCE_OPTIONS.find((o) => o.id === selectedDistance)?.label}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={Text.primary} />
            </TouchableOpacity>

            {renderFilterChips()}
          </View>

          {/* 가게/이벤트 목록 또는 선택된 상세 */}
          <BottomSheetScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.storeListContent}
          >
            {/* 선택된 가게 상세 */}
            {selectedStoreWithFavorite ? (
              <SelectedStoreDetail
                store={selectedStoreWithFavorite}
                onViewDetail={() => handleViewStoreDetail(selectedStoreWithFavorite.id)}
                onBookmarkPress={handleBookmarkPress}
              />
            ) : selectedEvent ? (
              /* 선택된 이벤트 상세 */
              <SelectedEventDetail
                event={selectedEvent}
                onViewDetail={() => handleViewEventDetail(selectedEvent.id)}
              />
            ) : isLoading || isEventsLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={Owner.primary} />
              </View>
            ) : (
              <>
                {/* 이벤트만 보기 모드가 아닐 때 가게 목록 */}
                {!isEventOnlyMode && storesWithFavorite.length > 0 && (
                  <>
                    {storesWithFavorite.map((store) => (
                      <StoreCard
                        key={store.id}
                        store={store}
                        onPress={() => handleStoreCardPress(store.id)}
                        onBookmarkPress={handleBookmarkPress}
                      />
                    ))}
                  </>
                )}

                {/* 이벤트 목록 (가게 아래 또는 이벤트만 보기 모드) */}
                {events.length > 0 && (
                  <>
                    {/* 구분선 (가게가 있을 때만) */}
                    {!isEventOnlyMode && storesWithFavorite.length > 0 && (
                      <View style={styles.sectionDivider}>
                        <View style={styles.dividerLine} />
                        <ThemedText style={styles.dividerText}>이벤트</ThemedText>
                        <View style={styles.dividerLine} />
                      </View>
                    )}
                    {events.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onPress={() => handleEventCardPress(event.id)}
                      />
                    ))}
                  </>
                )}

                {/* 빈 상태 */}
                {storesWithFavorite.length === 0 && events.length === 0 && (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyStateTitle}>
                      아직 찾으시는 데이터가 안 보여요...
                    </ThemedText>
                    <ThemedText style={styles.emptyStateText}>
                      {'\u2022'} 다른 검색어로 시도해보세요
                    </ThemedText>
                  </View>
                )}
              </>
            )}
          </BottomSheetScrollView>
        </View>
      </BottomSheet>

      {/* 정렬 선택 모달 */}
      <SelectModal
        visible={showSortModal}
        options={SORT_OPTIONS}
        selectedId={selectedSort}
        onSelect={handleSortSelect}
        onClose={() => setShowSortModal(false)}
      />

      {/* 거리 선택 모달 */}
      <SelectModal
        visible={showDistanceModal}
        options={DISTANCE_OPTIONS}
        selectedId={selectedDistance}
        onSelect={handleDistanceSelect}
        onClose={() => setShowDistanceModal(false)}
      />

      {/* 필터 모달 */}
      <StoreFilterModal
        visible={showFilterModal}
        activeTab={activeFilterTab}
        selectedStoreTypes={selectedStoreTypes}
        selectedMoods={selectedMoods}
        selectedEvents={selectedEvents}
        onTabChange={setActiveFilterTab}
        onStoreTypeToggle={handleStoreTypeToggle}
        onMoodToggle={handleMoodToggle}
        onEventToggle={handleEventToggle}
        onReset={handleFilterReset}
        onClose={() => setShowFilterModal(false)}
        onApply={onFilterApply}
      />
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
  // 검색바
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
  // 카테고리 탭
  filterContainer: {
    flexGrow: 0,
    flexShrink: 0,
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
  // 지도 컨트롤
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
  // 바텀시트
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
    justifyContent: 'flex-start',
    marginBottom: 12,
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
  bottomFilterButtonActive: {
    backgroundColor: Owner.primary + '15',
    borderColor: Owner.primary,
  },
  bottomFilterTextActive: {
    color: Owner.primary,
    fontWeight: '600',
  },
  // 가게 목록
  storeListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  // 섹션 구분선
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: rs(16),
    gap: rs(12),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Gray.gray3,
  },
  dividerText: {
    fontSize: rs(13),
    color: Text.secondary,
    fontWeight: '500',
  },
  // 로딩
  loadingState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  // 빈 상태
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Text.secondary,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: Text.tertiary,
    marginBottom: 4,
  },
  // ── 리스트 뷰 전용 ──
  listSafeArea: {
    flex: 1,
    backgroundColor: Gray.white,
  },
  listFilterRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexGrow: 0,
    flexShrink: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
});
