// ============================================
// Store - 지도/리스트에서 사용하는 기본 Store 타입
// ============================================

export interface Store {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: string;
  openStatus: string;
  openHours: string;
  benefits: string[];
  lat: number;
  lng: number;
  isPartner: boolean;
  hasCoupon: boolean;
}

// ============================================
// Store Detail - 상세 페이지에서 사용하는 확장 타입들
// ============================================

export interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  expiryDate: string;
  targetOrganizationId?: number | null; // 특정 단과대학 전용 쿠폰 (null이면 전체 대상)
}

export interface NewsItem {
  id: string;
  type: string;
  date: string;
  title: string;
  content: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isBest?: boolean;
  isHot?: boolean;
  isSoldOut?: boolean;
  hasNotification?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface ReviewItem {
  id: string;
  userId: string;
  nickname: string;
  profileImage?: string;
  rating: number;
  date: string;
  content: string;
  images?: string[];
  likeCount: number;
  commentCount: number;
  isOwner?: boolean;
}

export interface ReviewRating {
  totalCount: number;
  averageRating: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
}

export interface RecommendStore {
  id: string;
  image: string;
}

// ============================================
// Store Detail Full - 상세 페이지 전체 데이터
// ============================================

export interface StoreDetail {
  id: string;
  name: string;
  rating: number;
  category: string;
  reviewCount: number;
  address: string;
  openHours: string;
  image: string;
  cloverGrowth: number;
  university: string;
  isPartner: boolean;
  likeCount: number;
  benefits: string[];
  coupons: Coupon[];
  news: NewsItem[];
  announcements: Announcement[];
  recommendStores: RecommendStore[];
  reviewRating: ReviewRating;
  reviews: ReviewItem[];
  menu: MenuCategory[];
}
