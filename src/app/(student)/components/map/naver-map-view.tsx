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
import { Image as RNImage, StyleSheet, Text, View } from 'react-native';

// 클러스터 마커 아이콘 PNG
const CLUSTER_ICON = require('@/assets/images/icons/map/clover-cluster.png');

// 이벤트 클러스터 마커 아이콘 PNG
const EVENT_CLUSTER_ICON = require('@/assets/images/icons/map/event-cluster.png');

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

// 클러스터 마커 컴포넌트 (RN Image + Text 오버레이 — iOS SvgImage href 미지원 이슈 회피)
function ClusterMarkerIcon({ count, size, icon = CLUSTER_ICON, textColor = Gray.white }: { count: number; size: number; icon?: number; textColor?: string }) {
  const fontSize = count >= 100 ? size * 0.22 : count >= 10 ? size * 0.25 : size * 0.28;

  return (
    <View collapsable={false} style={{ width: size, height: size }}>
      <RNImage source={icon} style={{ width: size, height: size }} resizeMode="contain" />
      {/* paddingBottom으로 핀 꼬리 영역 제외 — 원형 헤드 중심(~42%)에 텍스트 배치 */}
      <View style={[StyleSheet.absoluteFillObject, { paddingBottom: size * 0.17, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: textColor, fontSize, fontWeight: '700' }}>{count}</Text>
      </View>
    </View>
  );
}

const MARKER_SIZE = rs(32);
const EVENT_MARKER_SIZE = rs(40);
const EVENT_MARKER_SIZE_LIVE = rs(60);
const CLUSTER_SIZE = rs(60);

// 라벨 표시 최소 줌 레벨
const LABEL_MIN_ZOOM = 16;
// 라벨 최대 너비
const LABEL_MAX_WIDTH = rs(72);
// 라벨 최대 줄수
const LABEL_MAX_LINES = 2;
// 라벨 높이 (height 계산용 근사값, 2줄 기준)
const LABEL_HEIGHT = rs(30);

function MarkerLabel({ title }: { title: string }) {
  return (
    <Text style={markerLabelStyles.text} numberOfLines={LABEL_MAX_LINES}>
      {title}
    </Text>
  );
}

const markerLabelStyles = StyleSheet.create({
  text: {
    fontSize: rs(11),
    fontWeight: '700',
    color: TextColor.primary,
    textAlign: 'center',
    lineHeight: rs(14),
    textShadowColor: Gray.white,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

function StoreMarkerWithLabel({
  icon,
  title,
  showLabel,
}: {
  icon: number;
  title?: string;
  showLabel: boolean;
}) {
  return (
    <View collapsable={false} style={storeMarkerStyles.wrapper}>
      <RNImage source={icon} style={{ width: MARKER_SIZE, height: MARKER_SIZE }} resizeMode="contain" />
      {showLabel && title ? (
        <View style={storeMarkerStyles.labelGap}>
          <MarkerLabel title={title} />
        </View>
      ) : null}
    </View>
  );
}

const storeMarkerStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  labelGap: {
    marginTop: rs(2),
  },
});

const eventMarkerStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  labelGap: {
    marginTop: rs(2),
  },
});

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

// 이벤트 상태에 따른 opacity
function getEventMarkerOpacity(status: EventStatus): number {
  switch (status) {
    case 'live':
      return 1.0;
    case 'upcoming':
      return 0.5;
    case 'ended':
      return 0.4;
    default:
      return 1.0;
  }
}

// 가게 마커 데이터
interface StoreMarkerData {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  isPartner: boolean;
  hasCoupon: boolean;
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
    const [currentZoom, setCurrentZoom] = useState(15);
    const [isMapReady, setIsMapReady] = useState(false);

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

    // 가게 마커와 겹치는 이벤트 마커를 위로 살짝 이동
    const adjustedEventMarkers = useMemo((): EventClusterPoint[] => {
      const OVERLAP_THRESHOLD = 0.0015;
      const OFFSET = 0.001;
      return clusteredEventMarkers.map((ev) => {
        const overlaps = clusteredMarkers.some(
          (st) =>
            Math.abs(st.lat - ev.lat) < OVERLAP_THRESHOLD &&
            Math.abs(st.lng - ev.lng) < OVERLAP_THRESHOLD,
        );
        return overlaps ? { ...ev, lat: ev.lat + OFFSET } : ev;
      });
    }, [clusteredEventMarkers, clusteredMarkers]);

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
          onInitialized={() => {
            setIsMapReady(true);
            onMapReady?.();
          }}
          onCameraChanged={(params) => {
            const zoom = params.zoom ?? 15;
            setCurrentZoom((prev) => {
              if (Math.floor(zoom) !== Math.floor(prev)) return zoom;
              return prev;
            });
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
          {isMapReady && !hideStoreMarkers && (() => {
            const showLabel = currentZoom >= LABEL_MIN_ZOOM;
            return clusteredMarkers.map((item) => {
              if (item.type === 'cluster') {
                return (
                  <NaverMapMarkerOverlay
                    key={`cluster-${item.clusterId}`}
                    latitude={item.lat}
                    longitude={item.lng}
                    width={CLUSTER_SIZE}
                    height={CLUSTER_SIZE}
                    anchor={{ x: 0.5, y: 1.0 }}
                    zIndex={500}
                    onTap={() => handleClusterClick(item.lat, item.lng)}
                  >
                    <ClusterMarkerIcon count={item.count} size={CLUSTER_SIZE} />
                  </NaverMapMarkerOverlay>
                );
              }
              const hasLabel = showLabel && !!item.title;
              const totalHeight = hasLabel ? MARKER_SIZE + rs(2) + LABEL_HEIGHT : MARKER_SIZE;
              const totalWidth = hasLabel ? LABEL_MAX_WIDTH : MARKER_SIZE;
              // anchor y: 아이콘 중심(MARKER_SIZE/2)이 좌표에 오도록
              const anchorY = MARKER_SIZE / 2 / totalHeight;
              return (
                <NaverMapMarkerOverlay
                  key={item.id}
                  latitude={item.lat}
                  longitude={item.lng}
                  width={totalWidth}
                  height={totalHeight}
                  onTap={() => onMarkerClick?.(item.id)}
                  anchor={{ x: 0.5, y: anchorY }}
                >
                  <StoreMarkerWithLabel
                    icon={getStoreMarkerIcon(item.isPartner, item.hasCoupon)}
                    title={item.title}
                    showLabel={showLabel}
                  />
                </NaverMapMarkerOverlay>
              );
            });
          })()}

          {/* 이벤트 마커 (클러스터 or 개별) */}
          {isMapReady && (() => {
            const showLabel = currentZoom >= LABEL_MIN_ZOOM;
            return adjustedEventMarkers.map((item) => {
              if (item.type === 'cluster') {
                return (
                  <NaverMapMarkerOverlay
                    key={`event-cluster-${item.clusterId}`}
                    latitude={item.lat}
                    longitude={item.lng}
                    width={CLUSTER_SIZE}
                    height={CLUSTER_SIZE}
                    anchor={{ x: 0.5, y: 1.0 }}
                    zIndex={500}
                    onTap={() => handleClusterClick(item.lat, item.lng)}
                  >
                    <ClusterMarkerIcon count={item.count} size={CLUSTER_SIZE} icon={EVENT_CLUSTER_ICON} textColor={Notify.event} />
                  </NaverMapMarkerOverlay>
                );
              }
              const hasLabel = showLabel && !!item.title;
              const markerSize = item.status === 'live' ? EVENT_MARKER_SIZE_LIVE : EVENT_MARKER_SIZE;
              const totalHeight = hasLabel ? markerSize + rs(2) + LABEL_HEIGHT : markerSize;
              const totalWidth = hasLabel ? Math.max(LABEL_MAX_WIDTH, markerSize) : markerSize;
              const anchorY = markerSize / totalHeight;
              const opacity = getEventMarkerOpacity(item.status);
              return (
                <NaverMapMarkerOverlay
                  key={item.id}
                  latitude={item.lat}
                  longitude={item.lng}
                  width={totalWidth}
                  height={totalHeight}
                  onTap={() => onEventMarkerClick?.(item.id)}
                  anchor={{ x: 0.5, y: anchorY }}
                  alpha={opacity}
                >
                  <View collapsable={false} style={eventMarkerStyles.wrapper}>
                    <RNImage
                      source={getEventMarkerIcon(item.eventType, item.status)}
                      style={{ width: markerSize, height: markerSize }}
                      resizeMode="contain"
                    />
                    {hasLabel ? (
                      <View style={eventMarkerStyles.labelGap}>
                        <MarkerLabel title={item.title!} />
                      </View>
                    ) : null}
                  </View>
                </NaverMapMarkerOverlay>
              );
            });
          })()}
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
