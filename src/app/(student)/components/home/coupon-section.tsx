import LightingIcon from '@/assets/images/icons/home/lighting.svg';
import { useDownloadCoupon } from '@/src/api/coupon';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Coupon, Gray, Text as TextColor } from '@/src/shared/theme/theme';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SectionHeader } from './section-header';

export interface CouponItem {
  id: number;
  storeId: number;
  storeName?: string;
  title: string;
  description?: string;
  benefitType: 'FIXED_DISCOUNT' | 'PERCENTAGE_DISCOUNT' | 'SERVICE_GIFT';
  benefitValue: string;
  issueStartsAt?: string;
}

interface CouponSectionProps {
  coupons: CouponItem[];
}

export function CouponSection({ coupons }: CouponSectionProps) {
  const router = useRouter();
  const downloadCouponMutation = useDownloadCoupon();

  const handleMorePress = () => {
    router.push('/today-coupons' as any);
  };

  const handleCouponPress = (coupon: CouponItem) => {
    downloadCouponMutation.mutate({ couponId: coupon.id });
    router.push(`/store/${coupon.storeId}`);
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();

    if (diffMs < 0) return '방금 전';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}분 전`;
    }
    return `${diffHours}시간 전`;
  };

  const getDiscountDisplay = (coupon: CouponItem) => {
    switch (coupon.benefitType) {
      case 'PERCENTAGE_DISCOUNT':
        return `${coupon.benefitValue}% 할인`;
      case 'FIXED_DISCOUNT':
        return `${Number(coupon.benefitValue).toLocaleString()}원 쿠폰`;
      case 'SERVICE_GIFT':
        return '서비스 증정';
      default:
        return '';
    }
  };

  const getCouponIcon = (benefitType: string) => {
    switch (benefitType) {
      case 'PERCENTAGE_DISCOUNT':
        return '🏷️';
      case 'FIXED_DISCOUNT':
        return '💰';
      case 'SERVICE_GIFT':
        return '🎁';
      default:
        return '🎫';
    }
  };

  const getCouponColor = (benefitType: string) => {
    switch (benefitType) {
      case 'PERCENTAGE_DISCOUNT':
        return Coupon.red;
      case 'FIXED_DISCOUNT':
        return Coupon.yellow;
      case 'SERVICE_GIFT':
        return Coupon.green;
      default:
        return Coupon.yellow;
    }
  };

  if (coupons.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader
          icon={<LightingIcon width={rs(10)} height={rs(20)} />}
          title="오늘 발급된 따끈한 쿠폰"
          onMorePress={handleMorePress}
        />
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            현재 발급된 쿠폰이 없습니다
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader
        icon="🍀"
        title="오늘 발급된 따끈한 쿠폰"
        onMorePress={handleMorePress}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {coupons.slice(0, 3).map((coupon) => (
          <TouchableOpacity
            key={coupon.id}
            style={styles.couponCard}
            onPress={() => handleCouponPress(coupon)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.couponTop,
                { backgroundColor: getCouponColor(coupon.benefitType) },
              ]}
            >
              <ThemedText style={styles.couponIcon}>
                {getCouponIcon(coupon.benefitType)}
              </ThemedText>
            </View>
            <View style={styles.couponBottom}>
              <View style={styles.timeContainer}>
                <ThemedText style={styles.clockIcon}>⏰</ThemedText>
                <ThemedText style={styles.timeText}>
                  {getTimeAgo(coupon.issueStartsAt)}
                </ThemedText>
              </View>
              <ThemedText style={styles.storeName} numberOfLines={1}>
                {coupon.storeName}
              </ThemedText>
              <ThemedText style={styles.couponTitle} numberOfLines={1}>
                {coupon.title}
              </ThemedText>
              <ThemedText style={styles.discountText}>
                {getDiscountDisplay(coupon)}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: rs(8),
  },
  scrollContent: {
    gap: rs(12),
    paddingHorizontal: rs(4),
  },
  couponCard: {
    width: rs(120),
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    overflow: 'hidden',
  },
  couponTop: {
    height: rs(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponIcon: {
    fontSize: rs(28),
  },
  couponBottom: {
    padding: rs(10),
    gap: rs(2),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  clockIcon: {
    fontSize: rs(10),
  },
  timeText: {
    fontSize: rs(10),
    color: '#DC2626',
    fontWeight: '500',
  },
  storeName: {
    fontSize: rs(10),
    color: TextColor.tertiary,
    marginTop: rs(4),
  },
  couponTitle: {
    fontSize: rs(12),
    fontWeight: '600',
    color: TextColor.primary,
  },
  discountText: {
    fontSize: rs(12),
    fontWeight: '700',
    color: '#EF6239',
    marginTop: rs(2),
  },
  emptyContainer: {
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    padding: rs(24),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: rs(14),
    color: TextColor.tertiary,
  },
});
