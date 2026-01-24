// Re-export DUMMY_STORES from data/mock for backward compatibility
export { DUMMY_STORES } from '@/src/data/mock/store';

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

// 바텀시트 snap points 인덱스
export const SNAP_INDEX = {
  COLLAPSED: 0,  // 접힌 상태 (탭바 보임)
  HALF: 1,       // 중간 상태 (탭바 숨김)
  FULL: 2,       // 펼친 상태 (탭바 숨김)
} as const;
