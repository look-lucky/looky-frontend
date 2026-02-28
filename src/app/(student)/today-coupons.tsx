import GiftIcon from '@/assets/images/icons/coupon/gift.svg';
import HotPriceIcon from '@/assets/images/icons/coupon/hot-price.svg';
import PriceTagDollarIcon from '@/assets/images/icons/coupon/price-tag-dollar.svg';
import { useDownloadCoupon, useGetTodayCoupons } from '@/src/api/coupon';
import { ArrowLeft } from '@/src/shared/common/arrow-left';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import {
  Coupon as CouponColor,
  Fonts,
  Gray,
  Primary,
  Text as TextColor,
} from '@/src/shared/theme/theme';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CouponFilter = 'all' | 'FIXED_DISCOUNT' | 'PERCENTAGE_DISCOUNT' | 'SERVICE_GIFT';

const FILTER_BUTTONS: { type: CouponFilter; label: string }[] = [
  { type: 'all', label: '전체' },
  { type: 'FIXED_DISCOUNT', label: '금액 할인' },
  { type: 'PERCENTAGE_DISCOUNT', label: '퍼센트 할인' },
  { type: 'SERVICE_GIFT', label: '서비스 증정' },
];

const BENEFIT_ICON_BG: Record<string, string> = {
  PERCENTAGE_DISCOUNT: CouponColor.red,
  FIXED_DISCOUNT: CouponColor.green,
  SERVICE_GIFT: CouponColor.yellow,
};

const COUPON_ICONS: Record<string, any> = {
  PERCENTAGE_DISCOUNT: HotPriceIcon,
  FIXED_DISCOUNT: PriceTagDollarIcon,
  SERVICE_GIFT: GiftIcon,
};

const formatDiscount = (benefitType?: string, benefitValue?: string) => {
  if (!benefitValue) return '';
  switch (benefitType) {
    case 'PERCENTAGE_DISCOUNT':
      return `${benefitValue}%`;
    case 'FIXED_DISCOUNT':
      return `${Number(benefitValue).toLocaleString()}원`;
    case 'SERVICE_GIFT':
      return '서비스 증정';
    default:
      return benefitValue;
  }
};

const formatIssueEndDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = d.getHours();
  const min = d.getMinutes();
  const period = h < 12 ? '오전' : '오후';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const timeStr = min > 0
    ? `${period} ${displayH}:${String(min).padStart(2, '0')}`
    : `${period} ${displayH}:00`;
  return `${y}.${m}.${day} ${timeStr}까지 발급 가능`;
};

const getTimeAgo = (dateStr?: string) => {
  if (!dateStr) return '';
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now.getTime() - created.getTime();
  if (diffMs < 0) return '방금 전';
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours >= 1) return `${diffHours}시간 전`;
  if (diffMinutes >= 1) return `${diffMinutes}분 전`;
  return '방금 전';
};

export default function TodayCouponsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<CouponFilter>('all');
  const downloadCouponMutation = useDownloadCoupon();

  const { data: todayCouponsRes, isLoading } = useGetTodayCoupons();
  const rawCoupons = (todayCouponsRes as any)?.data?.data ?? [];
  const coupons = Array.isArray(rawCoupons) ? rawCoupons : [];

  const filteredCoupons = useMemo(() => {
    if (selectedFilter === 'all') return coupons;
    return coupons.filter((c: any) => c.benefitType === selectedFilter);
  }, [coupons, selectedFilter]);

  const handleCouponPress = (coupon: any) => {
    downloadCouponMutation.mutate({ couponId: coupon.id });
    router.push(`/store/${coupon.storeId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <ArrowLeft size={rs(24)} />
      </View>

      {/* Banner */}
      <View style={styles.bannerPadding}>
        <View style={styles.banner}>
          <View style={styles.bannerTextContent}>
            <ThemedText style={styles.bannerTitle}>따끈따끈 쿠폰함</ThemedText>
            <ThemedText style={styles.bannerSubtitle}>
              {'이 주변 행운이 만들어졌어요!\n얼른 행운을 찾아가세요!'}
            </ThemedText>
          </View>
          <Image
            source={require('@/assets/images/icons/home/clover-home.png')}
            style={styles.bannerClover}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTER_BUTTONS.map((btn) => (
            <TouchableOpacity
              key={btn.type}
              style={[
                styles.filterButton,
                selectedFilter === btn.type && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(btn.type)}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  selectedFilter === btn.type && styles.filterButtonTextActive,
                ]}
              >
                {btn.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Coupon List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Primary['500']} />
          </View>
        ) : filteredCoupons.length === 0 ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.emptyText}>
              오늘 발급된 쿠폰이 없습니다
            </ThemedText>
          </View>
        ) : (
          filteredCoupons.map((coupon: any) => {
            const CouponIcon = COUPON_ICONS[coupon.benefitType ?? ''];
            const iconBg = BENEFIT_ICON_BG[coupon.benefitType ?? ''] ?? CouponColor.yellow;
            const timeAgo = getTimeAgo(coupon.issueStartsAt);
            const issueEndText = formatIssueEndDate(coupon.issueEndsAt);
            const discountDisplay = formatDiscount(coupon.benefitType, coupon.benefitValue);

            return (
              <TouchableOpacity
                key={coupon.id}
                style={styles.couponCard}
                onPress={() => handleCouponPress(coupon)}
                activeOpacity={0.8}
              >
                <View style={[styles.couponIconContainer, { backgroundColor: iconBg }]}>
                  {CouponIcon ? (
                    <CouponIcon width={rs(40)} height={rs(40)} />
                  ) : (
                    <View style={styles.couponIconPlaceholder} />
                  )}
                </View>
                <View style={styles.couponTextContainer}>
                  <ThemedText style={styles.couponDiscount}>
                    {discountDisplay}
                  </ThemedText>
                  <ThemedText style={styles.couponTitle} numberOfLines={1}>
                    {coupon.title ?? ''}
                  </ThemedText>
                  {coupon.minOrderAmount ? (
                    <ThemedText style={styles.couponMeta}>
                      최소 주문 {Number(coupon.minOrderAmount).toLocaleString()}원
                    </ThemedText>
                  ) : coupon.description ? (
                    <ThemedText style={styles.couponMeta} numberOfLines={1}>
                      {coupon.description}
                    </ThemedText>
                  ) : null}
                  {issueEndText ? (
                    <ThemedText style={styles.couponMeta}>{issueEndText}</ThemedText>
                  ) : null}
                  {timeAgo ? (
                    <View style={styles.timeAgoRow}>
                      <ThemedText style={styles.timeAgoIcon}>⏰</ThemedText>
                      <ThemedText style={styles.timeAgoText}>{timeAgo}</ThemedText>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
  },
  header: {
    paddingHorizontal: rs(16),
    height: rs(44),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bannerPadding: {
    paddingHorizontal: rs(16),
    paddingBottom: rs(16),
  },
  banner: {
    backgroundColor: '#34B262',
    borderRadius: rs(16),
    paddingHorizontal: rs(20),
    paddingVertical: rs(20),
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerTextContent: {
    flex: 1,
    gap: rs(8),
  },
  bannerTitle: {
    fontFamily: Fonts.bold,
    fontSize: rs(20),
    color: Gray.white,
  },
  bannerSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: rs(12),
    color: Gray.white,
    opacity: 0.9,
  },
  bannerClover: {
    width: rs(80),
    height: rs(80),
  },
  filterContainer: {
    height: rs(44),
    backgroundColor: Primary.textBg,
  },
  filterScrollContent: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(8),
    gap: rs(8),
    flexDirection: 'row',
  },
  filterButton: {
    borderRadius: rs(20),
    paddingHorizontal: rs(12),
    paddingVertical: rs(4),
    backgroundColor: Gray.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Gray.gray3,
  },
  filterButtonActive: {
    backgroundColor: Gray.black,
    borderColor: Gray.black,
  },
  filterButtonText: {
    fontFamily: Fonts.bold,
    fontSize: rs(12),
    lineHeight: rs(16),
    color: TextColor.primary,
  },
  filterButtonTextActive: {
    color: Gray.white,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Primary.textBg,
  },
  listContent: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(12),
    gap: rs(12),
  },
  couponCard: {
    backgroundColor: Gray.white,
    borderRadius: rs(16),
    paddingHorizontal: rs(12),
    paddingVertical: rs(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(16),
    borderWidth: 1,
    borderColor: Gray.gray3,
  },
  couponIconContainer: {
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
    padding: rs(12),
  },
  couponIconPlaceholder: {
    width: rs(40),
    height: rs(40),
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: rs(8),
  },
  couponTextContainer: {
    flex: 1,
    gap: rs(2),
  },
  couponDiscount: {
    fontFamily: Fonts.bold,
    fontSize: rs(14),
    lineHeight: rs(20),
    color: TextColor.primary,
  },
  couponTitle: {
    fontFamily: Fonts.medium,
    fontSize: rs(13),
    lineHeight: rs(18),
    color: TextColor.primary,
  },
  couponMeta: {
    fontFamily: Fonts.regular,
    fontSize: rs(11),
    lineHeight: rs(16),
    color: TextColor.secondary,
  },
  timeAgoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    marginTop: rs(2),
  },
  timeAgoIcon: {
    fontSize: rs(10),
  },
  timeAgoText: {
    fontFamily: Fonts.medium,
    fontSize: rs(11),
    lineHeight: rs(16),
    color: '#DC2626',
  },
  centerContainer: {
    paddingVertical: rs(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: rs(14),
    color: TextColor.tertiary,
  },
});
