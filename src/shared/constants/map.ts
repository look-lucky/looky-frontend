// 카테고리 탭 (디자인 시안 기준)
export const CATEGORY_TABS = [
  { id: 'all', label: '전체' },
  { id: 'EVENT', label: '이벤트' },
  { id: 'RESTAURANT', label: '식당' },
  { id: 'BAR', label: '주점' },
  { id: 'CAFE', label: '카페' },
  { id: 'ENTERTAINMENT', label: '놀거리' },
  { id: 'BEAUTY_HEALTH', label: '뷰티·헬스' },
  { id: 'ETC', label: 'ETC' },
];

// 카테고리 탭 → API categories 파라미터 매핑
export const CATEGORY_TO_API: Record<string, string | null> = {
  all: null,
  RESTAURANT: 'RESTAURANT',
  BAR: 'BAR',
  CAFE: 'CAFE',
  ENTERTAINMENT: 'ENTERTAINMENT',
  BEAUTY_HEALTH: 'BEAUTY_HEALTH',
  EVENT: null, // 이벤트는 별도 API
  ETC: 'ETC',
};

// 정렬 옵션
export const SORT_OPTIONS = [
  { id: 'distance', label: '거리순' },
  { id: 'popular', label: '인기순' },
  { id: 'rating', label: '별점순' },
  { id: 'reviews', label: '리뷰 많은순' },
];

// 거리 필터 옵션
export const DISTANCE_OPTIONS = [
  { id: '1', label: '1km' },
  { id: '3', label: '3km' },
  { id: '5', label: '5km' },
];

// 바텀시트 snap points 인덱스
export const SNAP_INDEX = {
  COLLAPSED: 0, // 접힌 상태 (탭바 보임)
  HALF: 1, // 중간 상태 (탭바 숨김)
  FULL: 2, // 펼친 상태 (탭바 숨김)
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

// 이벤트 타입 (API EventType 매핑)
export const EVENT_OPTIONS = [
  { id: 'SCHOOL_EVENT', label: '학교 행사' },
  { id: 'PERFORMANCE', label: '공연·버스킹' },
  { id: 'FOOD_EVENT', label: '푸드 이벤트' },
  { id: 'FLEA_MARKET', label: '플리마켓' },
  { id: 'POPUP_STORE', label: '팝업스토어' },
  { id: 'COMMUNITY', label: '커뮤니티' },
];
