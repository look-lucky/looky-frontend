import { rs } from '@/src/shared/theme/scale';
import type { EventStatus, EventType } from '@/src/shared/types/event';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

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

const MARKER_SIZE = rs(40);
const EVENT_MARKER_SIZE = rs(60);

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
          onInitialized={onMapReady}
          onCameraChanged={(params) => {
            onCameraChanged?.({
              lat: params.latitude,
              lng: params.longitude,
              zoom: params.zoom,
              reason: params.reason,
            });
          }}
          onTapMap={(event) => {
            onMapClick?.(event.latitude, event.longitude);
          }}
        >
          {/* 내 위치 마커 */}
          {myLocation && (
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
          {/* 가게 마커 */}
          {markers.map((marker) => (
            <NaverMapMarkerOverlay
              key={marker.id}
              latitude={marker.lat}
              longitude={marker.lng}
              width={MARKER_SIZE}
              height={MARKER_SIZE}
              onTap={() => onMarkerClick?.(marker.id)}
              anchor={{ x: 0.5, y: 0.5 }}
              image={getStoreMarkerIcon(marker.isPartner, marker.hasCoupon)}
            />
          ))}
          {/* 이벤트 마커 */}
          {eventMarkers.map((marker) => (
            <NaverMapMarkerOverlay
              key={marker.id}
              latitude={marker.lat}
              longitude={marker.lng}
              width={EVENT_MARKER_SIZE}
              height={EVENT_MARKER_SIZE}
              onTap={() => onEventMarkerClick?.(marker.id)}
              anchor={{ x: 0.5, y: 0.5 }}
              image={getEventMarkerIcon(marker.eventType, marker.status)}
              alpha={getEventMarkerOpacity(marker.status)}
            />
          ))}
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
