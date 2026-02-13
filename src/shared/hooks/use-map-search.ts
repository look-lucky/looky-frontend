import { useGetStoreMap } from '@/src/api/store';
import { CATEGORY_TO_API } from '@/src/shared/constants/map';
import type { Store } from '@/src/shared/types/store';
import {
  getDistanceKm,
  transformStoreMapResponses,
} from '@/src/shared/utils/store-transform';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// zoom 레벨 → 화면에 보이는 반경(km) 근사값 (위도 36° 기준, 화면 반폭 ~400dp)
function getViewportRadiusKm(zoom: number): number {
  return 45000 / Math.pow(2, zoom);
}

// -------------------------------------------------------------------
// Hook
// -------------------------------------------------------------------
export function useMapSearch() {
  // 검색
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');

  // 뷰 모드
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // 카테고리 탭
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 필터
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState('distance');
  const [selectedDistance, setSelectedDistance] = useState('1');

  // 뷰포트 검색 상태 (null = 거리 필터 모드, non-null = 뷰포트 모드)
  const [viewportSearch, setViewportSearch] = useState<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);

  // 선택된 가게
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // 위치
  const [myLocation, setMyLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  // 지도 중심
  const [mapCenter, setMapCenter] = useState({ lat: 35.8448, lng: 127.1294 });

  // 바텀시트 인덱스 추적
  const currentIndexRef = useRef(0);

  // 위치 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setMyLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } else {
        setLocationPermissionDenied(true);
      }
    })();
  }, []);

  // ------ API 호출 (/api/stores/map) ------
  const {
    data: rawData,
    isLoading,
    isError,
    refetch,
  } = useGetStoreMap({
    query: {
      staleTime: 3 * 60 * 1000,
    },
  });

  // ------ 데이터 변환 ------
  const allStores: Store[] = useMemo(() => {
    const raw = rawData?.data?.data ?? [];
    return transformStoreMapResponses(raw, myLocation);
  }, [rawData, myLocation]);

  // 카테고리 + 키워드 + 무드 클라이언트 필터
  const apiCategories = useMemo((): string[] => {
    const tabCategory = CATEGORY_TO_API[selectedCategory];
    const filterCategories = [...selectedStoreTypes];
    if (tabCategory && !filterCategories.includes(tabCategory)) {
      filterCategories.push(tabCategory);
    }
    return filterCategories;
  }, [selectedCategory, selectedStoreTypes]);

  const stores: Store[] = useMemo(() => {
    let result = allStores;

    // 카테고리 필터
    if (apiCategories.length > 0) {
      result = result.filter((store) => {
        if (!store.category) return false;
        return apiCategories.some((cat) => store.category?.includes(
          cat === 'RESTAURANT' ? '식당'
          : cat === 'BAR' ? '주점'
          : cat === 'CAFE' ? '카페'
          : cat === 'ENTERTAINMENT' ? '놀거리'
          : cat === 'BEAUTY_HEALTH' ? '뷰티/건강'
          : cat
        ));
      });
    }

    // 키워드 필터 (리스트 뷰 검색)
    if (submittedKeyword) {
      const kw = submittedKeyword.toLowerCase();
      result = result.filter((store) =>
        store.name.toLowerCase().includes(kw)
      );
    }

    return result;
  }, [allStores, apiCategories, submittedKeyword]);

  // 거리 필터 + 정렬 적용 (클라이언트)
  const filteredStores: Store[] = useMemo(() => {
    let result = [...stores];

    if (viewportSearch) {
      // 뷰포트 모드: 지도 중심 기준 반경 필터
      const radius = getViewportRadiusKm(viewportSearch.zoom);
      result = result.filter((store) => {
        if (!store.lat || !store.lng) return false;
        return (
          getDistanceKm(
            viewportSearch.center.lat,
            viewportSearch.center.lng,
            store.lat,
            store.lng,
          ) <= radius
        );
      });
    } else {
      // 거리 필터 모드: 내 위치 기준
      const maxKm = parseInt(selectedDistance);
      if (maxKm > 0 && myLocation) {
        result = result.filter((store) => {
          if (!store.lat || !store.lng) return false;
          return (
            getDistanceKm(myLocation.lat, myLocation.lng, store.lat, store.lng) <=
            maxKm
          );
        });
      }
    }

    // 정렬
    if (selectedSort === 'distance' && myLocation) {
      result.sort((a, b) => {
        const distA =
          a.lat && a.lng
            ? getDistanceKm(myLocation.lat, myLocation.lng, a.lat, a.lng)
            : Infinity;
        const distB =
          b.lat && b.lng
            ? getDistanceKm(myLocation.lat, myLocation.lng, b.lat, b.lng)
            : Infinity;
        return distA - distB;
      });
    } else if (selectedSort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === 'reviews') {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (selectedSort === 'popular') {
      result.sort((a, b) => (b.favoriteCount ?? 0) - (a.favoriteCount ?? 0));
    }

    return result;
  }, [stores, myLocation, selectedDistance, selectedSort, viewportSearch]);

  // 마커 생성
  const markers = useMemo(
    () =>
      filteredStores.map((store) => ({
        id: store.id,
        lat: store.lat,
        lng: store.lng,
        title: store.name,
        isPartner: store.isPartner,
        hasCoupon: store.hasCoupon,
      })),
    [filteredStores],
  );

  // 선택된 가게
  const selectedStore = useMemo(() => {
    if (!selectedStoreId) return null;
    return filteredStores.find((s) => s.id === selectedStoreId) ?? null;
  }, [selectedStoreId, filteredStores]);

  // ------ 액션 핸들러 ------
  const handleSearchFocus = useCallback(() => {
    setViewMode('list');
  }, []);

  const handleSearch = useCallback(() => {
    if (!keyword.trim()) return;
    setSubmittedKeyword(keyword.trim());
    // 리스트 뷰 유지 (검색 결과 보기)
  }, [keyword]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleStoreSelect = useCallback(
    (storeId: string) => {
      setSelectedStoreId(storeId);
      setViewMode('map');
      // 선택된 가게 위치로 지도 중심 이동
      const store = allStores.find((s) => s.id === storeId);
      if (store && store.lat && store.lng) {
        setMapCenter({ lat: store.lat, lng: store.lng });
      }
    },
    [allStores],
  );

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      const store = filteredStores.find((s) => s.id === markerId);
      if (store) {
        setSelectedStoreId(store.id);
      }
    },
    [filteredStores],
  );

  const handleMapClick = useCallback(() => {
    setSelectedStoreId(null);
  }, []);

  const handleBack = useCallback(() => {
    if (viewMode === 'list') {
      setViewMode('map');
      setKeyword('');
      setSubmittedKeyword('');
      return true; // handled
    }
    // 검색 결과로 지도를 보다가 뒤로가기 → 검색 리스트로 복귀
    if (viewMode === 'map' && submittedKeyword) {
      setViewMode('list');
      setSelectedStoreId(null);
      return true; // handled
    }
    return false; // not handled (바텀시트 접기 등은 map.tsx에서 처리)
  }, [viewMode, submittedKeyword]);

  const handleFilterApply = useCallback(
    (storeTypes: string[], moods: string[], events: string[]) => {
      setSelectedStoreTypes(storeTypes);
      setSelectedMoods(moods);
      setSelectedEvents(events);
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    setSelectedStoreTypes([]);
    setSelectedMoods([]);
    setSelectedEvents([]);
  }, []);

  const handleViewportSearch = useCallback(
    (center: { lat: number; lng: number }, zoom: number) => {
      setViewportSearch({ center, zoom });
    },
    [],
  );

  const handleViewportReset = useCallback(() => {
    setViewportSearch(null);
  }, []);

  const handleStoreTypeToggle = useCallback((id: string) => {
    setSelectedStoreTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleMoodToggle = useCallback((id: string) => {
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleEventToggle = useCallback((id: string) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  return {
    // 상태
    keyword,
    setKeyword,
    viewMode,
    setViewMode,
    selectedCategory,
    selectedSort,
    setSelectedSort,
    selectedDistance,
    setSelectedDistance,
    selectedStoreId,
    setSelectedStoreId,
    selectedStoreTypes,
    selectedMoods,
    selectedEvents,
    myLocation,
    locationPermissionDenied,
    viewportSearch,
    mapCenter,
    setMapCenter,
    currentIndexRef,
    submittedKeyword,

    // 데이터
    stores: filteredStores,
    markers,
    selectedStore,
    isLoading,
    isError,
    refetchStores: refetch,

    // 액션
    handleSearchFocus,
    handleSearch,
    handleCategorySelect,
    handleStoreSelect,
    handleMarkerClick,
    handleMapClick,
    handleBack,
    handleFilterApply,
    handleFilterReset,
    handleViewportSearch,
    handleViewportReset,
    handleStoreTypeToggle,
    handleMoodToggle,
    handleEventToggle,
  };
}
