import type {
  StoreMapResponse,
  StoreMapResponseStoreCategoriesItem,
  StoreResponse,
  StoreResponseStoreCategoriesItem,
} from '@/src/api/generated.schemas';
import type { Store } from '@/src/shared/types/store';

/**
 * 카테고리 코드를 한글로 변환
 */
const CATEGORY_LABELS: Record<StoreResponseStoreCategoriesItem | StoreMapResponseStoreCategoriesItem, string> = {
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
 * 입력: '{"0": [["10:00","20:00"], ["15:00","17:00"]], ..., "6": [["11:00","19:00"], null]}'
 * 키: 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일
 * 출력: "10:00 ~ 20:00" 또는 "휴무"
 */
export function formatOperatingHours(operatingHours: string): string {
  if (!operatingHours) return '';

  try {
    const parsed = JSON.parse(operatingHours);
    // JS getDay(): 0=일, 1=월 ~ 6=토 → 키: 0=월~6=일
    const key = String((new Date().getDay() + 6) % 7);
    const slot = parsed[key]; // [["10:00","20:00"], ["15:00","17:00"] | null]

    if (!slot || !slot[0]) return '휴무';

    const [open, close] = slot[0] as [string, string];
    const base = `${open} ~ ${close}`;

    if (slot[1]) {
      const [bOpen, bClose] = slot[1] as [string, string];
      return `${base} (브레이크 ${bOpen} ~ ${bClose})`;
    }

    return base;
  } catch {
    return operatingHours;
  }
}

/**
 * 전체 요일별 영업시간 파싱
 * 입력: '{"0": [["10:00","20:00"], ["15:00","17:00"]], ..., "6": [["11:00","19:00"], null]}'
 * 키: 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일
 * 출력: [{ day: '월요일', hours: '10:00 ~ 20:00 (브레이크 15:00 ~ 17:00)' }, ...]
 */
export function parseAllOperatingHours(operatingHours: string): Array<{ day: string; hours: string }> {
  const dayLabels = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

  if (!operatingHours) return [];

  try {
    const parsed = JSON.parse(operatingHours);
    return dayLabels.map((label, i) => {
      const slot = parsed[String(i)];
      if (!slot || !slot[0]) return { day: label, hours: '휴무' };

      const [open, close] = slot[0] as [string, string];
      const base = `${open} ~ ${close}`;
      const hours = slot[1]
        ? `${base} (브레이크 ${(slot[1] as [string, string])[0]} ~ ${(slot[1] as [string, string])[1]})`
        : base;

      return { day: label, hours };
    });
  } catch {
    return [];
  }
}

/**
 * 현재 영업 중인지 확인 (브레이크타임 고려)
 * 입력: '{"0": [["10:00","20:00"], ["15:00","17:00"]], ..., "6": [["11:00","19:00"], null]}'
 * 출력: "영업중" | "브레이크" | "휴무" | "영업종료"
 */
export function getOpenStatus(operatingHours: string): string {
  if (!operatingHours) return '';

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const isInRange = (start: string, end: string) => {
    const s = toMinutes(start);
    let e = toMinutes(end);
    // 새벽 마감 (예: 22:00~02:00)
    if (e < s) e += 24 * 60;
    const t = currentTime < s ? currentTime + 24 * 60 : currentTime;
    return t >= s && t < e;
  };

  try {
    const parsed = JSON.parse(operatingHours);
    const key = String((now.getDay() + 6) % 7);
    const slot = parsed[key];

    if (!slot || !slot[0]) return '휴무';

    const [open, close] = slot[0] as [string, string];
    if (!isInRange(open, close)) return '영업종료';

    // 브레이크타임 체크
    if (slot[1]) {
      const [bOpen, bClose] = slot[1] as [string, string];
      if (isInRange(bOpen, bClose)) return '브레이크';
    }

    return '영업중';
  } catch {
    return '';
  }
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

/**
 * StoreMapResponse (API) → Store (UI) 변환
 */
export function transformStoreMapResponse(
  response: StoreMapResponse,
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
    image: response.imageUrl ?? '',
    rating: response.averageRating ?? 0,
    reviewCount: response.reviewCount ?? 0,
    distance,
    openStatus: '',
    openHours: response.operatingHours ?? '',
    benefits: [],
    lat,
    lng,
    isPartner: response.isPartnership ?? false,
    hasCoupon: response.hasCoupon ?? false,
    category: formatStoreCategories(response.storeCategories as StoreResponseStoreCategoriesItem[]),
    isFavorite: false,
    favoriteCount: response.favoriteCount ?? 0,
  };
}

/**
 * StoreMapResponse[] → Store[] 배열 변환
 */
export function transformStoreMapResponses(
  responses: StoreMapResponse[],
  myLocation?: { lat: number; lng: number } | null,
): Store[] {
  return responses.map((r) => transformStoreMapResponse(r, myLocation));
}
