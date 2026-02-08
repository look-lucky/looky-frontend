import type {
  StoreResponse,
  StoreResponseStoreCategoriesItem,
} from '@/src/api/generated.schemas';
import type { Store } from '@/src/shared/types/store';

/**
 * 카테고리 코드를 한글로 변환
 */
const CATEGORY_LABELS: Record<StoreResponseStoreCategoriesItem, string> = {
  BAR: '주점',
  CAFE: '카페',
  RESTAURANT: '식당',
  ENTERTAINMENT: '놀거리',
  BEAUTY_HEALTH: '뷰티/건강',
  ETC: '기타',
};

export function formatStoreCategories(
  categories?: StoreResponseStoreCategoriesItem[],
): string {
  if (!categories || categories.length === 0) return '';
  return categories.map((cat) => CATEGORY_LABELS[cat] || cat).join(', ');
}

/**
 * 거리 계산 (Haversine 공식)
 */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // 지구 반경 (km)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

/**
 * 영업시간 JSON 문자열을 현재 요일에 맞게 파싱
 * 입력: '{"Mon": "11:00-21:00", "Tue": "11:00-21:00", ..., "Sun": "Closed"}'
 * 출력: "11:00-21:00" 또는 "휴무"
 */
export function formatOperatingHours(operatingHours: string): string {
  if (!operatingHours) return '';

  try {
    const parsed = JSON.parse(operatingHours);
    const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay(); // 0 = Sunday
    const todayKey = dayKeys[today];
    const todayHours = parsed[todayKey];

    if (!todayHours || todayHours === 'Closed') {
      return '휴무';
    }

    return todayHours;
  } catch {
    // 파싱 실패 시 원본 반환
    return operatingHours;
  }
}

/**
 * 전체 요일별 영업시간 파싱
 * 입력: '{"Mon": "11:00-21:00", "Tue": "11:00-21:00", ..., "Sun": "Closed"}'
 * 출력: [{ day: '월요일', hours: '11:00-21:00' }, ...]
 */
export function parseAllOperatingHours(operatingHours: string): Array<{ day: string; hours: string }> {
  const dayLabels = {
    Mon: '월요일',
    Tue: '화요일',
    Wed: '수요일',
    Thu: '목요일',
    Fri: '금요일',
    Sat: '토요일',
    Sun: '일요일',
  };

  if (!operatingHours) return [];

  try {
    const parsed = JSON.parse(operatingHours);
    return Object.entries(dayLabels).map(([key, label]) => ({
      day: label,
      hours: parsed[key] === 'Closed' ? '휴무' : parsed[key] || '-',
    }));
  } catch {
    return [];
  }
}

/**
 * 현재 영업 중인지 확인
 * 입력: '{"Mon": "11:00-21:00", ...}' 또는 "11:00-21:00"
 * 출력: "영업중" | "휴무" | "영업종료"
 */
export function getOpenStatus(operatingHours: string): string {
  if (!operatingHours) return '';

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // 분 단위로 변환

  let todayHours = operatingHours;

  // JSON 형식인 경우 오늘 요일의 영업시간 추출
  try {
    const parsed = JSON.parse(operatingHours);
    const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayKey = dayKeys[now.getDay()];
    todayHours = parsed[todayKey] ?? '';
  } catch {
    // JSON이 아니면 그대로 사용
  }

  if (!todayHours || todayHours === 'Closed') {
    return '휴무';
  }

  // "11:00-21:00" 형식 파싱
  const match = todayHours.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
  if (!match) return '';

  const [, openHour, openMin, closeHour, closeMin] = match;
  const openTime = parseInt(openHour) * 60 + parseInt(openMin);
  let closeTime = parseInt(closeHour) * 60 + parseInt(closeMin);

  // 새벽까지 영업하는 경우 (예: 18:00-02:00)
  if (closeTime < openTime) {
    closeTime += 24 * 60;
    // 자정 이후인 경우 현재 시간도 보정
    const adjustedCurrentTime = currentTime < openTime ? currentTime + 24 * 60 : currentTime;
    if (adjustedCurrentTime >= openTime && adjustedCurrentTime < closeTime) {
      return '영업중';
    }
  } else {
    if (currentTime >= openTime && currentTime < closeTime) {
      return '영업중';
    }
  }

  return '영업종료';
}

/**
 * StoreResponse (API) → Store (UI) 변환
 */
export function transformStoreResponse(
  response: StoreResponse,
  myLocation?: { lat: number; lng: number } | null,
): Store {
  const lat = response.latitude ?? 0;
  const lng = response.longitude ?? 0;

  let distance = '';
  if (myLocation && lat && lng) {
    const km = getDistanceKm(myLocation.lat, myLocation.lng, lat, lng);
    distance = formatDistance(km);
  }

  return {
    id: String(response.id ?? 0),
    name: response.name ?? '',
    image: response.imageUrls?.[0] ?? '',
    rating: response.averageRating ?? 0,
    reviewCount: response.reviewCount ?? 0,
    distance,
    openStatus: '', // TODO: 서버에서 영업상태 제공 시 연동
    openHours: response.operatingHours ?? '',
    benefits: [], // TODO: 서버에서 혜택 목록 제공 시 연동
    lat,
    lng,
    isPartner: response.isPartnership ?? false,
    hasCoupon: response.hasCoupon ?? false,
    category: formatStoreCategories(response.storeCategories),
    isFavorite: false, // 기본값, 추후 즐겨찾기 목록과 비교하여 업데이트
  };
}

/**
 * StoreResponse[] → Store[] 배열 변환
 */
export function transformStoreResponses(
  responses: StoreResponse[],
  myLocation?: { lat: number; lng: number } | null,
): Store[] {
  return responses.map((r) => transformStoreResponse(r, myLocation));
}
