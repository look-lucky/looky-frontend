import type { EventStatus, EventType } from '@/src/shared/types/event';
import Supercluster from 'supercluster';
import { useMemo } from 'react';

interface MarkerInput {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  isPartner: boolean;
  hasCoupon: boolean;
}

export type ClusterPoint =
  | { type: 'cluster'; lat: number; lng: number; count: number; clusterId: number }
  | { type: 'single'; lat: number; lng: number; id: string; title?: string; isPartner: boolean; hasCoupon: boolean };

type MarkerProperties = { id: string; title?: string; isPartner: boolean; hasCoupon: boolean };

// 이벤트 마커
interface EventMarkerInput {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  eventType: EventType;
  status: EventStatus;
}

export type EventClusterPoint =
  | { type: 'cluster'; lat: number; lng: number; count: number; clusterId: number }
  | { type: 'single'; lat: number; lng: number; id: string; title?: string; eventType: EventType; status: EventStatus };

type EventMarkerProperties = { id: string; title?: string; eventType: EventType; status: EventStatus };

const WORLD_BBOX: [number, number, number, number] = [-180, -85, 180, 85];

export function useMapCluster(markers: MarkerInput[], zoom: number): ClusterPoint[] {
  // markers가 바뀔 때만 인덱스를 재빌드
  const index = useMemo(() => {
    const sc = new Supercluster<MarkerProperties>({ radius: 80, maxZoom: 15 });
    sc.load(
      markers.map((m) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
        properties: { id: m.id, title: m.title, isPartner: m.isPartner, hasCoupon: m.hasCoupon },
      })),
    );
    return sc;
  }, [markers]);

  // zoom이 바뀔 때 클러스터 재계산
  return useMemo(() => {
    return index.getClusters(WORLD_BBOX, Math.floor(zoom)).map((c): ClusterPoint => {
      const [lng, lat] = c.geometry.coordinates;
      if (c.properties.cluster) {
        return {
          type: 'cluster',
          lat,
          lng,
          count: c.properties.point_count,
          clusterId: c.properties.cluster_id as number,
        };
      }
      return {
        type: 'single',
        lat,
        lng,
        id: c.properties.id,
        title: c.properties.title,
        isPartner: c.properties.isPartner,
        hasCoupon: c.properties.hasCoupon,
      };
    });
  }, [index, zoom]);
}

export function useEventCluster(markers: EventMarkerInput[], zoom: number): EventClusterPoint[] {
  const index = useMemo(() => {
    const sc = new Supercluster<EventMarkerProperties>({ radius: 80, maxZoom: 15 });
    sc.load(
      markers.map((m) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
        properties: { id: m.id, title: m.title, eventType: m.eventType, status: m.status },
      })),
    );
    return sc;
  }, [markers]);

  return useMemo(() => {
    return index.getClusters(WORLD_BBOX, Math.floor(zoom)).map((c): EventClusterPoint => {
      const [lng, lat] = c.geometry.coordinates;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = c.properties as any;
      if (p.cluster) {
        return {
          type: 'cluster',
          lat,
          lng,
          count: p.point_count,
          clusterId: p.cluster_id as number,
        };
      }
      return {
        type: 'single',
        lat,
        lng,
        id: p.id,
        title: p.title,
        eventType: p.eventType,
        status: p.status,
      };
    });
  }, [index, zoom]);
}
