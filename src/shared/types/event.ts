// ============================================
// Event - 지도/리스트에서 사용하는 이벤트 타입
// ============================================

export type EventType =
  | 'FOOD_EVENT'
  | 'POPUP_STORE'
  | 'SCHOOL_EVENT'
  | 'FLEA_MARKET'
  | 'PERFORMANCE'
  | 'COMMUNITY';

export type EventStatus = 'upcoming' | 'live' | 'ended';

export interface Event {
  id: string;
  title: string;
  description: string;
  eventTypes: EventType[];
  lat: number;
  lng: number;
  startDateTime: Date;
  endDateTime: Date;
  status: EventStatus;
  imageUrls: string[];
  distance?: string;
  createdAt: Date;
}

// ============================================
// 이벤트 상태 판단 유틸
// ============================================

/**
 * 이벤트 표시 여부 판단
 * - 시작일 7일 전부터 표시
 * - 종료일 당일 자정까지 표시
 */
export function isEventVisible(event: Event): boolean {
  const now = new Date();

  // 시작일 7일 전
  const weekBefore = new Date(event.startDateTime);
  weekBefore.setDate(weekBefore.getDate() - 7);
  weekBefore.setHours(0, 0, 0, 0);

  // 종료일 자정 (23:59:59)
  const endOfDay = new Date(event.endDateTime);
  endOfDay.setHours(23, 59, 59, 999);

  return now >= weekBefore && now <= endOfDay;
}

/**
 * 이벤트 상태 계산
 * - upcoming: 시작 전 (D-7 ~ D-1)
 * - live: 진행 중 (시작 ~ 종료)
 * - ended: 종료됨 (종료 ~ 당일 자정)
 */
export function getEventStatus(event: Event): EventStatus {
  const now = new Date();

  if (now < event.startDateTime) {
    return 'upcoming';
  }
  if (now <= event.endDateTime) {
    return 'live';
  }
  return 'ended';
}

/**
 * D-day 계산
 * - D-7, D-3 등 (시작 전)
 * - D-DAY (당일)
 * - null (진행 중 또는 종료)
 */
export function getDDay(event: Event): string | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const startDate = new Date(event.startDateTime);
  startDate.setHours(0, 0, 0, 0);

  const diffTime = startDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `D-${diffDays}`;
  }
  if (diffDays === 0) {
    return 'D-DAY';
  }
  return null; // 이미 시작됨
}

// ============================================
// 이벤트 타입 → 아이콘 매핑
// ============================================

export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  FOOD_EVENT: 'event-food',
  POPUP_STORE: 'event-brand',
  SCHOOL_EVENT: 'event-college',
  FLEA_MARKET: 'event-market',
  PERFORMANCE: 'event-busking',
  COMMUNITY: 'event-student',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  FOOD_EVENT: '푸드 이벤트',
  POPUP_STORE: '팝업스토어',
  SCHOOL_EVENT: '학교 행사',
  FLEA_MARKET: '플리마켓',
  PERFORMANCE: '공연/버스킹',
  COMMUNITY: '커뮤니티',
};
