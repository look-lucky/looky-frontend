import ConfettiIcon from '@/assets/images/icons/map/confetti.svg';
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
import { rs } from '@/src/shared/theme/scale';
import { Gray, Owner, Text } from '@/src/shared/theme/theme';
import type { Event, EventType } from '@/src/shared/types/event';
import type { Store } from '@/src/shared/types/store';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import type { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    FlatList,
    Image,
    Keyboard,
    Linking,
    Text as RNText,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ListItem =
  | { type: 'store'; data: Store }
  | { type: 'event'; data: Event }
  | { type: 'divider' }
  | { type: 'empty' };

export default function MapTab() {
  const { setTabBarVisible } = useTabBar();
  const router = useRouter();

  // ── 튜토리얼 상태 (5단계 구성) ──────────────────────────
  // 1: 검색바, 2: 카테고리, 3: 필터/목록, 4: 매장 범례, 5: 이벤트 범례
  const [tutorialStep, setTutorialStep] = useState(0);
  const totalSteps = 5;

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const shown = await AsyncStorage.getItem('MAP_TUTORIAL_SHOWN');
      if (shown !== 'true') {
        setTutorialStep(1);
      }
    } catch (e) {
      setTutorialStep(1);
    }
  };

  const finishTutorial = async () => {
    try {
      await AsyncStorage.setItem('MAP_TUTORIAL_SHOWN', 'true');
    } catch (e) { }
    setTutorialStep(0);
  };

  const resetTutorial = async () => {
    try {
      await AsyncStorage.removeItem('MAP_TUTORIAL_SHOWN');
      setTutorialStep(1);
    } catch (e) { }
  };

  const nextTutorial = () => {
    if (tutorialStep < totalSteps) {
      setTutorialStep(tutorialStep + 1);
    } else {
      finishTutorial();
    }
  };
  const searchInputRef = useRef<TextInput>(null);
  const naverMapRef = useRef<NaverMapViewRef>(null);
  const { category, eventId: eventIdParam } = useLocalSearchParams<{ category?: string; eventId?: string }>();
  const initialEventHandled = useRef(false);

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
    locationPermissionDenied,
    viewportSearch,
    handleViewportSearch,
    handleViewportReset,
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
    viewportSearch,
  });

  // 즐겨찾기 훅
  const { data: favoritesData, refetch: refetchFavorites } = useGetMyFavorites(
    { page: 0, size: 100 } as any,
    { query: { staleTime: 60 * 1000 } },
  );
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  // 즐겨찾기 ID Set
  const favoriteStoreIds = useMemo(() => {
    const response = favoritesData?.data as any;
    const favorites = response?.data?.content ?? [];
    return new Set(favorites.map((f: any) => String(f.storeId)));
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

  useEffect(() => {
    initialEventHandled.current = false;
  }, [eventIdParam]);

  useEffect(() => {
    if (!eventIdParam || initialEventHandled.current || events.length === 0) return;
    const event = events.find((e) => e.id === eventIdParam);
    if (event) {
      initialEventHandled.current = true;
      handleMapClick();
      setSelectedEventId(eventIdParam);
      setMapCenter({ lat: event.lat, lng: event.lng });
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    }
  }, [eventIdParam, events, handleMapClick, setMapCenter]);

  const isEventOnlyMode = selectedCategory === 'EVENT';
  const [showSearchHereButton, setShowSearchHereButton] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const latestCameraRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null);
  const cameraDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showSortModal, setShowSortModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('storeType');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      if (navigation.isFocused() && myLocation && naverMapRef.current) {
        naverMapRef.current.animateCameraTo({
          latitude: myLocation.lat,
          longitude: myLocation.lng,
          duration: 500,
        });
      }
    });
    return unsubscribe;
  }, [navigation, myLocation]);

  const [isTabFocused, setIsTabFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsTabFocused(true);
      if (viewMode === 'list') {
        setTabBarVisible(false);
      } else {
        setTabBarVisible(currentIndexRef.current === SNAP_INDEX.COLLAPSED);
      }

      return () => {
        setIsTabFocused(false);
        setTabBarVisible(true);
      };
    }, [viewMode, setTabBarVisible, currentIndexRef]),
  );

  useEffect(() => {
    if (viewMode === 'list') {
      setTabBarVisible(false);
    } else {
      setTabBarVisible(currentIndexRef.current === SNAP_INDEX.COLLAPSED);
    }
  }, [viewMode, setTabBarVisible, currentIndexRef]);

  const snapPoints = useMemo(() => {
    const collapsedHeight = 220;
    return [collapsedHeight, '50%', '80%'];
  }, []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      currentIndexRef.current = index;
      setTabBarVisible(index === SNAP_INDEX.COLLAPSED);
    },
    [setTabBarVisible, currentIndexRef],
  );

  const handleBackPress = useCallback(() => {
    const handled = handleBack();
    if (!handled) {
      if (currentIndexRef.current > SNAP_INDEX.COLLAPSED) {
        bottomSheetRef.current?.snapToIndex(SNAP_INDEX.COLLAPSED);
        return true;
      }
      return false;
    }
    return true;
  }, [handleBack, currentIndexRef]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [handleBackPress]),
  );

  const onMapClick = useCallback(() => {
    handleMapClick();
    setSelectedEventId(null);
    bottomSheetRef.current?.snapToIndex(SNAP_INDEX.COLLAPSED);
  }, [handleMapClick]);

  const onMarkerClick = useCallback(
    (markerId: string) => {
      setSelectedEventId(null);
      handleMarkerClick(markerId);
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    },
    [handleMarkerClick],
  );

  const onEventMarkerClick = useCallback(
    (markerId: string) => {
      const eventId = markerId.replace('event-', '');
      handleMapClick();
      setSelectedEventId(eventId);
      const event = events.find((e) => e.id === eventId);
      if (event) {
        setMapCenter({ lat: event.lat, lng: event.lng });
      }
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    },
    [events, handleMapClick, setMapCenter],
  );

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

  const handleViewEventDetail = useCallback(
    (eventId: string) => {
      router.push({
        pathname: '/event/[id]' as const,
        params: { id: eventId },
      } as any);
    },
    [router],
  );

  const handleEventCardPress = useCallback(
    (eventId: string) => {
      Keyboard.dismiss();
      setSelectedEventId(eventId);
      handleMapClick();
      const event = events.find((e) => e.id === eventId);
      if (event) {
        setMapCenter({ lat: event.lat, lng: event.lng });
      }
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    },
    [events, handleMapClick, setMapCenter],
  );

  const handleStoreCardPress = useCallback(
    (storeId: string) => {
      Keyboard.dismiss();
      handleStoreSelect(storeId);
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    },
    [handleStoreSelect],
  );

  const onSearchFocus = useCallback(() => {
    handleSearchFocus();
  }, [handleSearchFocus]);

  const onSearchSubmit = useCallback(() => {
    handleSearch();
    Keyboard.dismiss();
  }, [handleSearch]);

  const handleOpenFilterModal = (tab: FilterTab) => {
    setActiveFilterTab(tab);
    setShowFilterModal(true);
  };

  const handleSortSelect = (sortId: string | number) => {
    setSelectedSort(String(sortId));
  };

  const handleDistanceSelect = (distanceId: string | number) => {
    if (locationPermissionDenied) {
      Alert.alert(
        '위치 권한 필요',
        '거리 필터를 사용하려면 위치 권한이 필요해요.\n설정에서 위치 권한을 허용해주세요.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    handleViewportReset();
    setShowSearchHereButton(false);
    setSelectedDistance(String(distanceId));
  };

  const onFilterApply = (storeTypes: string[], moods: string[], events: string[]) => {
    handleFilterApply(storeTypes, moods, events);
    setShowFilterModal(false);
  };

  const handleCameraChanged = useCallback(
    ({ lat, lng, zoom, reason }: { lat: number; lng: number; zoom: number; reason: string }) => {
      latestCameraRef.current = { lat, lng, zoom };
      if (reason !== 'Gesture') return;
      if (cameraDebounceRef.current) clearTimeout(cameraDebounceRef.current);
      cameraDebounceRef.current = setTimeout(() => {
        setShowSearchHereButton(true);
      }, 300);
    },
    [],
  );

  const handleSearchHerePress = useCallback(() => {
    const camera = latestCameraRef.current;
    if (!camera) return;
    handleViewportSearch({ lat: camera.lat, lng: camera.lng }, camera.zoom);
    setShowSearchHereButton(false);
    setShowToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2000);
  }, [handleViewportSearch]);

  const flatListData = useMemo((): ListItem[] => {
    if (selectedStoreWithFavorite || selectedEvent || isLoading || isEventsLoading) return [];
    const items: ListItem[] = [];
    if (!isEventOnlyMode) {
      storesWithFavorite.forEach((store) => items.push({ type: 'store', data: store }));
    }
    if (!isEventOnlyMode && storesWithFavorite.length > 0 && events.length > 0) {
      items.push({ type: 'divider' });
    }
    events.forEach((event) => items.push({ type: 'event', data: event }));
    if (storesWithFavorite.length === 0 && events.length === 0) {
      items.push({ type: 'empty' });
    }
    return items;
  }, [selectedStoreWithFavorite, selectedEvent, isLoading, isEventsLoading, isEventOnlyMode, storesWithFavorite, events]);

  const renderBottomSheetHeader = useCallback(() => {
    if (selectedStoreWithFavorite) {
      return (
        <SelectedStoreDetail
          store={selectedStoreWithFavorite}
          onViewDetail={() => handleViewStoreDetail(selectedStoreWithFavorite.id)}
          onBookmarkPress={handleBookmarkPress}
        />
      );
    }
    if (selectedEvent) {
      return (
        <SelectedEventDetail
          event={selectedEvent}
          onViewDetail={() => handleViewEventDetail(selectedEvent.id)}
        />
      );
    }
    if (isLoading || isEventsLoading) {
      return (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Owner.primary} />
        </View>
      );
    }
    return null;
  }, [selectedStoreWithFavorite, selectedEvent, isLoading, isEventsLoading, handleViewStoreDetail, handleBookmarkPress, handleViewEventDetail]);

  const renderBottomSheetItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'store') {
      return (
        <StoreCard
          store={item.data}
          onPress={() => handleStoreCardPress(item.data.id)}
          onBookmarkPress={handleBookmarkPress}
        />
      );
    }
    if (item.type === 'event') {
      return (
        <EventCard
          event={item.data}
          onPress={() => handleEventCardPress(item.data.id)}
        />
      );
    }
    if (item.type === 'divider') {
      return (
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>이벤트</ThemedText>
          <View style={styles.dividerLine} />
        </View>
      );
    }
    if (item.type === 'empty') {
      return (
        <View style={styles.emptyState}>
          <Image
            source={require('@/assets/images/icons/map/search-none.png')}
            style={styles.emptyStateImage}
            resizeMode="contain"
          />
          <ThemedText style={styles.emptyStateTitle}>
            어라? 찾으시는 매장이 안 보여요.
          </ThemedText>
          <View style={styles.emptyStateBullets}>
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
      );
    }
    return null;
  }, [handleStoreCardPress, handleBookmarkPress, handleEventCardPress]);

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBox}>
        <View style={styles.searchIconButton}>
          <Ionicons name="chevron-back" size={24} color={Text.primary} />
        </View>
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
          {category.id === 'EVENT' && (
            <ConfettiIcon width={16} height={16} />
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

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.bottomFilterContent}
    >
      <TouchableOpacity
        style={styles.bottomFilterButton}
        onPress={() => setShowSortModal(true)}
      >
        <ThemedText style={styles.bottomFilterText}>
          {SORT_OPTIONS.find((o) => o.id === selectedSort)?.label}
        </ThemedText>
        <Ionicons name="chevron-down" size={14} color={Text.primary} />
      </TouchableOpacity>

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

  if (viewMode === 'list') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.listSafeArea} edges={['top']}>
          {renderSearchBar()}

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
                  <Image
                    source={require('@/assets/images/icons/map/search-none.png')}
                    style={styles.emptyStateImage}
                    resizeMode="contain"
                  />
                  <ThemedText style={styles.emptyStateTitle}>
                    어라? 찾으시는 매장이 안 보여요.
                  </ThemedText>
                  <View style={styles.emptyStateBullets}>
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
          onReset={handleFilterReset}
          onClose={() => setShowFilterModal(false)}
          onApply={onFilterApply}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {isTabFocused && (
        <NaverMap
          ref={naverMapRef}
          center={mapCenter}
          markers={isEventOnlyMode ? [] : markers}
          eventMarkers={eventMarkers}
          myLocation={myLocation}
          onMapClick={onMapClick}
          onMarkerClick={onMarkerClick}
          onEventMarkerClick={onEventMarkerClick}
          onCameraChanged={handleCameraChanged}
          onMapReady={() => { }}
          style={styles.map}
          isShowZoomControls={false}
        />
      )}

      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        {renderSearchBar()}
        {renderCategoryTabs()}
      </SafeAreaView>

      {showSearchHereButton && (
        <View style={styles.searchHereContainer} pointerEvents="box-none">
          <TouchableOpacity style={styles.searchHereButton} onPress={handleSearchHerePress}>
            <Ionicons name="refresh" size={14} color={Owner.primary} />
            <ThemedText style={styles.searchHereText}>이 지역에서 검색</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {showToast && (
        <View style={styles.searchHereContainer} pointerEvents="none">
          <View style={styles.toastBox}>
            <ThemedText style={styles.toastText}>현재 위치의 모든 가게를 불러왔어요.</ThemedText>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.controlButton, styles.controlButtonLeft]}
        onPress={() => {
          if (myLocation && naverMapRef.current) {
            naverMapRef.current.animateCameraTo({
              latitude: myLocation.lat,
              longitude: myLocation.lng,
              duration: 500,
            });
          }
        }}
      >
        <Ionicons name="locate" size={20} color={Owner.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.controlButton, styles.controlButtonRight]}
        onPress={() => bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF)}
      >
        <Ionicons name="list" size={20} color={Owner.primary} />
      </TouchableOpacity>

      {/* ── 튜토리얼 레이어 (1: 배경 및 하이라이트) ────────────────── */}
      {tutorialStep > 0 && (
        <View style={styles.tutorialBackgroundLayer} pointerEvents="box-none">
          <View style={styles.tutorialDimmer} />
          <SafeAreaView style={[styles.overlay, { zIndex: 10100 }]} edges={['top']} pointerEvents="none">
            <View style={{ opacity: tutorialStep === 1 ? 1 : 0 }}>
              {renderSearchBar()}
            </View>
            <View style={{ opacity: tutorialStep === 2 ? 1 : 0 }}>
              {renderCategoryTabs()}
            </View>
          </SafeAreaView>
        </View>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={SNAP_INDEX.COLLAPSED}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
        enablePanDownToClose={false}
        style={[styles.bottomSheetContainer, tutorialStep === 3 && { zIndex: 10500 }]}
      >
        <View style={styles.bottomSheetContent}>
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

          <BottomSheetFlatList
            data={flatListData}
            keyExtractor={(item: ListItem, index: number) => {
              if (item.type === 'store') return `store-${item.data.id}`;
              if (item.type === 'event') return `event-${item.data.id}`;
              return `${item.type}-${index}`;
            }}
            renderItem={renderBottomSheetItem}
            ListHeaderComponent={renderBottomSheetHeader}
            contentContainerStyle={styles.storeListContent}
            style={styles.scrollView}
          />
        </View>
      </BottomSheet>

      <SelectModal
        visible={showSortModal}
        options={SORT_OPTIONS}
        selectedId={selectedSort}
        onSelect={handleSortSelect}
        onClose={() => setShowSortModal(false)}
      />

      <SelectModal
        visible={showDistanceModal}
        options={DISTANCE_OPTIONS}
        selectedId={selectedDistance}
        onSelect={handleDistanceSelect}
        onClose={() => setShowDistanceModal(false)}
      />

      <StoreFilterModal
        visible={showFilterModal}
        activeTab={activeFilterTab}
        selectedStoreTypes={selectedStoreTypes}
        selectedMoods={selectedMoods}
        selectedEvents={selectedEvents}
        onTabChange={setActiveFilterTab}
        onReset={handleFilterReset}
        onClose={() => setShowFilterModal(false)}
        onApply={onFilterApply}
      />

      {tutorialStep === 0 && (
        <TouchableOpacity style={styles.devResetButton} onPress={resetTutorial}>
          <Ionicons name="refresh" size={20} color={Gray.white} />
          <RNText style={styles.devResetText}>초기화</RNText>
        </TouchableOpacity>
      )}



      {/* ── 튜토리얼 레이어 (2: 가이드 및 말풍선) ────────────────── */}
      {tutorialStep > 0 && (
        <View style={styles.tutorialGuideLayer} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={1}
            style={styles.tutorialTouchable}
            onPress={tutorialStep === 5 ? undefined : nextTutorial}
            pointerEvents="auto"
          >
            {/* 1단계: 검색바 설명 */}
            {tutorialStep === 1 && (
              <View style={[styles.bubbleContainer, { top: rs(125), left: rs(116), position: 'absolute' }]}>
                <View style={styles.yellowBubble}>
                  <View style={styles.bubbleTriangleUp} />
                  <RNText style={styles.bubbleText}>
                    가게를 검색하고 다양한 혜택들을 살펴볼 수 있어요
                  </RNText>
                </View>
              </View>
            )}

            {/* 2단계: 카테고리 설명 */}
            {tutorialStep === 2 && (
              <View style={[styles.bubbleContainer, { top: rs(161), left: rs(13), position: 'absolute' }]}>
                <View style={styles.yellowBubble}>
                  <View style={styles.bubbleTriangleUp} />
                  <RNText style={styles.bubbleText}>
                    매장 핀을 카테고리별로 확인할 수 있어요
                  </RNText>
                </View>
              </View>
            )}

            {/* 3단계: 바텀시트 설명 */}
            {tutorialStep === 3 && (
              <View style={[styles.bubbleContainer, { bottom: rs(170), left: rs(19), position: 'absolute' }]}>
                <View style={styles.yellowBubble}>
                  <RNText style={styles.bubbleText}>
                    가게를 내 위치 반경, 종류에 따라 필터링하고 상세 정보를 볼 수 있어요
                  </RNText>
                  <View style={styles.bubbleTriangleDown} />
                </View>
              </View>
            )}

            {/* 4단계: 매장 마커 종류 범례 */}
            {tutorialStep === 4 && (
              <View style={styles.legendOverlayAbsolute}>
                <View style={[styles.legendItemMap, { top: rs(258), left: rs(50) }]}>
                  <Image source={require('@/assets/images/icons/map/clover.png')} style={styles.legendIcon} />
                  <RNText style={styles.legendText}>
                    <RNText style={styles.legendHighlight}>제휴를 맺은 매장</RNText>이에요
                  </RNText>
                </View>
                <View style={[styles.legendItemMap, { top: rs(350), left: rs(140) }]}>
                  <Image source={require('@/assets/images/icons/map/clover-gray.png')} style={styles.legendIcon} />
                  <RNText style={styles.legendText}>
                    <RNText style={styles.legendHighlight}>제휴를 맺지 않은 매장</RNText>이에요
                  </RNText>
                </View>
                <View style={[styles.legendItemMap, { top: rs(440), left: rs(50) }]}>
                  <View style={styles.iconWithSmall}>
                    <Image source={require('@/assets/images/icons/map/clover-heart.png')} style={styles.legendIcon} />
                  </View>
                  <RNText style={styles.legendText}>
                    하트 아이콘이 보인다면{"\n"}
                    <RNText style={styles.legendHighlight}>쿠폰을 발행한 매장</RNText>이에요!
                  </RNText>
                </View>
              </View>
            )}

            {/* 5단계: 이벤트 마커 종류 범례 */}
            {tutorialStep === 5 && (
              <View style={styles.legendOverlay}>
                <View style={styles.legendItemIndented}>
                  <Image source={require('@/assets/images/icons/map/event-college.png')} style={styles.legendIconLarge} />
                  <RNText style={styles.legendText}>학교 아이콘은{"\n"}<RNText style={styles.legendHighlight}>학교 주관 이벤트</RNText>예요</RNText>
                </View>
                <View style={styles.legendItemIndented}>
                  <Image source={require('@/assets/images/icons/map/event-student.png')} style={styles.legendIconLarge} />
                  <RNText style={styles.legendText}>텐트 아이콘은{"\n"}<RNText style={styles.legendHighlight}>학생 주관 이벤트</RNText>예요</RNText>
                </View>
                <View style={styles.legendItemIndented}>
                  <Image source={require('@/assets/images/icons/map/event-food.png')} style={styles.legendIconLarge} />
                  <RNText style={styles.legendText}>트럭 아이콘은{"\n"}<RNText style={styles.legendHighlight}>푸드 관련 이벤트</RNText>예요</RNText>
                </View>
                <View style={styles.legendItemIndented}>
                  <Image source={require('@/assets/images/icons/map/event-busking.png')} style={styles.legendIconLarge} />
                  <RNText style={styles.legendText}>스피커 아이콘은{"\n"}<RNText style={styles.legendHighlight}>공연·전시·버스킹 이벤트</RNText>예요</RNText>
                </View>
                <View style={styles.legendItemIndented}>
                  <Image source={require('@/assets/images/icons/map/event-brand.png')} style={styles.legendIconLarge} />
                  <RNText style={styles.legendText}>팝업 아이콘은{"\n"}<RNText style={styles.legendHighlight}>브랜드 팝업 이벤트</RNText>예요</RNText>
                </View>
                <View style={styles.legendItemIndented}>
                  <Image source={require('@/assets/images/icons/map/event-market.png')} style={styles.legendIconLarge} />
                  <RNText style={styles.legendText}>부스 아이콘은{"\n"}<RNText style={styles.legendHighlight}>플리마켓 이벤트</RNText>예요</RNText>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.iconWithFire}>
                    <Image source={require('@/assets/images/icons/map/event-student-live.png')} style={styles.legendIconLarge} />
                  </View>
                  <RNText style={styles.legendText}>불 아이콘이 보인다면{"\n"}<RNText style={styles.legendHighlight}>오늘 진행되는 이벤트</RNText>예요!</RNText>
                </View>

                <View style={[styles.legendItem, { marginTop: rs(-15), paddingLeft: rs(80) }]}>
                  <Image source={require('@/assets/images/icons/map/event-food.png')} style={[styles.legendIconLarge, { opacity: 0.3 }]} />
                  <RNText style={styles.legendText}>아이콘이 불투명하다면{"\n"}<RNText style={styles.legendHighlight}>진행 예정인 이벤트</RNText>예요!</RNText>
                </View>

                <TouchableOpacity style={styles.finalizeButton} onPress={finishTutorial}>
                  <RNText style={styles.finalizeButtonText}>지도 보러가기 {'>'}</RNText>
                </TouchableOpacity>
              </View>
            )}

            {tutorialStep < 5 && (
              <RNText style={[
                styles.clickToContinue,
                tutorialStep === 3 && { bottom: undefined, top: rs(205) }
              ]}>
                클릭해서 계속하기
              </RNText>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    paddingTop: 12,
    paddingBottom: 4,
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
    paddingTop: 0,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Gray.white,
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: Gray.black,
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
  controlButton: {
    position: 'absolute',
    bottom: 236,
    width: rs(44),
    height: rs(44),
    borderRadius: 22,
    backgroundColor: Gray.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Gray.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonLeft: {
    left: 16,
  },
  controlButtonRight: {
    right: 16,
  },
  // 이 지역에서 검색 버튼
  searchHereContainer: {
    position: 'absolute',
    bottom: 236,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  searchHereButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Gray.white,
    shadowColor: Gray.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  searchHereText: {
    fontSize: rs(14),
    fontWeight: '600',
    color: Owner.primary,
  },
  // 토스트
  toastBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  toastText: {
    fontSize: rs(13),
    color: Gray.white,
  },
  // 바텀시트
  bottomSheetContainer: {
    backgroundColor: 'transparent',
  },
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
  storeListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
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
  loadingState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: rs(16),
    fontWeight: '600',
    color: Text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateBullets: {
    alignSelf: 'center',
  },
  emptyStateText: {
    fontSize: rs(14),
    color: Text.secondary,
    marginBottom: 4,
  },
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
  emptyStateImage: {
    width: rs(160),
    height: rs(160),
    marginBottom: 20,
  },
  // ── 튜토리얼 스타일 ──
  tutorialBackgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
  },
  tutorialGuideLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 11000,
  },
  tutorialDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  highlightWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10100,
  },
  tutorialTouchable: {
    flex: 1,
  },
  clickToContinue: {
    position: 'absolute',
    bottom: rs(140),
    width: '100%',
    textAlign: 'center',
    color: Gray.white,
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 1.0)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  yellowBubble: {
    backgroundColor: '#FBBC05',
    padding: rs(8),
    borderRadius: rs(10),
    maxWidth: rs(250),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  bubbleContainer: {
    position: 'absolute',
  },
  bubbleText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  bubbleTriangleUp: {
    position: 'absolute',
    top: -10,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FBBC05',
  },
  bubbleTriangleDown: {
    position: 'absolute',
    bottom: -10,
    left: rs(20),
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FBBC05',
  },
  legendOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: rs(180),
    paddingHorizontal: rs(40),
    gap: rs(20),
  },
  legendOverlayAbsolute: {
    flex: 1,
    position: 'relative',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    overflow: 'visible',
  },
  legendItemIndented: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    overflow: 'visible',
    paddingLeft: rs(30),
  },
  legendItemMap: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    width: '80%',
  },
  legendIcon: {
    width: rs(40),
    height: rs(40),
    resizeMode: 'contain',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    overflow: 'visible',
  },
  legendIconLarge: {
    width: rs(40),
    height: rs(40),
    resizeMode: 'contain',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    overflow: 'visible',
  },
  legendText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  legendHighlight: {
    color: '#FFDA00',
    fontSize: 14,
  },
  iconWithSmall: {
    position: 'relative',
  },
  iconWithFire: {
    position: 'relative',
  },
  finalizeButton: {
    alignSelf: 'flex-end',
    marginTop: rs(20),
  },
  finalizeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 1.0)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  devResetButton: {
    position: 'absolute',
    top: rs(60),
    right: rs(20),
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: rs(8),
    borderRadius: rs(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  devResetText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
