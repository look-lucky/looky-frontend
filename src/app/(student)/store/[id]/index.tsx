import { useDownloadCoupon, useGetCouponsByStore, useGetMyCoupons } from '@/src/api/coupon';
import { useAddFavorite, useCountFavorites, useGetMyFavorites, useRemoveFavorite } from '@/src/api/favorite';
import type {
  CouponResponse,
  ItemResponse,
  PageResponseReviewResponse,
  PageResponseStoreNewsResponse,
  ReviewStatsResponse,
  StorePartnershipResponse,
  StoreResponse,
} from '@/src/api/generated.schemas';
import { useGetItems } from '@/src/api/item';
import { useGetStudentInfo } from '@/src/api/my-page';
import { useGetOrganizations } from '@/src/api/organization';
import { useGetStorePartnerships } from '@/src/api/partnership';
import { useAddLike, useDeleteReview, useGetReviews, useGetReviewStats, useRemoveLike } from '@/src/api/review';
import { useGetStore } from '@/src/api/store';
import { useGetStoreNewsList } from '@/src/api/store-news';
import { StoreBenefits } from '@/src/app/(student)/components/store/benefits';
import { BottomFixedBar } from '@/src/app/(student)/components/store/bottom-bar';
import { StoreContent } from '@/src/app/(student)/components/store/content';
import { CouponModal } from '@/src/app/(student)/components/store/coupon-modal';
import { StoreHeader } from '@/src/app/(student)/components/store/header';
import { ThemedText } from '@/src/shared/common/themed-text';
import { useAuth } from '@/src/shared/lib/auth';
import { rs } from '@/src/shared/theme/scale';
import type { MenuCategory } from '@/src/shared/types/store';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

const MOOD_LABEL: Record<string, string> = {
  SOLO_DINING: '혼밥',
  GROUP_GATHERING: '단체모임',
  LATE_NIGHT: '심야영업',
  ROMANTIC: '로맨틱',
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

const formatDiscount = (benefitType?: string, benefitValue?: string) => {
  if (!benefitValue) return '';
  switch (benefitType) {
    case 'PERCENTAGE_DISCOUNT':
      const cleanPercent = String(benefitValue).replace(/[^0-9]/g, '');
      return `${cleanPercent}% 할인`;
    case 'FIXED_DISCOUNT':
      const cleanValue = String(benefitValue).replace(/[^0-9]/g, '');
      const price = Number(cleanValue);
      return `${isNaN(price) ? '0' : price.toLocaleString()}원 쿠폰`;
    case 'SERVICE_GIFT':
      return benefitValue;
    default:
      return benefitValue;
  }
};

export default function StoreDetailScreen() {
  const { id, name, image, rating, reviewCount, tab, openCoupon } = useLocalSearchParams<{
    id: string;
    name?: string;
    image?: string;
    rating?: string;
    reviewCount?: string;
    tab?: string;
    openCoupon?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { collegeName: userCollegeName, username: currentUsername, saveUserCollegeName } = useAuth();
  const [activeTab, setActiveTab] = useState(tab ?? 'news');
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeInitialized, setIsLikeInitialized] = useState(false);
  const [selectedOrgName, setSelectedOrgName] = useState<string | null>(null);
  const [isCouponModalVisible, setIsCouponModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetY = useRef(0);
  const contentYRef = useRef(0);

  // 리뷰 페이지네이션 상태
  const [reviewPage, setReviewPage] = useState(0);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  const storeId = Number(id);

  // ── API hooks ──────────────────────────────────────────────

  // 학생 프로필 (universityId 획득용)
  const { data: studentInfoRes } = useGetStudentInfo({
    query: { staleTime: 10 * 60 * 1000 },
  });
  const studentInfo = (studentInfoRes as any)?.data?.data;
  const profileCollegeName = studentInfo?.collegeName as string | undefined;
  const universityId = studentInfo?.universityId as number | undefined;

  // 대학 전체 소속 목록 (목록 누락 방지용)
  const { data: orgsRes } = useGetOrganizations(universityId as number, {
    query: { enabled: !!universityId, staleTime: 10 * 60 * 1000 }
  });
  const apiOrganizations = ((orgsRes as any)?.data?.data ?? []) as any[];

  // profileCollegeName이 로드되면 auth에 저장 (이후 API 호출 불필요)
  React.useEffect(() => {
    if (profileCollegeName && userCollegeName === null) {
      saveUserCollegeName(profileCollegeName);
    }
  }, [profileCollegeName, userCollegeName]);

  // 가게 기본 정보
  const { data: storeRes, isLoading: isStoreLoading, isError } = useGetStore(storeId, {
    query: { staleTime: 5 * 60 * 1000 },
  });
  const apiStore = (storeRes as any)?.data?.data as StoreResponse | undefined;

  // 메뉴판 이미지는 이제 가게 정보(apiStore)에 포함되어 내려옵니다.
  const menuImageUrls = (apiStore as any)?.menuBoardImageUrls || [];

  // 리뷰 통계 (rating, reviewCount, 별점 분포)
  const { data: reviewStatsRes } = useGetReviewStats(storeId);
  const reviewStats = (reviewStatsRes as any)?.data?.data as ReviewStatsResponse | undefined;

  // 즐겨찾기(좋아요) 수
  const { data: favCountRes } = useCountFavorites(storeId);
  const favoriteCount = (favCountRes as any)?.data?.data as number | undefined;

  // 내 즐겨찾기 목록 (현재 가게 찜 여부 확인용)
  const { data: myFavoritesRes } = useGetMyFavorites({ page: 0, size: 100 } as any);
  const myFavoriteStoreIds = useMemo(() => {
    const list = (myFavoritesRes as any)?.data?.data?.content ?? [];
    return (list as any[]).map((f: any) => f.storeId as number);
  }, [myFavoritesRes]);

  // 제휴 혜택 목록 + 대학 전체 소속 목록 병합
  const { data: partnershipsRes } = useGetStorePartnerships(storeId);
  const apiPartnerships = useMemo(() => {
    const detailPartnerships = ((partnershipsRes as any)?.data?.data ?? []) as StorePartnershipResponse[];

    // 현재 표시할 전체 단체 목록 생성
    const mergedMap = new Map<string, StorePartnershipResponse>();

    // 1. 대학 전체 소속 (기본) - 학과(DEPARTMENT)는 제외
    apiOrganizations.forEach(org => {
      // organizationCategory가 DEPARTMENT이거나 이름에 '학과'가 포함된 경우 제외
      if (org.name && org.category !== 'DEPARTMENT' && !org.name.endsWith('학과')) {
        mergedMap.set(org.name, {
          organizationName: org.name,
          organizationCategory: org.category,
          isMyBenefit: false
        });
      }
    });

    // 2. 상점 보유 제휴 (우선순위 높음, 혜택 정보 포함) - 학과는 동일하게 제외
    detailPartnerships.forEach(p => {
      if (p.organizationName && p.organizationCategory !== 'DEPARTMENT' && !p.organizationName.endsWith('학과')) {
        mergedMap.set(p.organizationName, {
          ...p,
          isMyBenefit: p.isMyBenefit || p.organizationName === (userCollegeName ?? profileCollegeName)
        });
      }
    });

    return Array.from(mergedMap.values());
  }, [partnershipsRes, apiOrganizations, userCollegeName, profileCollegeName]);

  // 쿠폰 목록
  const { data: couponsRes } = useGetCouponsByStore(storeId);
  const rawCoupons = (couponsRes as any)?.data?.data;
  const apiCoupons = (Array.isArray(rawCoupons) ? rawCoupons : []) as CouponResponse[];

  // 내 쿠폰 목록 (이미 발급받은 쿠폰 확인용)
  const { data: myCouponsRes } = useGetMyCoupons();
  const rawMyCoupons = (myCouponsRes as any)?.data?.data;
  const myCoupons = (Array.isArray(rawMyCoupons) ? rawMyCoupons : []) as any[];

  // 즐겨찾기 초기 상태 동기화
  React.useEffect(() => {
    if (!isLikeInitialized && myFavoritesRes !== undefined) {
      setIsLiked(myFavoriteStoreIds.includes(storeId));
      setIsLikeInitialized(true);
    }
  }, [myFavoritesRes, myFavoriteStoreIds, storeId, isLikeInitialized]);

  // 쿠폰 바로가기 처리
  useEffect(() => {
    if (openCoupon === 'true') {
      setIsCouponModalVisible(true);
    }
  }, [openCoupon]);

  // 즐겨찾기 추가/취소 mutation
  const addFavoriteMutation = useAddFavorite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/favorites/count`] });
        queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      },
      onError: () => {
        setIsLiked(false);
        Alert.alert('오류', '즐겨찾기 추가에 실패했습니다.');
      },
    },
  });
  const removeFavoriteMutation = useRemoveFavorite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/favorites/count`] });
        queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      },
      onError: () => {
        setIsLiked(true);
        Alert.alert('오류', '즐겨찾기 취소에 실패했습니다.');
      },
    },
  });

  // 쿠폰 발급 mutation
  const issueCouponMutation = useDownloadCoupon({
    mutation: {
      onSuccess: () => {
        Alert.alert('쿠폰 발급 완료', '내 쿠폰함에서 확인하세요');
        // 내 쿠폰 목록 갱신 + 지도 마커 hasCoupon 반영
        queryClient.invalidateQueries({ queryKey: ['/api/my-coupons'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stores/map'] });
      },
      onError: (error: any) => {
        const errorMessage =
          error?.data?.message ||
          error?.data?.data?.message ||
          error?.message ||
          '이미 발급받은 쿠폰이거나 발급 기간이 아닙니다';
        Alert.alert('발급 실패', errorMessage);
      },
    },
  });

  // 리뷰 좋아요 mutation
  const addLikeMutation = useAddLike({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/reviews`] });
      },
    },
  });
  const removeLikeMutation = useRemoveLike({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/reviews`] });
      },
    },
  });

  // 소식 (paginated)
  const { data: newsRes, isLoading: isNewsLoading } = useGetStoreNewsList(
    storeId,
    { page: 0, size: 20 } as any,
  );
  const apiNewsPage = (newsRes as any)?.data?.data as PageResponseStoreNewsResponse | undefined;

  // 메뉴(상품) 목록
  const { data: itemsRes, isLoading: isItemsLoading } = useGetItems(storeId);
  const rawItems = (itemsRes as any)?.data?.data;
  const apiItems = (Array.isArray(rawItems) ? rawItems : []) as ItemResponse[];

  // 리뷰 목록 (paginated)
  const { data: reviewsRes, isLoading: isReviewsLoading, isFetching: isReviewsFetching } = useGetReviews(
    storeId,
    { page: reviewPage, size: 20 } as any,
  );
  const apiReviewsPage = (reviewsRes as any)?.data?.data as PageResponseReviewResponse | undefined;

  // 리뷰 데이터 누적 처리
  useEffect(() => {
    if (apiReviewsPage?.content) {
      if (reviewPage === 0) {
        // 첫 페이지는 덮어쓰기
        setAllReviews(apiReviewsPage.content);
      } else {
        // 이후 페이지는 추가
        setAllReviews((prev) => [...prev, ...(apiReviewsPage.content ?? [])]);
      }
      // 마지막 페이지 체크
      setHasMoreReviews(!apiReviewsPage.last);
    }
  }, [apiReviewsPage, reviewPage]);

  // ── 데이터 변환 ─────────────────────────────────────────────

  // 가게 기본 정보 (API > route params > 빈값)
  const storeName = apiStore?.name ?? name ?? '';
  const storeImages = useMemo(() => {
    const apiUrls = apiStore?.imageUrls ?? [];
    if (apiUrls.length > 0) return apiUrls;
    return image ? [image] : [];
  }, [apiStore?.imageUrls, image]);
  const storeAddress = apiStore?.roadAddress ?? '';
  const storeOpenHours = apiStore?.operatingHours ?? '';
  const storeCategory = apiStore?.storeCategories
    ?.map((c) => CATEGORY_LABEL[c] ?? c)
    .join(', ') ?? '';
  const storeMoods = apiStore?.storeMoods
    ?.map((m) => MOOD_LABEL[m] ?? m)
    .join(' · ') ?? '';

  // 리뷰 통계 → rating, reviewCount (StoreResponse에서 우선 사용, 없으면 route params)
  const storeRating = apiStore?.averageRating ?? (Number(rating) || 0);
  const storeReviewCount = apiStore?.reviewCount ?? (Number(reviewCount) || 0);

  // 휴무일 포맷팅 (YYYY-MM-DD -> MM/DD, 콤마로 연결)
  const storeHolidayDates = useMemo(() => {
    const dates = apiStore?.holidayDates ?? [];
    return dates.map(d => {
      if (d.includes('-')) {
        const parts = d.split('-');
        if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
        if (parts.length === 2) return `${parts[0]}/${parts[1]}`;
      }
      return d.replace(/-/g, '/');
    }).join(', ');
  }, [apiStore?.holidayDates]);

  // 즐겨찾기 수
  const storeLikeCount = favoriteCount ?? 0;

  const storeCloverGrade = apiStore?.cloverGrade;

  // 선택된 단체 기준으로 제휴 여부 및 혜택 내용 계산
  const currentPartnership = selectedOrgName
    ? apiPartnerships.find((p) => p.organizationName === selectedOrgName)
    : apiPartnerships.find((p) => p.isMyBenefit);
  const storeIsPartner = currentPartnership?.isMyBenefit ?? false;
  const storeBenefits: string[] = currentPartnership?.benefit
    ? [currentPartnership.benefit]
    : [];

  // 쿠폰: API CouponResponse → 컴포넌트 Coupon 타입 (발급 기간 필터링 포함)
  const storeCoupons = useMemo(() => {
    const now = new Date();
    return apiCoupons
      .filter((c) => {
        if (c.issueStartsAt && new Date(c.issueStartsAt) > now) return false;
        if (c.issueEndsAt && new Date(c.issueEndsAt) < now) return false;
        return true;
      })
      .map((c) => ({
        id: String(c.id),
        title: c.title ?? '',
        description: c.minOrderAmount ? `최소 주문 ${Number(c.minOrderAmount).toLocaleString()}원` : '',
        discount: formatDiscount(c.benefitType, c.benefitValue),
        expiryDate: c.issueEndsAt ? `${formatDate(c.issueEndsAt)}까지 발급 가능` : '',
        remainingCount: c.totalQuantity != null && c.downloadCount != null
          ? Math.max(0, c.totalQuantity - c.downloadCount) : undefined,
        benefitType: c.benefitType as any,
      }));
  }, [apiCoupons]);

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

  // 메뉴: API ItemResponse[] → 컴포넌트 MenuCategory[] (카테고리별 그룹화)
  const storeMenu = useMemo(() => {
    const visibleItems = apiItems.filter((item) => !item.hidden);
    if (visibleItems.length === 0) return [];

    const categoryMap = new Map<number, MenuCategory>();

    visibleItems.forEach((item) => {
      const catId = item.categoryId ?? 0;
      const catName = item.categoryName ?? '기타';

      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          id: String(catId),
          name: catName,
          items: [],
        });
      }

      categoryMap.get(catId)?.items.push({
        id: String(item.id),
        name: item.name ?? '',
        description: item.description,
        price: item.price ?? 0,
        image: item.imageUrl,
        isBest: item.badge === 'BEST',
        isHot: item.badge === 'HOT' || item.badge === 'NEW',
        isSoldOut: item.soldOut,
        badge: item.badge,
      });
    });

    // 카테고리 내에서 itemOrder 기준으로 정렬 (필요 시)
    const result = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      items: cat.items.sort((a, b) => {
        const itemA = apiItems.find(i => String(i.id) === a.id);
        const itemB = apiItems.find(i => String(i.id) === b.id);
        return (itemA?.itemOrder ?? 0) - (itemB?.itemOrder ?? 0);
      })
    }));

    // 카테고리 간 정렬 (id 기준이나 첫 번째 아이템의 order 기준)
    return result.sort((a, b) => Number(a.id) - Number(b.id));
  }, [apiItems]);

  // 리뷰: API ReviewResponse → 컴포넌트 ReviewItem 타입
  // ownerReply(= isOwnerReply)는 루트 리뷰에 "사장님 답글 달림" bool로 옴 (별도 reply 객체 아님)
  const storeReviews = useMemo(() =>
    allReviews.map((r) => ({
      id: String(r.reviewId),
      userId: '',
      nickname: r.nickname ?? r.username ?? '',
      profileImage: '',
      rating: r.rating ?? 0,
      date: formatDate(r.createdAt),
      content: r.content ?? '',
      images: r.imageUrls ?? [],
      likeCount: r.likeCount ?? 0,
      commentCount: 0,
      isOwner: !!(currentUsername && r.username === currentUsername),
      hasReply: r.ownerReply ?? false,
      isLiked: r.liked ?? false,
      ownerProfileImage: (apiStore as any)?.profileImageUrl,
      replyContent: (r as any).children?.[((r as any).children?.length || 1) - 1]?.content,
      replyDate: (r as any).children?.[((r as any).children?.length || 1) - 1]?.createdAt
        ? formatDate((r as any).children?.[((r as any).children?.length || 1) - 1].createdAt)
        : undefined,
    })),
    [allReviews, currentUsername, apiStore?.profileImageUrl]);

  // 매장 정보: API StoreResponse → InfoSection props
  const storeInfo = useMemo(() => ({
    introduction: apiStore?.introduction ?? '',
    operatingHours: storeOpenHours,
    roadAddress: storeAddress,
    jibunAddress: apiStore?.jibunAddress ?? '',
    phone: apiStore?.phone ?? '',
    category: storeCategory,
    moods: storeMoods,
    lat: apiStore?.latitude ?? undefined,
    lng: apiStore?.longitude ?? undefined,
  }), [apiStore, storeOpenHours, storeAddress, storeCategory, storeMoods]);

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

  const resolvedCollegeName = userCollegeName ?? profileCollegeName ?? '';
  const selectedUniversity = selectedOrgName ?? resolvedCollegeName;

  const filteredCoupons = storeCoupons;

  // 이미 발급받은 쿠폰 타이틀 목록 (API에 couponId 필드 없어서 title로 매칭)
  const issuedCouponTitles = useMemo(() =>
    myCoupons
      .filter((mc) => mc.title != null)
      .map((mc) => mc.title as string),
    [myCoupons],
  );

  // ── 이벤트 핸들러 ──────────────────────────────────────────

  const handleBack = () => router.back();

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true; // true 반환 = 기본 동작(앱 종료 다이얼로그) 차단
    });
    return () => subscription.remove();
  }, []);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      removeFavoriteMutation.mutate({ storeId });
    } else {
      setIsLiked(true);
      addFavoriteMutation.mutate({ storeId });
    }
  };
  const handleCouponPress = () => {
    setIsCouponModalVisible(true);
  };
  const handleIssueCoupon = (couponId: string) => {
    issueCouponMutation.mutate({ couponId: Number(couponId) });
  };
  const handleReviewPress = () => {
    setActiveTab('review');
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: contentYRef.current, animated: true });
    }, 50);
  };

  const handleWriteReview = () => router.push(`/store/${id}/review/write?storeName=${encodeURIComponent(storeName)}`);
  const handleEditReview = (reviewId: string) => {
    const review = allReviews.find((r) => String(r.reviewId) === reviewId);
    if (!review) return;
    const imageUrlsParam = review.imageUrls && review.imageUrls.length > 0
      ? encodeURIComponent(JSON.stringify(review.imageUrls))
      : '';
    router.push(
      `/mypage/edit-review?reviewId=${review.reviewId}&storeName=${encodeURIComponent(review.storeName ?? storeName)}&rating=${review.rating}&content=${encodeURIComponent(review.content ?? '')}&imageUrls=${imageUrlsParam}`
    );
  };
  const { mutate: deleteReviewMutate } = useDeleteReview();
  const handleDeleteReview = (reviewId: string) => {
    Alert.alert('리뷰 삭제', '리뷰를 삭제하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () =>
          deleteReviewMutate(
            { reviewId: Number(reviewId) },
            {
              onSuccess: () => {
                setReviewPage(0);
                queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/reviews`] });
                queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/reviews/stats`] });
              },
            },
          ),
      },
    ]);
  };
  const handleLikeReview = (reviewId: string) => {
    const review = allReviews.find((r) => String(r.reviewId) === reviewId);
    if (review?.liked) {
      removeLikeMutation.mutate({ reviewId: Number(reviewId) });
    } else {
      addLikeMutation.mutate({ reviewId: Number(reviewId) });
    }
  };
  const handleLoadMoreReviews = () => {
    if (!isReviewsFetching && hasMoreReviews) {
      setReviewPage((prev) => prev + 1);
    }
  };

  // ── 로딩 / 에러 상태 ───────────────────────────────────────

  const isTabContentLoading = isNewsLoading || isItemsLoading || isReviewsLoading;

  if (isError) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText} lightColor="#666" darkColor="#666">
          가게 정보를 불러오지 못했습니다.
        </ThemedText>
        <TouchableOpacity onPress={handleBack} style={styles.errorButton}>
          <ThemedText style={styles.errorButtonText} lightColor="#fff" darkColor="#fff">돌아가기</ThemedText>
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
        ref={scrollViewRef}
        onScroll={(e) => { scrollOffsetY.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: rs(60) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <StoreHeader
          images={storeImages}
          cloverGrade={storeCloverGrade}
          isLiked={isLiked}
          name={storeName}
          rating={storeRating}
          category={storeCategory}
          reviewCount={storeReviewRating.totalCount || storeReviewCount}
          address={storeAddress}
          latitude={apiStore?.latitude ?? undefined}
          longitude={apiStore?.longitude ?? undefined}
          openHours={storeOpenHours}
          closedDays={storeHolidayDates}
          university={selectedUniversity}
          isPartner={storeIsPartner}
          partnerships={apiPartnerships}
          onBack={handleBack}
          onLike={handleLike}
          onReviewPress={handleReviewPress}
          onUniversityChange={setSelectedOrgName}
        />

        {isStoreLoading || isTabContentLoading ? (
          <View style={styles.tabLoading}>
            <ActivityIndicator size="small" color="#34b262" />
          </View>
        ) : (
          <View
            style={styles.content}
            onLayout={(e) => { contentYRef.current = e.nativeEvent.layout.y; }}
          >
            <StoreBenefits
              benefits={storeBenefits}
              coupons={filteredCoupons}
              onCouponPress={handleCouponPress}
            />

            <StoreContent
              storeId={String(id)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              news={storeNews}
              menu={storeMenu}
              menuImageUrls={menuImageUrls}
              announcements={storeNews.map((n) => ({ id: n.id, title: n.title, content: n.content }))}
              recommendStores={[]} // TODO: 추천 가게 API 추가 후 연동
              reviewRating={storeReviewRating}
              reviews={storeReviews}
              onWriteReview={handleWriteReview}
              onEditReview={handleEditReview}
              onDeleteReview={handleDeleteReview}
              onLikeReview={handleLikeReview}
              storeInfo={storeInfo}
              scrollViewRef={scrollViewRef}
              scrollOffsetY={scrollOffsetY}
              onLoadMoreReviews={handleLoadMoreReviews}
              hasMoreReviews={hasMoreReviews}
              isLoadingMoreReviews={isReviewsFetching && reviewPage > 0}
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

      <CouponModal
        visible={isCouponModalVisible}
        onClose={() => setIsCouponModalVisible(false)}
        storeName={storeName}
        coupons={filteredCoupons}
        issuedCouponTitles={issuedCouponTitles}
        onIssueCoupon={handleIssueCoupon}
        isIssuing={issueCouponMutation.isPending}
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
    gap: 0,
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
