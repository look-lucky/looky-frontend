import Supercluster from 'supercluster';
import { useMemo } from 'react';

interface MarkerInput {
  id: string;
  lat: number;
  lng: number;
  isPartner: boolean;
  hasCoupon: boolean;
}

export type ClusterPoint =
  | { type: 'cluster'; lat: number; lng: number; count: number; clusterId: number }
  | { type: 'single'; lat: number; lng: number; id: string; isPartner: boolean; hasCoupon: boolean };

type MarkerProperties = { id: string; isPartner: boolean; hasCoupon: boolean };

const WORLD_BBOX: [number, number, number, number] = [-180, -85, 180, 85];

export function useMapCluster(markers: MarkerInput[], zoom: number): ClusterPoint[] {
  // markers가 바뀔 때만 인덱스를 재빌드
  const index = useMemo(() => {
    const sc = new Supercluster<MarkerProperties>({ radius: 60, maxZoom: 16 });
    sc.load(
      markers.map((m) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
        properties: { id: m.id, isPartner: m.isPartner, hasCoupon: m.hasCoupon },
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
        isPartner: c.properties.isPartner,
        hasCoupon: c.properties.hasCoupon,
      };
    });
  }, [index, zoom]);
}
