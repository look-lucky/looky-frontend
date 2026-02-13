import { customFetch } from '@/src/api/mutator';
import type { Event, EventStatus, EventType } from '@/src/shared/types/event';
import {
  getEventStatus,
  isEventVisible,
} from '@/src/shared/types/event';
import { getDistanceKm } from '@/src/shared/utils/store-transform';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// -------------------------------------------------------------------
// API Response 타입
// -------------------------------------------------------------------
interface EventResponse {
  id: number;
  title: string;
  description: string;
  eventTypes: EventType[];
  latitude: number;
  longitude: number;
  startDateTime: string;
  endDateTime: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  imageUrls: string[];
  place?: string;
  createdAt: string;
}

interface PageResponseEventResponse {
  content: EventResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface CommonResponsePageResponseEventResponse {
  isSuccess: boolean;
  data: PageResponseEventResponse;
}

// -------------------------------------------------------------------
// API 호출 함수
// -------------------------------------------------------------------
interface EventSearchParams {
  eventTypes?: EventType[];
  status?: ('UPCOMING' | 'LIVE' | 'ENDED')[];
  page?: number;
  size?: number;
}

async function fetchEvents(params: EventSearchParams) {
  const qs = new URLSearchParams();

  params.eventTypes?.forEach((t) => qs.append('eventTypes', t));
  params.status?.forEach((s) => qs.append('status', s));
  qs.append('page', String(params.page ?? 0));
  qs.append('size', String(params.size ?? 50));

  const queryString = qs.toString();
  const url = queryString ? `/api/events?${queryString}` : '/api/events';

  return customFetch<{
    data: CommonResponsePageResponseEventResponse;
    status: number;
    headers: Headers;
  }>(url, { method: 'GET' });
}

// -------------------------------------------------------------------
// Response → Event 변환
// -------------------------------------------------------------------
function transformEventResponse(
  response: EventResponse,
  myLocation: { lat: number; lng: number } | null,
): Event {
  const startDateTime = new Date(response.startDateTime);
  const endDateTime = new Date(response.endDateTime);

  // 거리 계산
  let distance: string | undefined;
  if (myLocation && response.latitude && response.longitude) {
    const km = getDistanceKm(
      myLocation.lat,
      myLocation.lng,
      response.latitude,
      response.longitude,
    );
    distance = km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  }

  return {
    id: String(response.id),
    title: response.title,
    description: response.description,
    eventTypes: response.eventTypes,
    lat: response.latitude,
    lng: response.longitude,
    startDateTime,
    endDateTime,
    status: getEventStatus({ startDateTime, endDateTime } as Event),
    imageUrls: response.imageUrls ?? [],
    place: response.place,
    distance,
    createdAt: new Date(response.createdAt),
  };
}

// -------------------------------------------------------------------
// Hook
// -------------------------------------------------------------------
interface UseEventsOptions {
  myLocation: { lat: number; lng: number } | null;
  selectedDistance?: string; // km 단위 (0 = 무제한)
  selectedSort?: string;
  selectedEventTypes?: EventType[]; // 선택된 이벤트 타입 필터
  viewportSearch?: { center: { lat: number; lng: number }; zoom: number } | null;
  enabled?: boolean;
}

// zoom 레벨 → 화면에 보이는 반경(km) 근사값
function getViewportRadiusKm(zoom: number): number {
  return 45000 / Math.pow(2, zoom);
}

export function useEvents({
  myLocation,
  selectedDistance = '1',
  selectedSort = 'distance',
  selectedEventTypes = [],
  viewportSearch = null,
  enabled = true,
}: UseEventsOptions) {
  // API 호출 (UPCOMING, LIVE 상태만)
  const {
    data: rawData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['events'],
    queryFn: () => fetchEvents({ status: ['UPCOMING', 'LIVE'], size: 100 }),
    staleTime: 3 * 60 * 1000,
    enabled,
  });

  // 변환
  const eventResponses: EventResponse[] = useMemo(() => {
    return rawData?.data?.data?.content ?? [];
  }, [rawData]);

  const events: Event[] = useMemo(() => {
    return eventResponses.map((r) => transformEventResponse(r, myLocation));
  }, [eventResponses, myLocation]);

  // 필터링: 표시 가능한 이벤트만 (D-7 ~ 종료 당일 자정)
  const visibleEvents: Event[] = useMemo(() => {
    return events.filter(isEventVisible);
  }, [events]);

  // 거리 필터 + 정렬
  const filteredEvents: Event[] = useMemo(() => {
    let result = [...visibleEvents];

    // 이벤트 타입 필터
    if (selectedEventTypes.length > 0) {
      result = result.filter((event) =>
        event.eventTypes.some((type) => selectedEventTypes.includes(type)),
      );
    }

    // 거리 필터 (뷰포트 모드 vs 거리 필터 모드)
    if (viewportSearch) {
      const radius = getViewportRadiusKm(viewportSearch.zoom);
      result = result.filter((event) => {
        if (!event.lat || !event.lng) return false;
        return (
          getDistanceKm(
            viewportSearch.center.lat,
            viewportSearch.center.lng,
            event.lat,
            event.lng,
          ) <= radius
        );
      });
    } else {
      const maxKm = parseInt(selectedDistance);
      if (maxKm > 0 && myLocation) {
        result = result.filter((event) => {
          if (!event.lat || !event.lng) return false;
          return (
            getDistanceKm(myLocation.lat, myLocation.lng, event.lat, event.lng) <=
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
    }

    // 상태순 정렬 (live > upcoming > ended)
    const statusOrder: Record<EventStatus, number> = {
      live: 0,
      upcoming: 1,
      ended: 2,
    };
    result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return result;
  }, [visibleEvents, myLocation, selectedDistance, selectedSort, selectedEventTypes, viewportSearch]);

  // 이벤트 마커 생성
  const eventMarkers = useMemo(
    () =>
      filteredEvents
        .filter((event) => event.status !== 'ended')
        .map((event) => ({
          id: `event-${event.id}`,
          lat: event.lat,
          lng: event.lng,
          title: event.title,
          type: 'event' as const,
          eventType: event.eventTypes[0],
          status: event.status,
        })),
    [filteredEvents],
  );

  return {
    events: filteredEvents,
    eventMarkers,
    isLoading,
    isError,
    refetchEvents: refetch,
  };
}
