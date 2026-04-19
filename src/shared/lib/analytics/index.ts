import analytics from '@react-native-firebase/analytics';

// ─── User Properties ───────────────────────────────────────────────────────

/**
 * 회원가입 완료 직후 한 번 호출.
 * Firebase GA 대시보드에서 학교별 필터링에 사용.
 */
export async function setUserProperties(params: {
  university: string;
  college: string;
  hasStudentUnion: boolean;
}) {
  await Promise.all([
    analytics().setUserProperty('university', params.university),
    analytics().setUserProperty('college', params.college),
    analytics().setUserProperty('has_student_union', String(params.hasStudentUnion)),
  ]);
}

// ─── P0 Events ─────────────────────────────────────────────────────────────

/**
 * 앱 실행 시 — DAU / WAU / MAU, 리텐션 측정용
 */
export async function logAppOpen(params: {
  university?: string;
  college?: string;
}) {
  await analytics().logEvent('app_open_custom', {
    university: params.university ?? '',
    college: params.college ?? '',
  });
}

/**
 * 학생 가입 완료
 */
export async function logStudentSignUpComplete(params: {
  universityName: string;
  collegeName: string;
  departmentName: string;
  hasStudentUnion: boolean;
}) {
  await analytics().logEvent('student_sign_up_complete', {
    university: params.universityName,
    college: params.collegeName,
    department: params.departmentName,
    has_student_union: params.hasStudentUnion,
  });
}

/**
 * 점주 가입 완료
 */
export async function logOwnerSignUpComplete() {
  await analytics().logEvent('owner_sign_up_complete', {});
}

/**
 * 가게 상세 페이지 진입
 */
export async function logStoreDetailView(params: {
  storeId: number;
  storeName: string;
  category?: string;
}) {
  await analytics().logEvent('store_detail_view', {
    store_id: params.storeId,
    store_name: params.storeName,
    category: params.category ?? '',
  });
}

/**
 * 이벤트 상세 페이지 진입
 */
export async function logEventDetailView(params: {
  eventId: number;
  eventTitle: string;
  status: string;
  eventTypes?: string[];
}) {
  await analytics().logEvent('event_detail_view', {
    event_id: params.eventId,
    event_title: params.eventTitle,
    status: params.status,
    event_types: (params.eventTypes ?? []).join(','),
  });
}

// ─── P1 Events ─────────────────────────────────────────────────────────────

/**
 * 가게 검색 실행 (검색 버튼 클릭 or 엔터)
 */
export async function logSearchExecute(params: {
  keyword: string;
}) {
  await analytics().logEvent('search_execute', {
    keyword: params.keyword,
  });
}

/**
 * 카테고리 필터 클릭 (홈 또는 지도)
 */
export async function logCategoryFilterClick(params: {
  category: string;
  screen: 'home' | 'map';
}) {
  await analytics().logEvent('category_filter_click', {
    category: params.category,
    screen: params.screen,
  });
}

/**
 * 지도 매장 핀 클릭
 */
export async function logMapStorePinClick(params: {
  storeId: string;
  storeName: string;
}) {
  await analytics().logEvent('map_store_pin_click', {
    store_id: params.storeId,
    store_name: params.storeName,
  });
}

/**
 * 지도 이벤트 마커 클릭
 */
export async function logMapEventMarkerClick(params: {
  eventId: string;
  eventTitle: string;
  status: string;
}) {
  await analytics().logEvent('map_event_marker_click', {
    event_id: params.eventId,
    event_title: params.eventTitle,
    status: params.status,
  });
}

/**
 * 찜 버튼 토글
 */
export async function logFavoriteToggle(params: {
  storeId: number;
  storeName: string;
  action: 'add' | 'remove';
}) {
  await analytics().logEvent('favorite_toggle', {
    store_id: params.storeId,
    store_name: params.storeName,
    action: params.action,
  });
}

/**
 * 가게 상세 내 쿠폰함 버튼 클릭
 */
export async function logCouponBoxOpen(params: {
  storeId: number;
  storeName: string;
}) {
  await analytics().logEvent('coupon_box_open', {
    store_id: params.storeId,
    store_name: params.storeName,
  });
}

/**
 * 쿠폰 발급 버튼 클릭 (이탈율 측정 — 발급 시작)
 */
export async function logCouponDownloadStart(params: {
  couponId: string;
  storeId: number;
  storeName: string;
}) {
  await analytics().logEvent('coupon_download_start', {
    coupon_id: params.couponId,
    store_id: params.storeId,
    store_name: params.storeName,
  });
}

/**
 * 쿠폰 발급 완료
 */
export async function logCouponDownloadComplete(params: {
  couponId: string;
  storeId: number;
  storeName: string;
}) {
  await analytics().logEvent('coupon_download_complete', {
    coupon_id: params.couponId,
    store_id: params.storeId,
    store_name: params.storeName,
  });
}

/**
 * 가게 상세 탭 클릭 (소식 / 메뉴 / 리뷰 / 매장정보)
 */
export async function logStoreTabClick(params: {
  storeId: number;
  tab: string;
}) {
  await analytics().logEvent('store_tab_click', {
    store_id: params.storeId,
    tab: params.tab,
  });
}

/**
 * 홈 이벤트 카드 클릭
 */
export async function logHomeEventCardClick(params: {
  eventId: number;
  eventTitle: string;
}) {
  await analytics().logEvent('home_event_card_click', {
    event_id: params.eventId,
    event_title: params.eventTitle,
  });
}

/**
 * 지도 페이지 이벤트 목록 카드 클릭
 */
export async function logMapEventListCardClick(params: {
  eventId: string;
  eventTitle: string;
}) {
  await analytics().logEvent('map_event_list_card_click', {
    event_id: params.eventId,
    event_title: params.eventTitle,
  });
}

/**
 * 이벤트 상세 → 위치 보기 클릭
 */
export async function logEventViewOnMap(params: {
  eventId: number;
}) {
  await analytics().logEvent('event_view_on_map', {
    event_id: params.eventId,
  });
}
