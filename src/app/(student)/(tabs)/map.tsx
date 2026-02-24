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
import BottomSheet, { BottomSheetFlatList, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Keyboard,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type ListItem =
  | { type: 'store'; data: Store }
  | { type: 'event'; data: Event }
  | { type: 'divider' }
  | { type: 'empty' };

export default function MapTab() {
  const { setTabBarVisible } = useTabBar();
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);
  const naverMapRef = useRef<NaverMapViewRef>(null);
  const { category, eventId: eventIdParam, centerOnEvents } = useLocalSearchParams<{ category?: string; eventId?: string; centerOnEvents?: string }>();
  const initialEventHandled = useRef(false);
  const centerOnEventsHandledRef = useRef(false);

  const {
    keyword,
    setKeyword,
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

  // eventIdParam이 바뀔 때마다 처리 플래그 리셋 (같은 이벤트 재진입 or 다른 이벤트 진입 모두 대응)
  useEffect(() => {
    initialEventHandled.current = false;
  }, [eventIdParam]);

  // 홈에서 이벤트 카드 눌러서 진입 시 해당 이벤트 선택 + 지도 중심 이동 + 바텀시트 열기
  useEffect(() => {
    if (!eventIdParam || initialEventHandled.current || events.length === 0) return;
    const event = events.find((e) => e.id === eventIdParam);
    if (event) {
      initialEventHandled.current = true;
      // 카메라 이동과 바텀시트 오픈을 분리 (동시 실행 시 Naver Map 리사이즈 crash 방지)
      const timer1 = setTimeout(() => {
        handleMapClick();
        setSelectedEventId(eventIdParam);
        setMapCenter({ lat: event.lat, lng: event.lng });
      }, 300);
      const timer2 = setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
      }, 800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [eventIdParam, events, handleMapClick, setMapCenter]);

  // centerOnEvents 파라미터 변경 시 플래그 리셋
  useEffect(() => {
    centerOnEventsHandledRef.current = false;
  }, [centerOnEvents]);

  // '이벤트 N개' 배너 클릭 시 → 첫 번째 이벤트 위치로 카메라 이동
  useEffect(() => {
    if (centerOnEvents !== 'true' || centerOnEventsHandledRef.current || events.length === 0) return;
    const firstEvent = events[0];
    if (firstEvent?.lat && firstEvent?.lng) {
      centerOnEventsHandledRef.current = true;
      const timer = setTimeout(() => {
        naverMapRef.current?.animateCameraTo({
          latitude: firstEvent.lat,
          longitude: firstEvent.lng,
          duration: 500,
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [centerOnEvents, events]);

  // 카테고리가 'EVENT'인지 확인 (이벤트만 보기 모드)
  const isEventOnlyMode = selectedCategory === 'EVENT';

  // 이 지역에서 검색 버튼 / 토스트
  const [showSearchHereButton, setShowSearchHereButton] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const latestCameraRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null);
  const cameraDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 모달 state
  const [showSortModal, setShowSortModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('storeType');

  // 바텀시트 ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // 지도 탭을 이미 보고 있는 상태에서 탭 아이콘 재클릭 시 현재 위치로 리셋
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

  // 지도 탭 포커스 상태 (NaverMap 크래시 방지용 - 탭 이탈 시 clean unmount)
  const [isTabFocused, setIsTabFocused] = useState(true);
  const mountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 탭 포커스/블러 시 탭바 제어
  useFocusEffect(
    useCallback(() => {
      // 탭 복귀 시 현재 시트 위치에 맞게 탭바 복원 (sheet가 올라가 있으면 탭바 숨김 유지)
      setTabBarVisible(currentIndexRef.current === SNAP_INDEX.COLLAPSED);
      // 빠른 탭 전환 시 NaverMap 재마운트를 debounce (200ms 안정 후 마운트)
      if (mountTimerRef.current) clearTimeout(mountTimerRef.current);
      mountTimerRef.current = setTimeout(() => setIsTabFocused(true), 200);
      return () => {
        if (mountTimerRef.current) {
          clearTimeout(mountTimerRef.current);
          mountTimerRef.current = null;
        }
        setIsTabFocused(false);
        setTabBarVisible(true);
      };
    }, [setTabBarVisible]),
  );

  // snap points
  // bottomInset을 insets.bottom만 사용하므로, 탭바 높이(56)를 collapsedHeight에 흡수
  const collapsedHeight = 130 + 56;
  const snapPoints = useMemo(() => [collapsedHeight, '60%', '90%'], []);

  // 바텀시트 인덱스 변경
  const handleSheetChanges = useCallback(
    (index: number) => {
      currentIndexRef.current = index;
      setTabBarVisible(index === SNAP_INDEX.COLLAPSED);
    },
    [currentIndexRef, setTabBarVisible],
  );

  // 뒤로가기
  const handleBackPress = useCallback(() => {
    // 가게 선택 상태 → 선택 해제 (검색 결과 복귀, 바텀시트 유지)
    if (selectedStore) {
      handleBack();
      return true;
    }
    // 검색 결과 표시 중 → 바텀시트 먼저 접고 키워드 초기화 (애니메이션 즉시 시작)
    if (submittedKeyword) {
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.COLLAPSED);
      handleBack();
      return true;
    }
    // 바텀시트가 열려있으면 접기
    if (currentIndexRef.current > SNAP_INDEX.COLLAPSED) {
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.COLLAPSED);
      return true;
    }
    return false;
  }, [handleBack, selectedStore, submittedKeyword, currentIndexRef]);

  // 안드로이드 하드웨어 뒤로가기 처리
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [handleBackPress]),
  );

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
      // 지도 카메라를 선택한 가게 위치로 직접 이동
      const store = stores.find((s) => s.id === storeId);
      if (store?.lat && store?.lng) {
        naverMapRef.current?.animateCameraTo({
          latitude: store.lat,
          longitude: store.lng,
          duration: 500,
        });
      }
      bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
    },
    [handleStoreSelect, stores],
  );

  // 검색 포커스
  const onSearchFocus = useCallback(() => {
    handleSearchFocus();
  }, [handleSearchFocus]);

  // 검색 실행
  const onSearchSubmit = useCallback(() => {
    if (!keyword.trim()) return;
    handleSearch();
    Keyboard.dismiss();
    // 검색 결과를 바텀시트(절반)로 표시
    bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF);
  }, [handleSearch, keyword]);

  // stores 최신값을 ref로 유지 (검색 카메라 이동에서 stale closure 방지)
  const storesRef = useRef(stores);
  useEffect(() => { storesRef.current = stores; }, [stores]);

  // 검색 키워드가 바뀌면 첫 번째 결과 위치로 카메라 이동
  useEffect(() => {
    if (!submittedKeyword || storesRef.current.length === 0) return;
    const first = storesRef.current[0];
    if (first?.lat && first?.lng) {
      naverMapRef.current?.animateCameraTo({
        latitude: first.lat,
        longitude: first.lng,
        duration: 500,
      });
    }
  }, [submittedKeyword]);

  // 필터 모달 핸들러
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

  // 카메라 변경 (사용자 제스처일 때만 버튼 노출, 300ms 디바운스)
  const handleCameraChanged = useCallback(
    ({ lat, lng, zoom, reason }: { lat: number; lng: number; zoom: number; reason: string }) => {
      latestCameraRef.current = { lat, lng, zoom };
      if (reason !== 'Gesture') return; // 사용자 제스처일 때만
      if (cameraDebounceRef.current) clearTimeout(cameraDebounceRef.current);
      cameraDebounceRef.current = setTimeout(() => {
        setShowSearchHereButton(true);
      }, 300);
    },
    [],
  );

  // "이 지역에서 검색" 버튼 클릭
  const handleSearchHerePress = useCallback(() => {
    const camera = latestCameraRef.current;
    if (!camera) return;
    handleViewportSearch({ lat: camera.lat, lng: camera.lng }, camera.zoom);
    setShowSearchHereButton(false);
    // 토스트 표시
    setShowToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2000);
  }, [handleViewportSearch]);

  // ────────────────────────────────────────────
  // 바텀시트 FlatList 데이터 (가상화)
  // ────────────────────────────────────────────
  const flatListData = useMemo((): ListItem[] => {
    if (selectedStoreWithFavorite || selectedEvent || isLoading || isEventsLoading) return [];
    const items: ListItem[] = [];
    if (!isEventOnlyMode) {
      storesWithFavorite.forEach((store) => items.push({ type: 'store', data: store }));
    }
    // 검색 중에는 가게만 표시 (이벤트 숨김)
    if (!submittedKeyword) {
      if (!isEventOnlyMode && storesWithFavorite.length > 0 && events.length > 0) {
        items.push({ type: 'divider' });
      }
      events.forEach((event) => items.push({ type: 'event', data: event }));
    }
    if (items.length === 0) {
      items.push({ type: 'empty' });
    }
    return items;
  }, [selectedStoreWithFavorite, selectedEvent, isLoading, isEventsLoading, isEventOnlyMode, storesWithFavorite, events, submittedKeyword]);

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

  // 컨트롤 버튼/검색버튼 위치 (바텀시트 collapsed 바로 위)
  // collapsedHeight가 탭바 높이(56)를 흡수하므로 safe area만 더함
  const floatingButtonBottom = insets.bottom + collapsedHeight + 12;

  // ────────────────────────────────────────────
  // 지도 뷰 (기본) — 검색 결과도 바텀시트로 표시
  // ────────────────────────────────────────────
  return (
    <ThemedView style={styles.container}>
      {/* 지도 - 탭 이탈 시 clean unmount하여 RNCNaverMapView IndexOutOfBoundsException 방지 */}
      {isTabFocused && (
        <NaverMap
          ref={naverMapRef}
          center={mapCenter}
          markers={markers}
          hideStoreMarkers={isEventOnlyMode}
          eventMarkers={eventMarkers}
          myLocation={myLocation}
          onMapClick={onMapClick}
          onMarkerClick={onMarkerClick}
          onEventMarkerClick={onEventMarkerClick}
          onCameraChanged={handleCameraChanged}
          onMapReady={() => {}}
          style={styles.map}
          isShowZoomControls={false}
        />
      )}

      {/* 오버레이 UI */}
      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        {renderSearchBar()}
        {renderCategoryTabs()}
      </SafeAreaView>

      {/* "이 지역에서 검색" 버튼 */}
      {showSearchHereButton && (
        <View style={[styles.searchHereContainer, { bottom: floatingButtonBottom }]} pointerEvents="box-none">
          <TouchableOpacity style={styles.searchHereButton} onPress={handleSearchHerePress}>
            <Ionicons name="refresh" size={14} color={Owner.primary} />
            <ThemedText style={styles.searchHereText}>이 지역에서 검색</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* 토스트 */}
      {showToast && (
        <View style={[styles.searchHereContainer, { bottom: floatingButtonBottom }]} pointerEvents="none">
          <View style={styles.toastBox}>
            <ThemedText style={styles.toastText}>현재 위치의 모든 가게를 불러왔어요.</ThemedText>
          </View>
        </View>
      )}

      {/* 지도 컨트롤 버튼 */}
      <TouchableOpacity
        style={[styles.controlButton, styles.controlButtonLeft, { bottom: floatingButtonBottom }]}
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
        style={[styles.controlButton, styles.controlButtonRight, { bottom: floatingButtonBottom }]}
        onPress={() => bottomSheetRef.current?.snapToIndex(SNAP_INDEX.HALF)}
      >
        <Ionicons name="list" size={20} color={Owner.primary} />
      </TouchableOpacity>

      {/* safe area 하단 배경 (bottomInset 영역에 지도가 비치지 않도록) */}
      {insets.bottom > 0 && (
        <View style={[styles.safeAreaBackground, { height: insets.bottom }]} />
      )}

      {/* 바텀시트 */}
      <BottomSheet
        ref={bottomSheetRef}
        index={SNAP_INDEX.COLLAPSED}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
        enablePanDownToClose={false}
        enableContentPanningGesture={false}
        bottomInset={insets.bottom}
        style={styles.bottomSheetContainer}
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
          {(selectedStoreWithFavorite || selectedEvent || isLoading || isEventsLoading) ? (
            <BottomSheetScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.storeListContent, { paddingBottom: rs(20) }]}
            >
              {renderBottomSheetHeader()}
            </BottomSheetScrollView>
          ) : (
            <BottomSheetFlatList
              data={flatListData}
              keyExtractor={(item: ListItem, index: number) => {
                if (item.type === 'store') return `store-${item.data.id}`;
                if (item.type === 'event') return `event-${item.data.id}`;
                return `${item.type}-${index}`;
              }}
              renderItem={renderBottomSheetItem}
              contentContainerStyle={[styles.storeListContent, { paddingBottom: rs(20) }]}
              style={styles.scrollView}
            />
          )}
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
    shadowOpacity: 0,
    elevation: 0,
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
  emptyStateImage: {
    width: rs(160),
    height: rs(160),
    marginBottom: 20,
  },
  safeAreaBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Gray.white,
  },
});
