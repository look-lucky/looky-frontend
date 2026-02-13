import type {
  GetStoresCategoriesItem,
  GetStoresMoodsItem,
  CommonResponsePageResponseStoreResponse,
  StoreResponse,
} from '@/src/api/generated.schemas';
import { customFetch } from '@/src/api/mutator';
import { CATEGORY_TO_API } from '@/src/shared/constants/map';
import type { Store } from '@/src/shared/types/store';
import {
  getDistanceKm,
  transformStoreResponses,
} from '@/src/shared/utils/store-transform';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// -------------------------------------------------------------------
// API 직접 호출 (Orval의 pageable 직렬화 문제 우회)
// -------------------------------------------------------------------
interface StoreSearchParams {
  keyword?: string;
  categories?: string[];
  moods?: string[];
  page?: number;
  size?: number;
}

async function fetchStores(params: StoreSearchParams) {
  const qs = new URLSearchParams();

  if (params.keyword) qs.append('keyword', params.keyword);
  params.categories?.forEach((c) => qs.append('categories', c));
  params.moods?.forEach((m) => qs.append('moods', m));
  qs.append('page', String(params.page ?? 0));
  qs.append('size', String(params.size ?? 50));

  const queryString = qs.toString();
  const url = queryString ? `/api/stores?${queryString}` : '/api/stores';

  return customFetch<{
    data: CommonResponsePageResponseStoreResponse;
    status: number;
    headers: Headers;
  }>(url, { method: 'GET' });
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

  // ------ API 파라미터 조합 ------
  const apiCategories = useMemo((): string[] => {
    // 카테고리 탭에서 선택된 것
    const tabCategory = CATEGORY_TO_API[selectedCategory];
    // 필터 모달에서 선택된 것
    const filterCategories = [...selectedStoreTypes];

    if (tabCategory && !filterCategories.includes(tabCategory)) {
      filterCategories.push(tabCategory);
    }

    return filterCategories;
  }, [selectedCategory, selectedStoreTypes]);

  const queryParams = useMemo(
    (): StoreSearchParams => ({
      keyword: submittedKeyword || undefined,
      categories: apiCategories.length > 0 ? apiCategories : undefined,
      moods: selectedMoods.length > 0 ? selectedMoods : undefined,
      page: 0,
      size: 50,
    }),
    [submittedKeyword, apiCategories, selectedMoods],
  );

  // ------ API 호출 ------
  // list 모드에서 검색어 없이 전체 데이터를 fetch하지 않도록 차단
  const {
    data: rawData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['stores', queryParams],
    queryFn: () => fetchStores(queryParams),
    staleTime: 3 * 60 * 1000,
    enabled: viewMode !== 'list' || !!submittedKeyword,
  });

  // ------ 데이터 변환 ------
  const storeResponses: StoreResponse[] = useMemo(() => {
    return rawData?.data?.data?.content ?? [];
  }, [rawData]);

  const stores: Store[] = useMemo(() => {
    return transformStoreResponses(storeResponses, myLocation);
  }, [storeResponses, myLocation]);

  // 거리 필터 + 정렬 적용 (클라이언트)
  const filteredStores: Store[] = useMemo(() => {
    let result = [...stores];

    // 거리 필터
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
    } else if (selectedSort === 'benefits') {
      result.sort((a, b) => Number(b.hasCoupon) - Number(a.hasCoupon));
    }

    return result;
  }, [stores, myLocation, selectedDistance, selectedSort]);

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
      const store = stores.find((s) => s.id === storeId);
      if (store && store.lat && store.lng) {
        setMapCenter({ lat: store.lat, lng: store.lng });
      }
    },
    [stores],
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
    return false; // not handled (바텀시트 접기 등은 map.tsx에서 처리)
  }, [viewMode]);

  const handleFilterApply = useCallback(() => {
    // selectedStoreTypes, selectedMoods가 변경되면
    // queryParams가 자동으로 바뀌고 → useQuery 자동 refetch
  }, []);

  const handleFilterReset = useCallback(() => {
    setSelectedStoreTypes([]);
    setSelectedMoods([]);
    setSelectedEvents([]);
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
    handleStoreTypeToggle,
    handleMoodToggle,
    handleEventToggle,
  };
}
