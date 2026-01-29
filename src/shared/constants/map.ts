// Re-export DUMMY_STORES from data/mock for backward compatibility
export { DUMMY_STORES } from '@/src/shared/data/mock/store';

// 필터 카테고리
export const FILTER_CATEGORIES = [
  { id: 'all', label: '전체', icon: '✓' },
  { id: 'bungeoppang', label: '붕어빵', icon: '🐟' },
  { id: 'student-council', label: '총학생회', icon: '👥' },
  { id: 'club', label: '총동아리', icon: '🎭' },
  { id: 'notice', label: '공고', icon: '📢' },
];

// 정렬 옵션
export const SORT_OPTIONS = [
  { id: 'distance', label: '거리순' },
  { id: 'recommend', label: '추천순' },
  { id: 'rating', label: '별점순' },
  { id: 'reviews', label: '리뷰 많은순' },
  { id: 'benefits', label: '혜택 많은순' },
];

// 바텀 시트 필터 버튼
export const BOTTOM_FILTERS = [
  { id: 'nearby', label: '내 주변' },
  { id: 'storeType', label: '가게 종류' },
  { id: 'event', label: '이벤트' },
];

// 거리 필터 옵션
export const DISTANCE_OPTIONS = [
  { id: '0', label: '0km' },
  { id: '1', label: '1km' },
  { id: '3', label: '3km' },
  { id: '5', label: '5km' },
];

// 바텀시트 snap points 인덱스
export const SNAP_INDEX = {
  COLLAPSED: 0,  // 접힌 상태 (탭바 보임)
  HALF: 1,       // 중간 상태 (탭바 숨김)
  FULL: 2,       // 펼친 상태 (탭바 숨김)
} as const;

// 가게 종류 (API: categories)
export const STORE_TYPE_OPTIONS = [
  { id: 'RESTAURANT', label: '식당' },
  { id: 'BAR', label: '주점' },
  { id: 'CAFE', label: '카페' },
  { id: 'ENTERTAINMENT', label: '놀거리' },
  { id: 'BEAUTY_HEALTH', label: '뷰티·헬스' },
  { id: 'ETC', label: 'ETC' },
];

// 분위기 (API: moods)
export const MOOD_OPTIONS = [
  { id: 'SOLO_DINING', label: '1인 혼밥' },
  { id: 'GROUP_GATHERING', label: '회식·모임' },
  { id: 'LATE_NIGHT', label: '야식' },
  { id: 'ROMANTIC', label: '데이트' },
];

// 이벤트 (API 미지원 - UI만)
export const EVENT_OPTIONS = [
  { id: 'school', label: '학교 행사' },
  { id: 'performance', label: '공연·버스킹' },
  { id: 'foodtruck', label: '푸드트럭' },
  { id: 'fleamarket', label: '플리마켓' },
  { id: 'popup', label: '브랜드 팝업' },
];
