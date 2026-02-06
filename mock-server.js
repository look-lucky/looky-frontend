/**
 * 가게 상세 페이지 테스트용 Mock API 서버
 * V2__seed_data.sql 기반 데이터
 *
 * 실행: node mock-server.js
 * 포트: 4010 (EXPO_PUBLIC_API_BASE_URL 기본값)
 */
const http = require("http");

// ── Seed 데이터 ─────────────────────────────────────────────

const stores = [
  {
    id: 1,
    userId: 5,
    name: "맛있는 파스타",
    roadAddress: "전주시 덕진구 백제대로 567",
    jibunAddress: "전주시 덕진구 덕진동1가 100-1",
    phone: "063-1234-5678",
    introduction: "전통 이탈리안 파스타 전문점입니다.",
    operatingHours: "매일 11:00 - 22:00",
    latitude: 35.8468,
    longitude: 127.1293,
    storeCategories: ["RESTAURANT"],
    storeMoods: ["GROUP_GATHERING", "ROMANTIC"],
    imageUrls: ["https://picsum.photos/seed/store1/400/300"],
    isPartner: true,
    hasCoupon: true,
  },
  {
    id: 2,
    userId: 5,
    name: "아늑한 카페",
    roadAddress: "전주시 덕진구 기린대로 460",
    jibunAddress: "전주시 덕진구 금암동 200-2",
    phone: "063-2345-6789",
    introduction: "넓고 쾌적한 스터디하기 좋은 카페",
    operatingHours: "매일 09:00 - 23:00",
    latitude: 35.8425,
    longitude: 127.1325,
    storeCategories: ["CAFE"],
    storeMoods: ["SOLO_DINING"],
    imageUrls: ["https://picsum.photos/seed/store2/400/300"],
    isPartner: true,
    hasCoupon: true,
  },
  {
    id: 3,
    userId: 6,
    name: "매운 떡볶이",
    roadAddress: "전주시 덕진구 백제대로 680",
    jibunAddress: "전주시 덕진구 덕진동2가 300-3",
    phone: "063-3456-7890",
    introduction: "스트레스 한방에 날리는 매운맛!",
    operatingHours: "매일 14:00 - 02:00",
    latitude: 35.8390,
    longitude: 127.1260,
    storeCategories: ["RESTAURANT"],
    storeMoods: ["LATE_NIGHT", "GROUP_GATHERING"],
    imageUrls: ["https://picsum.photos/seed/store3/400/300"],
    isPartner: true,
    hasCoupon: true,
  },
  {
    id: 4,
    userId: 6,
    name: "든든 국밥",
    roadAddress: "전주시 덕진구 기린대로 502",
    jibunAddress: "전주시 덕진구 덕진동1가 400-4",
    phone: "063-4567-8901",
    introduction: "24시간 정성껏 끓인 국밥",
    operatingHours: "24시간 영업",
    latitude: 35.8375,
    longitude: 127.1310,
    storeCategories: ["RESTAURANT"],
    storeMoods: ["SOLO_DINING", "LATE_NIGHT"],
    imageUrls: ["https://picsum.photos/seed/store4/400/300"],
    isPartner: true,
    hasCoupon: true,
  },
  {
    id: 5,
    userId: 7,
    name: "바삭 치킨",
    roadAddress: "전주시 덕진구 백제대로 712",
    jibunAddress: "전주시 덕진구 덕진동1가 500-5",
    phone: "063-5678-9012",
    introduction: "겉바속이 치킨의 정석",
    operatingHours: "매일 16:00 - 04:00",
    latitude: 35.8500,
    longitude: 127.1340,
    storeCategories: ["RESTAURANT"],
    storeMoods: ["LATE_NIGHT", "GROUP_GATHERING"],
    imageUrls: ["https://picsum.photos/seed/store5/400/300"],
    isPartner: true,
    hasCoupon: true,
  },
  {
    id: 6,
    userId: 7,
    name: "피자 천국",
    roadAddress: "전주시 덕진구 기린대로 388",
    jibunAddress: "전주시 덕진구 금암동 600-6",
    phone: "063-6789-0123",
    introduction: "토핑이 듬뿍 들어간 수제 피자",
    operatingHours: "매일 11:30 - 23:30",
    latitude: 35.8335,
    longitude: 127.1275,
    storeCategories: ["RESTAURANT"],
    storeMoods: ["GROUP_GATHERING"],
    imageUrls: ["https://picsum.photos/seed/store6/400/300"],
    isPartner: true,
    hasCoupon: true,
  },
  {
    id: 7,
    userId: null,
    name: "버거 농장",
    roadAddress: "전주시 덕진구 백제대로 590",
    jibunAddress: "전주시 덕진구 덕진동2가 700-7",
    phone: "063-7890-1234",
    introduction: "육즙 가득한 수제 버거 맛집",
    operatingHours: "매일 10:30 - 21:00",
    latitude: 35.8410,
    longitude: 127.1225,
    storeCategories: ["RESTAURANT"],
    storeMoods: ["SOLO_DINING"],
    imageUrls: ["https://picsum.photos/seed/store7/400/300"],
    isPartner: false,
    hasCoupon: true,
  },
  {
    id: 8,
    userId: null,
    name: "이밥 달인",
    roadAddress: "전주시 덕진구 기린대로 530",
    jibunAddress: "전주시 덕진구 덕진동1가 800-8",
    phone: "063-8901-2345",
    introduction: "신선한 재료로 만드는 프리미엄 이밥",
    operatingHours: "매일 11:30 - 22:00",
    latitude: 35.8485,
    longitude: 127.1355,
    storeCategories: ["RESTAURANT"],
    storeMoods: ["SOLO_DINING"],
    imageUrls: ["https://picsum.photos/seed/store8/400/300"],
    isPartner: false,
    hasCoupon: false,
  },
  {
    id: 9,
    userId: null,
    name: "감성 포차",
    roadAddress: "전주시 덕진구 백제대로 645",
    jibunAddress: "전주시 덕진구 금암동 900-9",
    phone: "063-9012-3456",
    introduction: "분위기 좋은 감성 안주 주점",
    operatingHours: "매일 18:00 - 05:00",
    latitude: 35.8352,
    longitude: 127.1240,
    storeCategories: ["BAR"],
    storeMoods: ["LATE_NIGHT", "ROMANTIC"],
    imageUrls: ["https://picsum.photos/seed/store9/400/300"],
    isPartner: false,
    hasCoupon: false,
  },
  {
    id: 10,
    userId: null,
    name: "달콤 베이커리",
    roadAddress: "전주시 덕진구 기린대로 475",
    jibunAddress: "전주시 덕진구 덕진동2가 1000-10",
    phone: "063-0123-4567",
    introduction: "매일 아침 구워내는 신선한 빵",
    operatingHours: "매일 08:00 - 21:00",
    latitude: 35.8440,
    longitude: 127.1380,
    storeCategories: ["CAFE"],
    storeMoods: ["SOLO_DINING"],
    imageUrls: ["https://picsum.photos/seed/store10/400/300"],
    isPartner: false,
    hasCoupon: false,
  },
];

const items = [
  {
    id: 1,
    storeId: 1,
    name: "까르보나라",
    price: 12000,
    description: "크리미한 정통 까르보나라",
    imageUrl: "https://picsum.photos/seed/item1/200/200",
    itemOrder: 1,
    badge: "BEST",
    hidden: false,
    soldOut: false,
    representative: true,
  },
  {
    id: 2,
    storeId: 1,
    name: "알리오 올리오",
    price: 10000,
    description: "마늘향 가득한 오일 파스타",
    imageUrl: "https://picsum.photos/seed/item2/200/200",
    itemOrder: 2,
    badge: null,
    hidden: false,
    soldOut: false,
    representative: false,
  },
  {
    id: 3,
    storeId: 1,
    name: "토마토 파스타",
    price: 11000,
    description: "상큼한 토마토 소스 파스타",
    imageUrl: "https://picsum.photos/seed/item3/200/200",
    itemOrder: 3,
    badge: "NEW",
    hidden: false,
    soldOut: false,
    representative: false,
  },
  {
    id: 4,
    storeId: 2,
    name: "아메리카노",
    price: 4000,
    description: "깊고 진한 원두 아메리카노",
    imageUrl: "https://picsum.photos/seed/item4/200/200",
    itemOrder: 1,
    badge: "BEST",
    hidden: false,
    soldOut: false,
    representative: true,
  },
  {
    id: 5,
    storeId: 2,
    name: "카페라떼",
    price: 4500,
    description: "부드러운 우유 라떼",
    imageUrl: "https://picsum.photos/seed/item5/200/200",
    itemOrder: 2,
    badge: null,
    hidden: false,
    soldOut: false,
    representative: false,
  },
  {
    id: 6,
    storeId: 3,
    name: "떡볶이 1인분",
    price: 4000,
    description: "매콤달콤 떡볶이",
    imageUrl: "https://picsum.photos/seed/item6/200/200",
    itemOrder: 1,
    badge: "BEST",
    hidden: false,
    soldOut: false,
    representative: true,
  },
  {
    id: 7,
    storeId: 3,
    name: "모듬 튀김",
    price: 5000,
    description: "바삭한 모듬 튀김",
    imageUrl: "https://picsum.photos/seed/item7/200/200",
    itemOrder: 2,
    badge: "HOT",
    hidden: false,
    soldOut: false,
    representative: false,
  },
  {
    id: 8,
    storeId: 4,
    name: "순대국밥",
    price: 9000,
    description: "진한 국물의 순대국밥",
    imageUrl: "https://picsum.photos/seed/item8/200/200",
    itemOrder: 1,
    badge: "BEST",
    hidden: false,
    soldOut: false,
    representative: true,
  },
  {
    id: 9,
    storeId: 5,
    name: "프라이드 치킨",
    price: 18000,
    description: "겉바속촉 프라이드",
    imageUrl: "https://picsum.photos/seed/item9/200/200",
    itemOrder: 1,
    badge: "BEST",
    hidden: false,
    soldOut: false,
    representative: true,
  },
  {
    id: 10,
    storeId: 6,
    name: "콤비네이션 피자",
    price: 20000,
    description: "토핑 가득 콤비네이션",
    imageUrl: "https://picsum.photos/seed/item10/200/200",
    itemOrder: 1,
    badge: "BEST",
    hidden: false,
    soldOut: false,
    representative: true,
  },
];

const coupons = [
  {
    id: 1,
    storeId: 1,
    title: "오픈 기념 10% 할인",
    description: "전 메뉴 10% 할인",
    targetOrganizationId: null,
    issueStartsAt: "2024-01-01T00:00:00",
    issueEndsAt: "2025-12-31T23:59:59",
    totalQuantity: 100,
    limitPerUser: 1,
    status: "ACTIVE",
  },
  {
    id: 2,
    storeId: 2,
    title: "신메뉴 무료 시음권",
    description: "신메뉴 1잔 무료",
    targetOrganizationId: null,
    issueStartsAt: "2024-02-01T00:00:00",
    issueEndsAt: "2025-12-31T23:59:59",
    totalQuantity: 50,
    limitPerUser: 1,
    status: "ACTIVE",
  },
  {
    id: 3,
    storeId: 3,
    title: "떡볶이 사이즈 업",
    description: "1인분 주문 시 사이즈 업",
    targetOrganizationId: null,
    issueStartsAt: "2024-03-01T00:00:00",
    issueEndsAt: "2025-12-31T23:59:59",
    totalQuantity: 100,
    limitPerUser: 1,
    status: "ACTIVE",
  },
  {
    id: 4,
    storeId: 4,
    title: "음료수 무료 쿠폰",
    description: "국밥 주문 시 음료수 무료",
    targetOrganizationId: null,
    issueStartsAt: "2024-01-01T00:00:00",
    issueEndsAt: "2025-06-30T23:59:59",
    totalQuantity: 200,
    limitPerUser: 2,
    status: "ACTIVE",
  },
  {
    id: 5,
    storeId: 5,
    title: "생맥주 500cc 1천원",
    description: "치킨 주문 시 생맥주 할인",
    targetOrganizationId: null,
    issueStartsAt: "2024-01-01T00:00:00",
    issueEndsAt: "2025-12-31T23:59:59",
    totalQuantity: 100,
    limitPerUser: 1,
    status: "ACTIVE",
  },
  {
    id: 6,
    storeId: 6,
    title: "사이드 메뉴 1종 무료",
    description: "피자 주문 시 사이드 무료",
    targetOrganizationId: null,
    issueStartsAt: "2024-04-01T00:00:00",
    issueEndsAt: "2025-12-31T23:59:59",
    totalQuantity: 50,
    limitPerUser: 1,
    status: "ACTIVE",
  },
  {
    id: 7,
    storeId: 7,
    title: "무료 토핑 추가",
    description: "버거 주문 시 토핑 무료",
    targetOrganizationId: null,
    issueStartsAt: "2024-01-01T00:00:00",
    issueEndsAt: "2025-12-31T23:59:59",
    totalQuantity: 100,
    limitPerUser: 1,
    status: "ACTIVE",
  },
  {
    id: 8,
    storeId: 1,
    title: "재방문 5% 할인",
    description: "재방문 고객 5% 할인 (공과대학 전용)",
    targetOrganizationId: 2,
    issueStartsAt: "2024-01-01T00:00:00",
    issueEndsAt: "2025-12-31T23:59:59",
    totalQuantity: 1000,
    limitPerUser: 10,
    status: "ACTIVE",
  },
  {
    id: 9,
    storeId: 2,
    title: "아메리카노 1+1",
    description: "아메리카노 1+1 이벤트",
    targetOrganizationId: null,
    issueStartsAt: "2024-01-01T00:00:00",
    issueEndsAt: "2024-06-30T23:59:59",
    totalQuantity: 50,
    limitPerUser: 1,
    status: "EXPIRED",
  },
  {
    id: 10,
    storeId: 3,
    title: "튀김 서비스",
    description: "떡볶이 주문 시 튀김 1개",
    targetOrganizationId: null,
    issueStartsAt: "2024-01-01T00:00:00",
    issueEndsAt: "2024-12-31T23:59:59",
    totalQuantity: 10,
    limitPerUser: 1,
    status: "STOPPED",
  },
];

const usernames = { 8: "김학생", 9: "이학생", 10: "박학생" };

const reviews = [
  {
    reviewId: 1,
    storeId: 1,
    username: usernames[8],
    content: "정말 맛있어요!",
    rating: 5,
    createdAt: "2024-06-01T12:00:00",
    likeCount: 2,
    imageUrls: ["https://picsum.photos/seed/rev1/200/200"],
  },
  {
    reviewId: 2,
    storeId: 1,
    username: usernames[9],
    content: "가성비 좋습니다.",
    rating: 4,
    createdAt: "2024-06-05T15:30:00",
    likeCount: 1,
    imageUrls: [],
  },
  {
    reviewId: 3,
    storeId: 2,
    username: usernames[10],
    content: "커피 향이 너무 좋아요.",
    rating: 5,
    createdAt: "2024-06-10T09:00:00",
    likeCount: 1,
    imageUrls: ["https://picsum.photos/seed/rev3/200/200"],
  },
  {
    reviewId: 4,
    storeId: 2,
    username: usernames[8],
    content: "자리가 좀 좁아요.",
    rating: 3,
    createdAt: "2024-06-12T14:00:00",
    likeCount: 0,
    imageUrls: [],
  },
  {
    reviewId: 5,
    storeId: 3,
    username: usernames[9],
    content: "매운데 맛있다요.",
    rating: 5,
    createdAt: "2024-06-15T18:00:00",
    likeCount: 2,
    imageUrls: [
      "https://picsum.photos/seed/rev5a/200/200",
      "https://picsum.photos/seed/rev5b/200/200",
    ],
  },
  {
    reviewId: 6,
    storeId: 3,
    username: usernames[10],
    content: "튀김이 바삭합니다.",
    rating: 4,
    createdAt: "2024-06-18T19:30:00",
    likeCount: 0,
    imageUrls: [],
  },
  {
    reviewId: 7,
    storeId: 4,
    username: usernames[8],
    content: "국밥이 정말 든든해요.",
    rating: 5,
    createdAt: "2024-06-20T08:00:00",
    likeCount: 2,
    imageUrls: ["https://picsum.photos/seed/rev7/200/200"],
  },
  {
    reviewId: 8,
    storeId: 5,
    username: usernames[9],
    content: "치맥하기 딱 좋습니다.",
    rating: 5,
    createdAt: "2024-06-22T20:00:00",
    likeCount: 2,
    imageUrls: [],
  },
  {
    reviewId: 9,
    storeId: 6,
    username: usernames[10],
    content: "배달이 너무 늦었어요.",
    rating: 2,
    createdAt: "2024-06-25T21:00:00",
    likeCount: 0,
    imageUrls: [],
  },
  {
    reviewId: 10,
    storeId: 1,
    username: usernames[8],
    content: "또 가고 싶어요.",
    rating: 5,
    createdAt: "2024-07-01T12:00:00",
    likeCount: 0,
    imageUrls: ["https://picsum.photos/seed/rev10/200/200"],
  },
  // ── 가게 4 (든든 국밥) 추가 리뷰 ──
  {
    reviewId: 11,
    storeId: 4,
    username: usernames[9],
    content: "새벽에 출출할 때 딱이에요. 국물이 진하고 좋습니다.",
    rating: 4,
    createdAt: "2024-06-22T02:30:00",
    likeCount: 1,
    imageUrls: [],
  },
  {
    reviewId: 12,
    storeId: 4,
    username: usernames[10],
    content: "밥 양도 많고 가격도 착해요!",
    rating: 5,
    createdAt: "2024-06-25T12:00:00",
    likeCount: 3,
    imageUrls: ["https://picsum.photos/seed/rev12/200/200"],
  },
  // ── 가게 5 (바삭 치킨) 추가 리뷰 ──
  {
    reviewId: 13,
    storeId: 5,
    username: usernames[10],
    content: "양념치킨도 맛있어요. 소스가 달지 않아서 좋아요.",
    rating: 4,
    createdAt: "2024-06-24T21:00:00",
    likeCount: 1,
    imageUrls: ["https://picsum.photos/seed/rev13/200/200"],
  },
  {
    reviewId: 14,
    storeId: 5,
    username: usernames[8],
    content: "배달이 빠르고 치킨이 눅눅하지 않아요.",
    rating: 5,
    createdAt: "2024-06-28T19:30:00",
    likeCount: 2,
    imageUrls: [],
  },
  // ── 가게 6 (피자 천국) 추가 리뷰 ──
  {
    reviewId: 15,
    storeId: 6,
    username: usernames[8],
    content: "토핑이 정말 듬뿍 올라와요. 가성비 최고!",
    rating: 5,
    createdAt: "2024-06-27T12:30:00",
    likeCount: 3,
    imageUrls: [
      "https://picsum.photos/seed/rev15a/200/200",
      "https://picsum.photos/seed/rev15b/200/200",
    ],
  },
  {
    reviewId: 16,
    storeId: 6,
    username: usernames[9],
    content: "치즈가 쭉쭉 늘어나서 사진 찍기 좋아요.",
    rating: 4,
    createdAt: "2024-06-30T18:00:00",
    likeCount: 1,
    imageUrls: ["https://picsum.photos/seed/rev16/200/200"],
  },
  // ── 가게 7 (버거 농장) ──
  {
    reviewId: 17,
    storeId: 7,
    username: usernames[8],
    content: "패티가 두툼하고 육즙이 살아있어요!",
    rating: 5,
    createdAt: "2024-07-01T12:00:00",
    likeCount: 4,
    imageUrls: ["https://picsum.photos/seed/rev17/200/200"],
  },
  {
    reviewId: 18,
    storeId: 7,
    username: usernames[9],
    content: "감자튀김이 좀 짜긴 한데 버거는 맛있어요.",
    rating: 3,
    createdAt: "2024-07-03T13:30:00",
    likeCount: 0,
    imageUrls: [],
  },
  {
    reviewId: 19,
    storeId: 7,
    username: usernames[10],
    content: "혼밥하기 좋습니다. 자리도 편해요.",
    rating: 4,
    createdAt: "2024-07-05T11:00:00",
    likeCount: 2,
    imageUrls: ["https://picsum.photos/seed/rev19/200/200"],
  },
  // ── 가게 8 (이밥 달인) ──
  {
    reviewId: 20,
    storeId: 8,
    username: usernames[9],
    content: "재료가 신선한 게 느껴져요. 매일 가고 싶은 곳!",
    rating: 5,
    createdAt: "2024-07-02T12:30:00",
    likeCount: 3,
    imageUrls: [
      "https://picsum.photos/seed/rev20a/200/200",
      "https://picsum.photos/seed/rev20b/200/200",
    ],
  },
  {
    reviewId: 21,
    storeId: 8,
    username: usernames[10],
    content: "반찬이 다양하고 맛있어요.",
    rating: 4,
    createdAt: "2024-07-04T12:00:00",
    likeCount: 1,
    imageUrls: [],
  },
  {
    reviewId: 22,
    storeId: 8,
    username: usernames[8],
    content: "양이 좀 적은 편이에요. 맛은 좋습니다.",
    rating: 3,
    createdAt: "2024-07-06T13:00:00",
    likeCount: 0,
    imageUrls: [],
  },
  // ── 가게 9 (감성 포차) ──
  {
    reviewId: 23,
    storeId: 9,
    username: usernames[8],
    content: "분위기가 정말 좋아요. 안주도 맛있고!",
    rating: 5,
    createdAt: "2024-07-01T22:00:00",
    likeCount: 5,
    imageUrls: ["https://picsum.photos/seed/rev23/200/200"],
  },
  {
    reviewId: 24,
    storeId: 9,
    username: usernames[9],
    content: "주류 가격이 좀 있지만 분위기 값이라고 생각해요.",
    rating: 3,
    createdAt: "2024-07-03T23:30:00",
    likeCount: 1,
    imageUrls: [],
  },
  {
    reviewId: 25,
    storeId: 9,
    username: usernames[10],
    content: "소주 한잔하기 딱 좋은 곳입니다. 재방문 의사 있어요.",
    rating: 4,
    createdAt: "2024-07-05T21:00:00",
    likeCount: 2,
    imageUrls: [
      "https://picsum.photos/seed/rev25a/200/200",
      "https://picsum.photos/seed/rev25b/200/200",
    ],
  },
  // ── 가게 10 (달콤 베이커리) ──
  {
    reviewId: 26,
    storeId: 10,
    username: usernames[10],
    content: "크루아상이 정말 바삭하고 맛있어요!",
    rating: 5,
    createdAt: "2024-07-02T09:00:00",
    likeCount: 4,
    imageUrls: ["https://picsum.photos/seed/rev26/200/200"],
  },
  {
    reviewId: 27,
    storeId: 10,
    username: usernames[8],
    content: "소금빵 대박입니다. 줄 서서 먹을 만해요.",
    rating: 5,
    createdAt: "2024-07-04T10:30:00",
    likeCount: 3,
    imageUrls: ["https://picsum.photos/seed/rev27/200/200"],
  },
  {
    reviewId: 28,
    storeId: 10,
    username: usernames[9],
    content: "케이크 종류가 더 다양했으면 좋겠어요.",
    rating: 3,
    createdAt: "2024-07-06T15:00:00",
    likeCount: 0,
    imageUrls: [],
  },
];

// 소식 (seed SQL에 없으므로 직접 추가)
const storeNews = [
  {
    id: 1,
    storeId: 1,
    title: "6월 신메뉴 출시!",
    content:
      "여름 한정 레몬 크림 파스타가 출시되었습니다. 상큼한 레몬과 크리미한 소스의 조합!",
    createdAt: "2024-06-01T10:00:00",
    imageUrls: ["https://picsum.photos/seed/news1/400/300"],
    likeCount: 12,
    commentCount: 3,
    liked: false,
  },
  {
    id: 2,
    storeId: 1,
    title: "영업시간 변경 안내",
    content: "7월부터 영업시간이 11:00~23:00으로 변경됩니다.",
    createdAt: "2024-06-20T09:00:00",
    imageUrls: [],
    likeCount: 5,
    commentCount: 1,
    liked: false,
  },
  {
    id: 3,
    storeId: 2,
    title: "원두 변경 안내",
    content:
      "에티오피아 예가체프 원두로 변경합니다. 더욱 풍부한 향을 즐겨보세요!",
    createdAt: "2024-06-15T11:00:00",
    imageUrls: ["https://picsum.photos/seed/news3/400/300"],
    likeCount: 8,
    commentCount: 2,
    liked: false,
  },
  {
    id: 4,
    storeId: 3,
    title: "매운맛 챌린지 이벤트",
    content: "지옥의 떡볶이 완식 시 무료! 도전하세요!",
    createdAt: "2024-06-10T14:00:00",
    imageUrls: ["https://picsum.photos/seed/news4/400/300"],
    likeCount: 25,
    commentCount: 8,
    liked: false,
  },
  {
    id: 5,
    storeId: 4,
    title: "국밥 리뉴얼",
    content: "사골 육수를 12시간 우려내 더욱 진해진 국밥!",
    createdAt: "2024-06-05T07:00:00",
    imageUrls: ["https://picsum.photos/seed/news5/400/300"],
    likeCount: 15,
    commentCount: 4,
    liked: false,
  },
  {
    id: 6,
    storeId: 5,
    title: "치킨 + 맥주 세트 할인",
    content: "치킨 + 생맥주 2잔 세트 25,000원! (기존 29,000원)",
    createdAt: "2024-06-18T16:00:00",
    imageUrls: ["https://picsum.photos/seed/news6/400/300"],
    likeCount: 30,
    commentCount: 5,
    liked: false,
  },
];

// 즐겨찾기 수 (가짜)
const favoriteCounts = {
  1: 42,
  2: 28,
  3: 15,
  4: 33,
  5: 51,
  6: 19,
  7: 8,
  8: 5,
  9: 12,
  10: 7,
};

// ── 이벤트 데이터 ─────────────────────────────────────────────
// 다양한 상태 테스트를 위해 날짜를 동적으로 생성
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toISO(date, hour = 0, min = 0) {
  const d = new Date(date);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

const events = [
  // 1. 진행중 (live) - 오늘 진행
  {
    id: 1,
    title: "2026년 한화생명 온라인 라이브 채용설명회",
    description: "안녕하세요, 루키입니다 😊\n\n전북대학교 교내에서 진행되는 한화생명 채용설명회 소식을 안내드려요.\n이번 설명회에서는\n한화생명의 기업 소개부터 채용 절차, 직무 이야기까지\n학생분들께 도움이 될 만한 내용을 직접 들으실 수 있어요.\n\n📍 장소: 진수당 앞\n🕐 일시: 오후 1시~5시까지\n또한 설명회에 참여해 주신 분들께는\n아메리카노를 드립니다 ☕\n지금 진수당 앞에서 바로 참여해 보세요!\nURL: WWW.LOOKYGOD.COM",
    eventTypes: ["SCHOOL_EVENT"],
    latitude: 35.8468,
    longitude: 127.1293,
    startDateTime: toISO(today, 13, 0),
    endDateTime: toISO(today, 17, 0),
    status: "LIVE",
    imageUrls: [
      "https://picsum.photos/seed/event1/400/200",
      "https://picsum.photos/seed/event1b/400/200",
    ],
    createdAt: toISO(addDays(today, -3)),
  },
  // 2. 진행중 (live) - 오늘부터 내일까지
  {
    id: 2,
    title: "전북대 플리마켓 - 봄맞이 대축제",
    description: "학생회관 앞 광장에서 열리는 봄맞이 플리마켓!\n\n다양한 수공예품, 빈티지 의류, 맛있는 먹거리가 준비되어 있습니다.\n\n📍 장소: 학생회관 앞 광장\n🕐 시간: 10:00 ~ 18:00",
    eventTypes: ["FLEA_MARKET"],
    latitude: 35.8425,
    longitude: 127.1325,
    startDateTime: toISO(today, 10, 0),
    endDateTime: toISO(addDays(today, 1), 18, 0),
    status: "LIVE",
    imageUrls: ["https://picsum.photos/seed/event2/400/200"],
    createdAt: toISO(addDays(today, -7)),
  },
  // 3. 예정 (upcoming) - 3일 후 시작
  {
    id: 3,
    title: "캠퍼스 버스킹 페스티벌",
    description: "음악과 함께하는 봄밤!\n\n교내 밴드부와 동아리의 라이브 공연을 즐겨보세요.\n\n📍 장소: 중앙도서관 앞 잔디광장\n🕐 시간: 18:00 ~ 21:00\n\n🎵 참여 팀: 락밴드 '폭풍', 어쿠스틱 듀오 '봄날'",
    eventTypes: ["PERFORMANCE"],
    latitude: 35.8390,
    longitude: 127.1260,
    startDateTime: toISO(addDays(today, 3), 18, 0),
    endDateTime: toISO(addDays(today, 3), 21, 0),
    status: "UPCOMING",
    imageUrls: ["https://picsum.photos/seed/event3/400/200"],
    createdAt: toISO(addDays(today, -5)),
  },
  // 4. 예정 (upcoming) - 5일 후 시작
  {
    id: 4,
    title: "브랜드 팝업스토어 - 나이키 캠퍼스 투어",
    description: "나이키가 전북대에 찾아옵니다!\n\n신상품 체험, 한정판 굿즈 증정, 포토존 운영\n\n📍 장소: 공과대학 1호관 로비\n🕐 시간: 11:00 ~ 19:00\n\n선착순 100명 한정 에코백 증정!",
    eventTypes: ["POPUP_STORE"],
    latitude: 35.8375,
    longitude: 127.1310,
    startDateTime: toISO(addDays(today, 5), 11, 0),
    endDateTime: toISO(addDays(today, 7), 19, 0),
    status: "UPCOMING",
    imageUrls: [
      "https://picsum.photos/seed/event4/400/200",
      "https://picsum.photos/seed/event4b/400/200",
      "https://picsum.photos/seed/event4c/400/200",
    ],
    createdAt: toISO(addDays(today, -10)),
  },
  // 5. 예정 (upcoming) - 6일 후 (D-6, 거의 일주일 전 경계)
  {
    id: 5,
    title: "푸드트럭 페스티벌",
    description: "전국 유명 푸드트럭 20대 집결!\n\n타코, 버거, 꼬치, 디저트까지 다양한 먹거리\n\n📍 장소: 운동장 주차장\n🕐 시간: 11:00 ~ 21:00\n\n학생증 제시 시 10% 할인!",
    eventTypes: ["FOOD_EVENT"],
    latitude: 35.8500,
    longitude: 127.1340,
    startDateTime: toISO(addDays(today, 6), 11, 0),
    endDateTime: toISO(addDays(today, 8), 21, 0),
    status: "UPCOMING",
    imageUrls: ["https://picsum.photos/seed/event5/400/200"],
    createdAt: toISO(addDays(today, -2)),
  },
  // 6. 종료 (ended) - 오늘 아침에 끝남 (자정까지 보임)
  {
    id: 6,
    title: "새벽 요가 클래스",
    description: "아침을 여는 힐링 요가!\n\n📍 장소: 체육관 앞 잔디\n🕐 시간: 06:00 ~ 07:30",
    eventTypes: ["COMMUNITY"],
    latitude: 35.8335,
    longitude: 127.1275,
    startDateTime: toISO(today, 6, 0),
    endDateTime: toISO(today, 7, 30),
    status: "ENDED",
    imageUrls: ["https://picsum.photos/seed/event6/400/200"],
    createdAt: toISO(addDays(today, -14)),
  },
  // 7. 안 보임 (8일 후 시작 - D-8이라 아직 안 보여야 함)
  {
    id: 7,
    title: "동아리 박람회",
    description: "새 학기 동아리 모집!\n\n📍 장소: 학생회관 대강당\n🕐 시간: 10:00 ~ 17:00",
    eventTypes: ["SCHOOL_EVENT", "COMMUNITY"],
    latitude: 35.8410,
    longitude: 127.1225,
    startDateTime: toISO(addDays(today, 8), 10, 0),
    endDateTime: toISO(addDays(today, 8), 17, 0),
    status: "UPCOMING",
    imageUrls: ["https://picsum.photos/seed/event7/400/200"],
    createdAt: toISO(addDays(today, -1)),
  },
  // 8. 안 보임 (어제 끝남 - 자정 지나서 안 보여야 함)
  {
    id: 8,
    title: "영화 상영회 - 클래식 무비 나잇",
    description: "야외에서 즐기는 클래식 영화!\n\n📍 장소: 도서관 앞 광장\n🕐 시간: 19:00 ~ 22:00",
    eventTypes: ["PERFORMANCE"],
    latitude: 35.8485,
    longitude: 127.1355,
    startDateTime: toISO(addDays(today, -1), 19, 0),
    endDateTime: toISO(addDays(today, -1), 22, 0),
    status: "ENDED",
    imageUrls: ["https://picsum.photos/seed/event8/400/200"],
    createdAt: toISO(addDays(today, -10)),
  },
];

// ── 헬퍼 ────────────────────────────────────────────────────

function ok(data) {
  return JSON.stringify({ isSuccess: true, data });
}

function pageResponse(items, page, size) {
  const start = page * size;
  const sliced = items.slice(start, start + size);
  return {
    content: sliced,
    pageNumber: page,
    pageSize: size,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    sort: "createdAt: DESC",
    last: start + size >= items.length,
  };
}

function parseQuery(url) {
  const q = {};
  const idx = url.indexOf("?");
  if (idx === -1) return q;
  url
    .substring(idx + 1)
    .split("&")
    .forEach((pair) => {
      const [k, v] = pair.split("=");
      q[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
  return q;
}

function computeReviewStats(storeId) {
  const storeReviews = reviews.filter((r) => r.storeId === storeId);
  const total = storeReviews.length;
  const avg =
    total > 0 ? storeReviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  storeReviews.forEach((r) => dist[r.rating]++);
  return {
    averageRating: Math.round(avg * 100) / 100,
    totalReviews: total,
    rating1Count: dist[1],
    rating2Count: dist[2],
    rating3Count: dist[3],
    rating4Count: dist[4],
    rating5Count: dist[5],
  };
}

// ── 라우팅 ──────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = req.url;
  const query = parseQuery(url);
  const path = url.split("?")[0];

  // GET /api/stores/:id
  let m = path.match(/^\/api\/stores\/(\d+)$/);
  if (m && req.method === "GET") {
    const store = stores.find((s) => s.id === +m[1]);
    if (!store) {
      res.writeHead(404);
      return res.end(JSON.stringify({ isSuccess: false, data: null }));
    }
    res.writeHead(200);
    return res.end(ok(store));
  }

  // GET /api/stores/:id/reviews/stats
  m = path.match(/^\/api\/stores\/(\d+)\/reviews\/stats$/);
  if (m && req.method === "GET") {
    res.writeHead(200);
    return res.end(ok(computeReviewStats(+m[1])));
  }

  // GET /api/stores/:id/reviews
  m = path.match(/^\/api\/stores\/(\d+)\/reviews$/);
  if (m && req.method === "GET") {
    const page = parseInt(query.page || "0");
    const size = parseInt(query.size || "20");
    const storeReviews = reviews.filter((r) => r.storeId === +m[1]);
    res.writeHead(200);
    return res.end(ok(pageResponse(storeReviews, page, size)));
  }

  // GET /api/stores/:id/favorites/count
  m = path.match(/^\/api\/stores\/(\d+)\/favorites\/count$/);
  if (m && req.method === "GET") {
    res.writeHead(200);
    return res.end(ok(favoriteCounts[+m[1]] || 0));
  }

  // GET /api/stores/:id/coupons
  m = path.match(/^\/api\/stores\/(\d+)\/coupons$/);
  if (m && req.method === "GET") {
    const storeCoupons = coupons.filter((c) => c.storeId === +m[1]);
    res.writeHead(200);
    return res.end(ok(storeCoupons));
  }

  // GET /api/stores/:id/news
  m = path.match(/^\/api\/stores\/(\d+)\/news$/);
  if (m && req.method === "GET") {
    const page = parseInt(query.page || "0");
    const size = parseInt(query.size || "20");
    const news = storeNews.filter((n) => n.storeId === +m[1]);
    res.writeHead(200);
    return res.end(ok(pageResponse(news, page, size)));
  }

  // GET /api/stores/:id/items
  m = path.match(/^\/api\/stores\/(\d+)\/items$/);
  if (m && req.method === "GET") {
    const storeItems = items.filter((i) => i.storeId === +m[1]);
    res.writeHead(200);
    return res.end(ok(storeItems));
  }

  // GET /api/stores (목록 - 지도에서 사용)
  if (path === "/api/stores" && req.method === "GET") {
    const page = parseInt(query.page || "0");
    const size = parseInt(query.size || "20");

    const keyword = (query.keyword || "").trim().toLowerCase();

    const filtered = keyword
      ? stores.filter((s) => (s.name || "").toLowerCase().includes(keyword))
      : stores;

    res.writeHead(200);
    return res.end(ok(pageResponse(filtered, page, size)));
  }

  // GET /api/events (이벤트 목록)
  if (path === "/api/events" && req.method === "GET") {
    const page = parseInt(query.page || "0");
    const size = parseInt(query.size || "50");

    // status 필터 (UPCOMING, LIVE, ENDED)
    const statusFilter = query.status ? query.status.split(",") : null;

    let filtered = events;
    if (statusFilter) {
      filtered = events.filter((e) => statusFilter.includes(e.status));
    }

    res.writeHead(200);
    return res.end(ok(pageResponse(filtered, page, size)));
  }

  // GET /api/events/:id (이벤트 상세)
  m = path.match(/^\/api\/events\/(\d+)$/);
  if (m && req.method === "GET") {
    const event = events.find((e) => e.id === +m[1]);
    if (!event) {
      res.writeHead(404);
      return res.end(JSON.stringify({ isSuccess: false, data: null }));
    }
    res.writeHead(200);
    return res.end(ok(event));
  }

  // POST /api/auth/login (더미 토큰)
  if (path === "/api/auth/login" && req.method === "POST") {
    res.writeHead(200);
    return res.end(
      ok({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      }),
    );
  }

  // fallback
  res.writeHead(404);
  res.end(JSON.stringify({ isSuccess: false, data: null }));
});

server.listen(4010, () => {
  console.log("Mock API server running at http://localhost:4010");
  console.log("");
  console.log("Available endpoints:");
  console.log("  GET /api/stores/:id");
  console.log("  GET /api/stores/:id/reviews/stats");
  console.log("  GET /api/stores/:id/reviews?page=0&size=20");
  console.log("  GET /api/stores/:id/favorites/count");
  console.log("  GET /api/stores/:id/coupons");
  console.log("  GET /api/stores/:id/news?page=0&size=20");
  console.log("  GET /api/stores/:id/items");
  console.log("  GET /api/stores");
  console.log("  GET /api/events");
  console.log("  GET /api/events/:id");
  console.log("");
  console.log("Stores: 1~10 | Events: 1~8");
  console.log("Try: curl http://localhost:4010/api/events");
});
