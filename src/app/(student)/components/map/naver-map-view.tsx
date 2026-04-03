import { useEventCluster, useMapCluster, type EventClusterPoint } from '@/src/shared/hooks/use-map-cluster';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Notify, Text as TextColor } from '@/src/shared/theme/theme';
import type { EventStatus, EventType } from '@/src/shared/types/event';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Platform, Image as RNImage, StyleSheet, View } from 'react-native';

// ── 클러스터 아이콘 URI를 모듈 로드 시점에 고정 ──────────────────
// require()는 번들러가 처리하므로 resolveAssetSource는 항상 동기적으로 URI 반환
const CLUSTER_ICON = require('@/assets/images/icons/map/clover-cluster.png');
const EVENT_CLUSTER_ICON = require('@/assets/images/icons/map/event-cluster.png');

// ✅ URI 동기적으로 추출 (번들에서 바로 가져오므로 항상 즉시 가능)
const CLUSTER_ICON_URI = RNImage.resolveAssetSource(CLUSTER_ICON).uri;
const EVENT_CLUSTER_ICON_URI = RNImage.resolveAssetSource(EVENT_CLUSTER_ICON).uri;

// 가게 마커 아이콘 PNG
const STORE_MARKER_ICONS = {
  partnerWithCoupon: require('@/assets/images/icons/map/clover-heart.png'),
  partnerNoCoupon: require('@/assets/images/icons/map/clover.png'),
  nonPartnerWithCoupon: require('@/assets/images/icons/map/clover-gray-heart.png'),
  nonPartnerNoCoupon: require('@/assets/images/icons/map/clover-gray.png'),
};

// 내 위치 마커 아이콘
const MY_LOCATION_ICON = require('@/assets/images/icons/map/user.png');

// 이벤트 마커 아이콘 PNG
const EVENT_MARKER_ICONS: Record<EventType, any> = {
  FOOD_EVENT: require('@/assets/images/icons/map/event-food.png'),
  POPUP_STORE: require('@/assets/images/icons/map/event-brand.png'),
  SCHOOL_EVENT: require('@/assets/images/icons/map/event-college.png'),
  FLEA_MARKET: require('@/assets/images/icons/map/event-market.png'),
  PERFORMANCE: require('@/assets/images/icons/map/event-busking.png'),
  COMMUNITY: require('@/assets/images/icons/map/event-student.png'),
};

// 진행 중(live) 이벤트 마커 아이콘 PNG
const EVENT_MARKER_ICONS_LIVE: Record<EventType, any> = {
  FOOD_EVENT: require('@/assets/images/icons/map/event-food-live.png'),
  POPUP_STORE: require('@/assets/images/icons/map/event-brand-live.png'),
  SCHOOL_EVENT: require('@/assets/images/icons/map/event-college-live.png'),
  FLEA_MARKET: require('@/assets/images/icons/map/event-market-live.png'),
  PERFORMANCE: require('@/assets/images/icons/map/event-busking-live.png'),
  COMMUNITY: require('@/assets/images/icons/map/event-student-live.png'),
};

// ── 클러스터 텍스트 사이즈 계산 헬퍼 ──
// (네이티브 캡션에 전달할 폰트 사이즈)
function getClusterFontSize(count: number): number {
  return count >= 100 ? 11.5 : count >= 10 ? 13.5 : 15.5; // 좀 더 과감하게 줄여서 아래로 확실하게 내리기
}

const MARKER_SIZE = rs(32);
const EVENT_MARKER_SIZE = rs(52);
const EVENT_MARKER_SIZE_LIVE = rs(80);
const CLUSTER_SIZE = rs(60);

// 라벨 표시 최소 줌 레벨
const LABEL_MIN_ZOOM = 16;
// caption 텍스트 자동 줄바꿈 너비 (dp)
const LABEL_REQUESTED_WIDTH = 72;
// 라벨 최대 글자수 (2줄 기준)
const LABEL_MAX_CHARS = 14;

function truncateLabel(title: string): string {
  return title.length > LABEL_MAX_CHARS ? title.slice(0, LABEL_MAX_CHARS) + '…' : title;
}

// 가게 마커 아이콘 선택 헬퍼
function getStoreMarkerIcon(isPartner: boolean, hasCoupon: boolean) {
  if (isPartner) {
    return hasCoupon ? STORE_MARKER_ICONS.partnerWithCoupon : STORE_MARKER_ICONS.partnerNoCoupon;
  }
  return hasCoupon ? STORE_MARKER_ICONS.nonPartnerWithCoupon : STORE_MARKER_ICONS.nonPartnerNoCoupon;
}

// 이벤트 마커 아이콘 선택 헬퍼
function getEventMarkerIcon(eventType: EventType, status: EventStatus) {
  if (status === 'live') {
    return EVENT_MARKER_ICONS_LIVE[eventType] ?? EVENT_MARKER_ICONS_LIVE.COMMUNITY;
  }
  return EVENT_MARKER_ICONS[eventType] ?? EVENT_MARKER_ICONS.COMMUNITY;
}


// 가게 마커 데이터
interface StoreMarkerData {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  isPartner: boolean;
  hasCoupon: boolean;
  favoriteCount?: number;
}

// 마커 우선순위 zIndex 계산 (제휴 > 쿠폰 > 찜 많은 순)
function getStoreMarkerZIndex(isPartner: boolean, hasCoupon: boolean, favoriteCount: number): number {
  let z = favoriteCount; // 찜 수를 기본값으로
  if (hasCoupon) z += 10000;
  if (isPartner) z += 100000;
  return z;
}

// 이벤트 마커 데이터
interface EventMarkerData {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  type: 'event';
  eventType: EventType;
  status: EventStatus;
}

interface NaverMapProps {
  center?: { lat: number; lng: number };
  markers?: StoreMarkerData[];
  eventMarkers?: EventMarkerData[];
  hideStoreMarkers?: boolean;
  myLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (markerId: string) => void;
  onEventMarkerClick?: (markerId: string) => void;
  onMapReady?: () => void;
  onCameraChanged?: (params: { lat: number; lng: number; zoom: number; reason: string }) => void;
  style?: object;
  isShowZoomControls?: boolean;
}

export const NaverMap = forwardRef<NaverMapViewRef, NaverMapProps>(
  function NaverMap(
    {
      center = { lat: 35.8358, lng: 127.1294 }, // 전북대학교 기본 좌표
      markers = [],
      eventMarkers = [],
      hideStoreMarkers = false,
      myLocation = null,
      onMapClick,
      onMarkerClick,
      onEventMarkerClick,
      onMapReady,
      onCameraChanged,
      style,
      isShowZoomControls = false,
    },
    ref,
  ) {
    const mapRef = useRef<NaverMapViewRef>(null);
    const isInitialMount = useRef(true);
    const [currentZoom, setCurrentZoom] = useState<number>(15);
    const [isMapReady, setIsMapReady] = useState(false);

    // ✅ iOS에서 클러스터 아이콘 캐시 완료 후 마커 렌더링 (초기 흰색 방지)
    const [clusterIconsReady, setClusterIconsReady] = useState(Platform.OS !== 'ios');

    useEffect(() => {
      if (Platform.OS !== 'ios') return;
      let cancelled = false;
      Promise.all([
        RNImage.prefetch(CLUSTER_ICON_URI),
        RNImage.prefetch(EVENT_CLUSTER_ICON_URI),
      ]).finally(() => {
        if (!cancelled) setClusterIconsReady(true);
      });
      return () => { cancelled = true; };
    }, []);

    // ✅ zoom 디바운스 ref 추가 (컴포넌트 최상단에)
    const zoomTimerRef = useRef<ReturnType<typeof setTimeout>>();

    useImperativeHandle(ref, () => mapRef.current!, []);

    // center prop 변경 시 카메라 이동 (초기 마운트 제외)
    useEffect(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      if (center && mapRef.current) {
        mapRef.current.animateCameraTo({
          latitude: center.lat,
          longitude: center.lng,
          duration: 500,
        });
      }
    }, [center?.lat, center?.lng]);

    // 클러스터 클릭 시 해당 위치로 줌인
    const handleClusterClick = useCallback(
      (lat: number, lng: number) => {
        mapRef.current?.animateCameraTo({
          latitude: lat,
          longitude: lng,
          zoom: currentZoom + 2,
          duration: 300,
        });
      },
      [currentZoom],
    );

    // 가게 마커를 클러스터/개별 마커로 변환
    const clusteredMarkers = useMapCluster(markers, currentZoom);
    // 이벤트 마커를 클러스터/개별 마커로 변환
    const clusteredEventMarkers = useEventCluster(eventMarkers, currentZoom);

    // 가게/이벤트 마커와 겹치는 이벤트 마커를 살짝 이동
    // clusteredMarkers 대신 원본 markers를 사용: zoom 변경 시 클러스터 재계산으로 오프셋이 갑자기 바뀌는 현상 방지
    const adjustedEventMarkers = useMemo((): EventClusterPoint[] => {
      const OVERLAP_THRESHOLD = 0.00015;
      const STORE_OFFSET = 0.00022;
      const EVENT_OFFSET = 0.00022;

      const placed: { lat: number; lng: number }[] = [];

      return clusteredEventMarkers.map((ev) => {
        // 클러스터 마커는 위치 조정 불필요
        if (ev.type === 'cluster') return ev;

        let { lat, lng } = ev;

        // 가게 마커와 겹치면 위로 이동
        const overlapsStore = markers.some(
          (st) =>
            Math.abs(st.lat - lat) < OVERLAP_THRESHOLD &&
            Math.abs(st.lng - lng) < OVERLAP_THRESHOLD,
        );
        if (overlapsStore) lat += STORE_OFFSET;

        // 이미 배치된 이벤트 마커와 겹치면 옆으로 이동 (live 먼저 정렬되므로 upcoming이 밀림)
        const overlapsEvent = placed.some(
          (p) =>
            Math.abs(p.lat - lat) < OVERLAP_THRESHOLD &&
            Math.abs(p.lng - lng) < OVERLAP_THRESHOLD,
        );
        if (overlapsEvent) lng += EVENT_OFFSET;

        placed.push({ lat, lng });
        return { ...ev, lat, lng };
      });
    }, [clusteredEventMarkers, markers]);

    const showLabel = currentZoom >= LABEL_MIN_ZOOM;

    return (
      <View style={[styles.container, style]}>
        <NaverMapView
          ref={mapRef}
          style={styles.map}
          initialCamera={{
            latitude: center.lat,
            longitude: center.lng,
            zoom: 15,
          }}
          isShowZoomControls={isShowZoomControls}
          isShowCompass={false}
          onInitialized={() => {
            setIsMapReady(true);
            onMapReady?.();
          }}
          onCameraChanged={(params) => {
            const zoom = params.zoom ?? 15;

            // ✅ zoom 디바운스 150ms - 확대/축소 중 클러스터 재계산 횟수 줄여 깜빡임 감소
            if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
            zoomTimerRef.current = setTimeout(() => {
              setCurrentZoom((prev) => {
                const floored = Math.floor(zoom);
                return floored !== prev ? floored : prev;
              });
            }, 150);

            onCameraChanged?.({
              lat: params.latitude,
              lng: params.longitude,
              zoom,
              reason: params.reason,
            });
          }}
          onTapMap={(event) => {
            onMapClick?.(event.latitude, event.longitude);
          }}
        >
          {/* 맵 초기화 완료 후에만 마커 렌더링 (초기화 전 마커 추가 시 IndexOutOfBoundsException 방지) */}
          {/* 내 위치 마커 */}
          {isMapReady && myLocation && (
            <NaverMapMarkerOverlay
              key="my-location"
              latitude={myLocation.lat}
              longitude={myLocation.lng}
              width={rs(20)}
              height={rs(20)}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={1000}
              image={MY_LOCATION_ICON}
            />
          )}

          {/* 가게 마커 (클러스터 or 개별) */}
          {isMapReady && clusterIconsReady && !hideStoreMarkers && clusteredMarkers.map((item) => {
            if (item.type === 'cluster') {
              return (
                <NaverMapMarkerOverlay
                  key={`cluster-${item.clusterId}`}  // ✅ clusterId로 복구 (위치 기반 key 제거)
                  latitude={item.lat}
                  longitude={item.lng}
                  width={CLUSTER_SIZE}
                  height={CLUSTER_SIZE}
                  anchor={{ x: 0.5, y: 1.0 }}
                  zIndex={500}
                  onTap={() => handleClusterClick(item.lat, item.lng)}
                  image={CLUSTER_ICON}
                  caption={{
                    // 일반 공백(' ')은 네이티브 지도 엔진에서 텍스트 정렬 시 자동으로 잘려나가(trim) 무시됩니다.
                    // 따라서 절대 잘리지 않는 Non-breaking space('\u00A0')를 사용하여 강제로 텍스트를 왼쪽으로 밀어냅니다.
                    text: `${item.count}\u00A0\n\u00A0`,
                    // 가게 숫자 크기도 조금 더 커 보이도록 +1.5 추가
                    textSize: getClusterFontSize(item.count) + 1.5,
                    color: Gray.white,
                    align: 'Center',
                    offset: 3 // 안전빵으로 offset도 늘려서 아래로 추가 이동
                  }}
                />
              );
            }
            return (
              <NaverMapMarkerOverlay
                key={item.id}
                latitude={item.lat}
                longitude={item.lng}
                width={MARKER_SIZE}
                height={MARKER_SIZE}
                onTap={() => onMarkerClick?.(item.id)}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={getStoreMarkerZIndex(item.isPartner, item.hasCoupon, item.favoriteCount ?? 0)}
                isHideCollidedCaptions
                image={getStoreMarkerIcon(item.isPartner, item.hasCoupon)}
                caption={showLabel && item.title ? {
                  text: truncateLabel(item.title),
                  textSize: 11,
                  color: TextColor.primary,
                  haloColor: Gray.white,
                  requestedWidth: LABEL_REQUESTED_WIDTH,
                  offset: 4,
                } : undefined}
              />
            );
          })}

          {/* 이벤트 마커 (클러스터 or 개별) */}
          {isMapReady && clusterIconsReady && adjustedEventMarkers.map((item) => {
            if (item.type === 'cluster') {
              return (
                <NaverMapMarkerOverlay
                  key={`event-cluster-${item.clusterId}`}  // ✅ clusterId로 복구
                  latitude={item.lat}
                  longitude={item.lng}
                  width={CLUSTER_SIZE}
                  height={CLUSTER_SIZE}
                  anchor={{ x: 0.5, y: 1.0 }}
                  zIndex={500}
                  onTap={() => handleClusterClick(item.lat, item.lng)}
                  image={EVENT_CLUSTER_ICON}
                  caption={{
                    text: `${item.count}\n\u00A0`,
                    // 폰트 크기를 키워 시인성을 높임
                    textSize: getClusterFontSize(item.count) + 2,
                    color: Notify.event,
                    haloColor: Gray.white, // 흰색 외곽선 추가
                    align: 'Center',
                    offset: 15 // 더 아래쪽으로 내리기 위해 offset 증가
                  }}
                />
              );
            }
            const markerSize = item.status === 'live' ? EVENT_MARKER_SIZE_LIVE : EVENT_MARKER_SIZE;
            return (
              <NaverMapMarkerOverlay
                key={item.id}
                latitude={item.lat}
                longitude={item.lng}
                width={markerSize}
                height={markerSize}
                onTap={() => onEventMarkerClick?.(item.id)}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={item.status === 'live' ? 2 : 1}
                image={getEventMarkerIcon(item.eventType, item.status)}
                isHideCollidedCaptions
                caption={showLabel && item.title ? {
                  text: truncateLabel(item.title),
                  textSize: 11,
                  color: TextColor.primary,
                  haloColor: Gray.white,
                  requestedWidth: LABEL_REQUESTED_WIDTH,
                  offset: 4,
                } : undefined}
              />
            );
          })}
        </NaverMapView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
