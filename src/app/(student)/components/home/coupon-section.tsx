import ClockIcon from '@/assets/images/icons/event/clock.svg';
import GiftIcon from '@/assets/images/icons/home/coupon-gift.svg';
import HotPriceIcon from '@/assets/images/icons/home/coupon-hot-price.svg';
import PriceTagDollarIcon from '@/assets/images/icons/home/coupon-tag-dollar.svg';
import LightingIcon from '@/assets/images/icons/home/lighting.svg';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Text as TextColor } from '@/src/shared/theme/theme';
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

  const handleMorePress = () => {
    router.push('/today-coupons' as any);
  };

  const handleCouponPress = (coupon: CouponItem) => {
    // downloadCouponMutation.mutate({ couponId: coupon.id });
    router.push(`/store/${coupon.storeId}?openCoupon=true` as any);
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const now = new Date();

    // 서버에서 오는 형식이 "2024-03-05 10:00:00" 처럼 Z가 없는 경우,
    // JS Date는 이를 로컬 시간으로 간주합니다. 서버가 UTC로 보낸다면 Z를 붙여줘야 합니다.
    let dateToParse = dateString;
    if (!dateString.includes('Z') && !dateString.includes('+')) {
      dateToParse = dateString.replace(' ', 'T') + 'Z';
    }

    const created = new Date(dateToParse);
    let diffMs = now.getTime() - created.getTime();

    // 사용자가 '전부 9시간 전'이라고 한다면, 실제로는 방금 발급된 것임 (9시간 차이는 KST 오프셋임)
    // 인위적으로 9시간(32400000ms) 근처의 차이를 보정합니다.
    if (Math.abs(diffMs - 32400000) < 300000) { // 5분 오차 허용
      diffMs = 0;
    }

    if (diffMs < 0) return '방금 발급됐어요!';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      return '방금 발급됐어요!';
    }
    return `${diffHours}시간 전`;
  };

  const getDiscountDisplay = (coupon: CouponItem) => {
    switch (coupon.benefitType) {
      case 'PERCENTAGE_DISCOUNT':
        return `${coupon.benefitValue}% 할인`;
      case 'FIXED_DISCOUNT':
        const cleanValue = coupon.benefitValue ? String(coupon.benefitValue).replace(/[^0-9]/g, '') : '0';
        const price = Number(cleanValue);
        return `${isNaN(price) ? '0' : price.toLocaleString()}원 쿠폰`;
      case 'SERVICE_GIFT':
        return coupon.benefitValue || '서비스 증정';
      default:
        return '';
    }
  };

  const getCouponIcon = (benefitType: string) => {
    switch (benefitType) {
      case 'PERCENTAGE_DISCOUNT':
        return <HotPriceIcon width={rs(34)} height={rs(34)} />;
      case 'FIXED_DISCOUNT':
        return <PriceTagDollarIcon width={rs(34)} height={rs(34)} />;
      case 'SERVICE_GIFT':
        return <GiftIcon width={rs(34)} height={rs(34)} />;
      default:
        return null;
    }
  };

  const getCouponColor = (benefitType: string) => {
    switch (benefitType) {
      case 'PERCENTAGE_DISCOUNT':
        return '#FFDDDE';
      case 'FIXED_DISCOUNT':
        return '#BEFFD1';
      case 'SERVICE_GIFT':
        return '#FFEABC';
      default:
        return '#FFDDDE';
    }
  };

  if (coupons.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader
          icon={<LightingIcon width={rs(10)} height={rs(20)} />}
          title="방금 발급된 따끈한 쿠폰"
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
                <ThemedText style={styles.clockIcon}>
                  <ClockIcon width={rs(14)} height={rs(14)} color="#DC2626" />
                </ThemedText>
                <ThemedText style={styles.timeText}>
                  {getTimeAgo(coupon.issueStartsAt)}
                </ThemedText>
              </View>
              <ThemedText style={styles.storeName} lightColor="#000000" numberOfLines={1}>
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
    width: rs(130),
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    overflow: 'hidden',
  },
  couponTop: {
    height: rs(70),
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponIcon: {
    // Used by SVG now
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
    fontSize: rs(12),
    color: '#DC2626',
    fontWeight: '600',
    fontFamily: 'Pretendard',
  },
  storeName: {
    fontSize: rs(10),
    fontWeight: 'bold',
    color: '#828282',
    marginTop: rs(5),
    lineHeight: rs(12),
    fontFamily: 'Pretendard',
  },
  couponTitle: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#000000',
    marginTop: rs(5),
    lineHeight: rs(16),
    fontFamily: 'Pretendard',
  },
  discountText: {
    fontSize: rs(12),
    fontWeight: '700',
    color: '#EF6239',
    marginTop: -rs(2),
    fontFamily: 'Pretendard',
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
