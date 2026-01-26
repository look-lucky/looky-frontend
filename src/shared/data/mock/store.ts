import type { Store, StoreDetail } from '@/src/shared/types/store';

// ============================================
// 지도/리스트용 더미 데이터
// ============================================

export const DUMMY_STORES: Store[] = [
  {
    id: '1',
    name: '만계치킨',
    image: 'https://picsum.photos/seed/store1/200/200',
    rating: 4.7,
    reviewCount: 800,
    distance: '75m',
    openStatus: '영업중',
    openHours: '16:30 - 03:30',
    benefits: ['치킨 언어머니 쿨링 500m', '무 마라 2L 배송'],
    lat: 35.8468,
    lng: 127.1294,
  },
  {
    id: '2',
    name: '전북대 붕어빵',
    image: 'https://picsum.photos/seed/store2/200/200',
    rating: 4.5,
    reviewCount: 320,
    distance: '120m',
    openStatus: '영업중',
    openHours: '10:00 - 22:00',
    benefits: ['붕어빵 2개 서비스'],
    lat: 35.8448,
    lng: 127.1274,
  },
  {
    id: '3',
    name: '맛있는 분식',
    image: 'https://picsum.photos/seed/store3/200/200',
    rating: 4.2,
    reviewCount: 156,
    distance: '250m',
    openStatus: '영업중',
    openHours: '11:00 - 21:00',
    benefits: ['떡볶이 500원 할인'],
    lat: 35.8438,
    lng: 127.1314,
  },
];

// ============================================
// 상세 페이지용 더미 데이터 (배열)
// ============================================

export const DUMMY_STORE_DETAILS: StoreDetail[] = [
  {
    id: '1',
    name: '만계치킨',
    rating: 4.7,
    category: '치킨',
    reviewCount: 800,
    address: '전북 전주시 덕진구 백제대로 567',
    openHours: '매일 16:30 - 03:30',
    image: 'https://picsum.photos/seed/store1/400/300',
    cloverGrowth: 85.2,
    university: '전북대학교',
    isPartner: true,
    likeCount: 1250,
    benefits: [
      '치킨 전 메뉴 500원 할인',
      '음료 2L 무료 제공',
    ],
    coupons: [
      {
        id: '1',
        title: '첫 주문 15% 할인',
        description: '만계치킨 첫 방문 고객 할인',
        discount: '15%',
        expiryDate: '2026.02.28까지',
      },
    ],
    news: [
      {
        id: '1',
        type: '소식',
        date: '2026.01.20',
        title: '설 연휴 영업 안내',
        content: '안녕하세요. 설 연휴 기간(1/28~1/30) 정상 영업합니다. 많은 이용 부탁드려요!',
      },
      {
        id: '2',
        type: '소식',
        date: '2026.01.15',
        title: '신메뉴 출시!',
        content: '안녕하세요.\n드디어 마라치킨이 출시되었습니다! 매콤한 마라 소스와 바삭한 치킨의 조합을 즐겨보세요.',
      },
    ],
    announcements: [
      {
        id: '1',
        title: '니어딜 제휴 할인',
        content: '니어딜 앱으로 주문 시 추가 5% 할인!',
      },
    ],
    recommendStores: [
      { id: '2', image: 'https://picsum.photos/100/100?2' },
      { id: '3', image: 'https://picsum.photos/100/100?3' },
    ],
    reviewRating: {
      totalCount: 800,
      averageRating: 4.7,
      distribution: {
        5: 600,
        4: 150,
        3: 30,
        2: 15,
        1: 5,
      },
    },
    reviews: [
      {
        id: '1',
        userId: 'user1',
        nickname: '치킨러버',
        profileImage: 'https://picsum.photos/32/32?user1',
        rating: 5,
        date: '2026.01.18',
        images: [
          'https://picsum.photos/100/100?chicken1',
          'https://picsum.photos/100/100?chicken2',
        ],
        content: '바삭바삭하고 양도 많아요! 배달도 빠르고 항상 맛있게 잘 먹고 있습니다.',
        likeCount: 23,
        commentCount: 3,
        isOwner: false,
      },
      {
        id: '2',
        userId: 'user2',
        nickname: '야식킹',
        profileImage: 'https://picsum.photos/32/32?user2',
        rating: 5,
        date: '2026.01.15',
        images: [],
        content: '전북대 근처 치킨집 중에 여기가 제일 맛있어요. 강추!',
        likeCount: 15,
        commentCount: 1,
        isOwner: false,
      },
    ],
    menu: [
      {
        id: '1',
        name: '후라이드',
        items: [
          {
            id: '1-1',
            name: '후라이드 치킨',
            description: '바삭바삭한 오리지널 후라이드',
            price: 18000,
            image: 'https://picsum.photos/80/80?fried1',
          },
          {
            id: '1-2',
            name: '양념 치킨',
            description: '달콤 매콤한 양념 치킨',
            price: 19000,
            image: 'https://picsum.photos/80/80?yangnyeom1',
          },
        ],
      },
      {
        id: '2',
        name: '스페셜',
        items: [
          {
            id: '2-1',
            name: '마라 치킨',
            description: '신메뉴! 얼얼한 마라 소스',
            price: 20000,
            image: 'https://picsum.photos/80/80?mara1',
            isHot: true,
          },
          {
            id: '2-2',
            name: '반반 치킨',
            description: '후라이드 + 양념 반반',
            price: 19000,
            image: 'https://picsum.photos/80/80?half1',
          },
        ],
      },
      {
        id: '3',
        name: '사이드',
        items: [
          {
            id: '3-1',
            name: '치즈볼',
            description: '쫀득한 치즈볼 6개',
            price: 4000,
            image: 'https://picsum.photos/80/80?cheese1',
          },
          {
            id: '3-2',
            name: '콜라 1.5L',
            price: 3000,
            image: 'https://picsum.photos/80/80?cola1',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: '전북대 붕어빵',
    rating: 4.5,
    category: '간식',
    reviewCount: 320,
    address: '전북 전주시 덕진구 백제대로 123',
    openHours: '매일 10:00 - 22:00',
    image: 'https://picsum.photos/seed/store2/400/300',
    cloverGrowth: 62.5,
    university: '전북대학교',
    isPartner: true,
    likeCount: 456,
    benefits: [
      '붕어빵 2개 서비스',
      '10개 구매 시 2개 추가',
    ],
    coupons: [
      {
        id: '1',
        title: '겨울맞이 할인',
        description: '따끈따끈 붕어빵 할인',
        discount: '10%',
        expiryDate: '2026.02.15까지',
      },
    ],
    news: [
      {
        id: '1',
        type: '소식',
        date: '2026.01.22',
        title: '슈크림 붕어빵 출시!',
        content: '안녕하세요! 고객님들의 요청으로 슈크림 붕어빵을 출시했어요. 달콤한 슈크림이 가득~',
      },
      {
        id: '2',
        type: '소식',
        date: '2026.01.10',
        title: '영업시간 변경 안내',
        content: '1월부터 영업시간이 10:00 - 22:00로 변경됩니다. 참고 부탁드려요!',
      },
    ],
    announcements: [
      {
        id: '1',
        title: '니어딜 스탬프 이벤트',
        content: '니어딜로 5번 구매 시 붕어빵 5개 무료!',
      },
    ],
    recommendStores: [
      { id: '1', image: 'https://picsum.photos/100/100?1' },
      { id: '3', image: 'https://picsum.photos/100/100?3' },
    ],
    reviewRating: {
      totalCount: 320,
      averageRating: 4.5,
      distribution: {
        5: 200,
        4: 80,
        3: 25,
        2: 10,
        1: 5,
      },
    },
    reviews: [
      {
        id: '1',
        userId: 'user3',
        nickname: '붕어빵좋아',
        profileImage: 'https://picsum.photos/32/32?user3',
        rating: 5,
        date: '2026.01.20',
        images: [
          'https://picsum.photos/100/100?bung1',
        ],
        content: '팥이 진짜 꽉 차있어요! 겨울에 따끈따끈하게 먹으면 최고',
        likeCount: 12,
        commentCount: 2,
        isOwner: false,
      },
    ],
    menu: [
      {
        id: '1',
        name: '붕어빵',
        items: [
          {
            id: '1-1',
            name: '팥 붕어빵',
            description: '달콤한 팥이 가득',
            price: 500,
            image: 'https://picsum.photos/80/80?pat1',
          },
          {
            id: '1-2',
            name: '슈크림 붕어빵',
            description: '신메뉴! 부드러운 슈크림',
            price: 700,
            image: 'https://picsum.photos/80/80?cream1',
            isHot: true,
          },
        ],
      },
      {
        id: '2',
        name: '세트',
        items: [
          {
            id: '2-1',
            name: '붕어빵 5개 세트',
            price: 2500,
            image: 'https://picsum.photos/80/80?set5',
          },
          {
            id: '2-2',
            name: '붕어빵 10개 세트',
            description: '2개 추가 증정!',
            price: 5000,
            image: 'https://picsum.photos/80/80?set10',
          },
        ],
      },
    ],
  },
  {
    id: '3',
    name: '맛있는 분식',
    rating: 4.2,
    category: '분식',
    reviewCount: 156,
    address: '전북 전주시 덕진구 백제대로 789',
    openHours: '매일 11:00 - 21:00',
    image: 'https://picsum.photos/seed/store3/400/300',
    cloverGrowth: 45.8,
    university: '전북대학교',
    isPartner: false,
    likeCount: 234,
    benefits: [
      '떡볶이 500원 할인',
      '순대 추가 시 1000원 할인',
    ],
    coupons: [],
    news: [
      {
        id: '1',
        type: '소식',
        date: '2026.01.18',
        title: '로제 떡볶이 인기!',
        content: '로제 떡볶이가 인기 메뉴 1위를 달성했어요! 아직 안 드셔보셨다면 꼭 도전해보세요~',
      },
    ],
    announcements: [],
    recommendStores: [
      { id: '1', image: 'https://picsum.photos/100/100?1' },
      { id: '2', image: 'https://picsum.photos/100/100?2' },
    ],
    reviewRating: {
      totalCount: 156,
      averageRating: 4.2,
      distribution: {
        5: 80,
        4: 45,
        3: 20,
        2: 8,
        1: 3,
      },
    },
    reviews: [
      {
        id: '1',
        userId: 'user4',
        nickname: '분식덕후',
        profileImage: 'https://picsum.photos/32/32?user4',
        rating: 4,
        date: '2026.01.16',
        images: [],
        content: '가성비 좋고 양 많아요. 학생들한테 딱!',
        likeCount: 8,
        commentCount: 0,
        isOwner: false,
      },
    ],
    menu: [
      {
        id: '1',
        name: '떡볶이',
        items: [
          {
            id: '1-1',
            name: '오리지널 떡볶이',
            description: '매콤달콤 기본 떡볶이',
            price: 4000,
            image: 'https://picsum.photos/80/80?tteok1',
          },
          {
            id: '1-2',
            name: '로제 떡볶이',
            description: '인기 1위! 크리미한 로제 소스',
            price: 5500,
            image: 'https://picsum.photos/80/80?rose1',
            isHot: true,
          },
        ],
      },
      {
        id: '2',
        name: '튀김/순대',
        items: [
          {
            id: '2-1',
            name: '모둠 튀김',
            description: '바삭한 튀김 5종',
            price: 4000,
            image: 'https://picsum.photos/80/80?fry1',
          },
          {
            id: '2-2',
            name: '순대',
            price: 4000,
            image: 'https://picsum.photos/80/80?sundae1',
          },
        ],
      },
      {
        id: '3',
        name: '세트',
        items: [
          {
            id: '3-1',
            name: '떡순튀 세트',
            description: '떡볶이 + 순대 + 튀김',
            price: 10000,
            image: 'https://picsum.photos/80/80?set1',
            isBest: true,
          },
        ],
      },
    ],
  },
];

// 기존 코드 호환을 위한 단일 export (첫 번째 가게)
export const DUMMY_STORE_DETAIL: StoreDetail = DUMMY_STORE_DETAILS[0];
