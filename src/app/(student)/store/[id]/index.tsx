import { useGetCouponsByStore } from '@/src/api/coupon';
import { useCountFavorites } from '@/src/api/favorite';
import type {
  CouponResponse,
  ItemResponse,
  PageResponseReviewResponse,
  PageResponseStoreNewsResponse,
  ReviewStatsResponse,
  StoreResponse,
} from '@/src/api/generated.schemas';
import { useGetItems } from '@/src/api/item';
import { useGetReviews, useGetReviewStats } from '@/src/api/review';
import { useGetStoreNewsList } from '@/src/api/store-news';
import { useGetStore } from '@/src/api/store';
import { StoreBenefits } from '@/src/app/(student)/components/store/benefits';
import { BottomFixedBar } from '@/src/app/(student)/components/store/bottom-bar';
import { StoreContent } from '@/src/app/(student)/components/store/content';
import { StoreHeader } from '@/src/app/(student)/components/store/header';
import { ThemedText } from '@/src/shared/common/themed-text';
import { UNIVERSITY_OPTIONS } from '@/src/shared/constants/store';
import { rs } from '@/src/shared/theme/scale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 카테고리 enum → 한글 라벨
const CATEGORY_LABEL: Record<string, string> = {
  BAR: '주점',
  CAFE: '카페',
  RESTAURANT: '음식점',
  ENTERTAINMENT: '오락',
  BEAUTY_HEALTH: '뷰티/건강',
  ETC: '기타',
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

export default function StoreDetailScreen() {
  const { id, name, image, rating, reviewCount } = useLocalSearchParams<{
    id: string;
    name?: string;
    image?: string;
    rating?: string;
    reviewCount?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('news');
  const [isLiked, setIsLiked] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);

  const storeId = Number(id);

  // ── API hooks ──────────────────────────────────────────────

  // 가게 기본 정보
  const { data: storeRes, isLoading: isStoreLoading, isError } = useGetStore(storeId, {
    query: { staleTime: 5 * 60 * 1000 },
  });
  const apiStore = (storeRes as any)?.data?.data as StoreResponse | undefined;

  // 리뷰 통계 (rating, reviewCount, 별점 분포)
  const { data: reviewStatsRes } = useGetReviewStats(storeId);
  const reviewStats = (reviewStatsRes as any)?.data?.data as ReviewStatsResponse | undefined;

  // 즐겨찾기(좋아요) 수
  const { data: favCountRes } = useCountFavorites(storeId);
  const favoriteCount = (favCountRes as any)?.data?.data as number | undefined;

  // 쿠폰 목록
  const { data: couponsRes } = useGetCouponsByStore(storeId);
  const apiCoupons = ((couponsRes as any)?.data?.data ?? []) as CouponResponse[];

  // 소식 (paginated)
  const { data: newsRes, isLoading: isNewsLoading } = useGetStoreNewsList(
    storeId,
    { page: 0, size: 20 } as any,
  );
  const apiNewsPage = (newsRes as any)?.data?.data as PageResponseStoreNewsResponse | undefined;

  // 메뉴(상품) 목록
  const { data: itemsRes, isLoading: isItemsLoading } = useGetItems(storeId);
  const apiItems = ((itemsRes as any)?.data?.data ?? []) as ItemResponse[];

  // 리뷰 목록 (paginated)
  const { data: reviewsRes, isLoading: isReviewsLoading } = useGetReviews(
    storeId,
    { page: 0, size: 20 } as any,
  );
  const apiReviewsPage = (reviewsRes as any)?.data?.data as PageResponseReviewResponse | undefined;

  // ── 데이터 변환 ─────────────────────────────────────────────

  // 가게 기본 정보 (API > route params > 빈값)
  const storeName = apiStore?.name ?? name ?? '';
  const storeImage = apiStore?.imageUrls?.[0] ?? image ?? '';
  const storeAddress = apiStore?.roadAddress ?? '';
  const storeOpenHours = apiStore?.operatingHours ?? '';
  const storeCategory = apiStore?.storeCategories
    ?.map((c) => CATEGORY_LABEL[c] ?? c)
    .join(', ') ?? '';

  // 리뷰 통계 → rating, reviewCount
  const storeRating = reviewStats?.averageRating ?? (Number(rating) || 0);
  const storeReviewCount = reviewStats?.totalReviews ?? (Number(reviewCount) || 0);

  // 즐겨찾기 수
  const storeLikeCount = favoriteCount ?? 0;

  // TODO: 백엔드 필드 추가 후 API 연동 (현재 API에 없는 필드)
  const storeCloverGrowth = 0; // TODO: 클로버 등급 API 추가 후 연동
  const storeUniversity = '';  // TODO: StoreResponse에 university 필드 추가 후 연동
  const storeIsPartner = false; // TODO: StoreResponse에 isPartner 필드 추가 후 연동
  const storeBenefits: string[] = []; // TODO: 혜택 API 추가 후 연동

  // 쿠폰: API CouponResponse → 컴포넌트 Coupon 타입
  const storeCoupons = useMemo(() =>
    apiCoupons.map((c) => ({
      id: String(c.id),
      title: c.title ?? '',
      description: c.description ?? '',
      discount: '', // TODO: 백엔드에 할인 금액/비율 필드 없음 — 추가 요청 필요
      expiryDate: c.issueEndsAt ? `${formatDate(c.issueEndsAt)}까지` : '',
      targetOrganizationId: c.targetOrganizationId ?? null,
    })),
    [apiCoupons],
  );

  // 소식: API StoreNewsResponse → 컴포넌트 NewsItem 타입
  const storeNews = useMemo(() =>
    (apiNewsPage?.content ?? []).map((n) => ({
      id: String(n.id),
      type: '소식',
      date: formatDate(n.createdAt),
      title: n.title ?? '',
      content: n.content ?? '',
    })),
    [apiNewsPage],
  );

  // 메뉴: API ItemResponse[] → 컴포넌트 MenuCategory[] (flat → 단일 카테고리)
  const storeMenu = useMemo(() => {
    const visibleItems = apiItems.filter((item) => !item.hidden);
    if (visibleItems.length === 0) return [];
    return [{
      id: '1',
      name: '전체 메뉴',
      items: visibleItems.map((item) => ({
        id: String(item.id),
        name: item.name ?? '',
        description: item.description,
        price: item.price ?? 0,
        image: item.imageUrl,
        isBest: item.badge === 'BEST',
        isHot: item.badge === 'HOT' || item.badge === 'NEW',
        isSoldOut: item.soldOut,
      })),
    }];
  }, [apiItems]);

  // 리뷰: API ReviewResponse → 컴포넌트 ReviewItem 타입
  const storeReviews = useMemo(() =>
    (apiReviewsPage?.content ?? []).map((r) => ({
      id: String(r.reviewId),
      userId: '',
      nickname: r.username ?? '',
      profileImage: '', // API에 프로필 이미지 없음
      rating: r.rating ?? 0,
      date: formatDate(r.createdAt),
      content: r.content ?? '',
      images: r.imageUrls ?? [],
      likeCount: r.likeCount ?? 0,
      commentCount: 0, // ReviewResponse에 commentCount 없음
      isOwner: false,   // ReviewResponse에 isOwner 없음
    })),
    [apiReviewsPage],
  );

  // 리뷰 통계: API ReviewStatsResponse → 컴포넌트 ReviewRating 타입
  const storeReviewRating = useMemo(() => ({
    totalCount: reviewStats?.totalReviews ?? 0,
    averageRating: reviewStats?.averageRating ?? 0,
    distribution: {
      5: reviewStats?.rating5Count ?? 0,
      4: reviewStats?.rating4Count ?? 0,
      3: reviewStats?.rating3Count ?? 0,
      2: reviewStats?.rating2Count ?? 0,
      1: reviewStats?.rating1Count ?? 0,
    },
  }), [reviewStats]);

  // ── 대학 필터 & 쿠폰 필터 ──────────────────────────────────

  const selectedUniversity = selectedUniversityId
    ? UNIVERSITY_OPTIONS.find((opt) => opt.id === selectedUniversityId)?.label ?? storeUniversity
    : storeUniversity;

  const filteredCoupons = storeCoupons.filter(
    (coupon) =>
      !coupon.targetOrganizationId ||
      coupon.targetOrganizationId === selectedUniversityId,
  );

  // ── 이벤트 핸들러 ──────────────────────────────────────────

  const handleBack = () => router.back();
  const handleLike = () => setIsLiked(!isLiked);
  const handleCouponPress = () => {
    // TODO: 쿠폰 발급 UX (IssueCouponResponse에 couponId 추가 후 구현)
  };
  const handleWriteReview = () => router.push(`/store/${id}/review/write`);
  const handleEditReview = (reviewId: string) =>
    router.push(`/store/${id}/review/write?reviewId=${reviewId}`);

  // ── 로딩 / 에러 상태 ───────────────────────────────────────

  const isTabContentLoading = isNewsLoading || isItemsLoading || isReviewsLoading;

  if (isError) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText}>
          가게 정보를 불러오지 못했습니다.
        </ThemedText>
        <TouchableOpacity onPress={handleBack} style={styles.errorButton}>
          <ThemedText style={styles.errorButtonText}>돌아가기</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (isStoreLoading && !name) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#34b262" />
      </View>
    );
  }

  // ── 렌더링 ─────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: rs(80) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <StoreHeader
          image={storeImage}
          cloverGrowth={storeCloverGrowth}
          isLiked={isLiked}
          name={storeName}
          rating={storeRating}
          category={storeCategory}
          reviewCount={storeReviewCount}
          address={storeAddress}
          openHours={storeOpenHours}
          university={selectedUniversity}
          isPartner={storeIsPartner}
          onBack={handleBack}
          onLike={handleLike}
          onUniversityChange={setSelectedUniversityId}
        />

        {isStoreLoading || isTabContentLoading ? (
          <View style={styles.tabLoading}>
            <ActivityIndicator size="small" color="#34b262" />
          </View>
        ) : (
          <View style={styles.content}>
            <StoreBenefits
              benefits={storeBenefits}
              coupons={filteredCoupons}
            />

            <StoreContent
              storeId={String(id)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              news={storeNews}
              menu={storeMenu}
              announcements={[]} // TODO: 공지 API 추가 후 연동
              recommendStores={[]} // TODO: 추천 가게 API 추가 후 연동
              reviewRating={storeReviewRating}
              reviews={storeReviews}
              onWriteReview={handleWriteReview}
              onEditReview={handleEditReview}
            />
          </View>
        )}
      </ScrollView>

      <BottomFixedBar
        likeCount={storeLikeCount}
        isLiked={isLiked}
        onLikePress={handleLike}
        onCouponPress={handleCouponPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: rs(20),
    gap: rs(16),
  },
  tabLoading: {
    paddingVertical: rs(40),
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#34b262',
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
