import GiftIcon from '@/assets/images/icons/coupon/gift.svg';
import HotPriceIcon from '@/assets/images/icons/coupon/hot-price.svg';
import PriceTagDollarIcon from '@/assets/images/icons/coupon/price-tag-dollar.svg';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import {
  Brand,
  Coupon as CouponColor,
  Fonts,
  Gray,
  Text as TextColor,
} from '@/src/shared/theme/theme';
import type { Coupon } from '@/src/shared/types/store';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// Re-export type for convenience
export type { Coupon };

interface StoreBenefitsProps {
  benefits: string[];
  coupons: Coupon[];
  onCouponPress?: () => void;
}

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

// ============================================
// BenefitBanner
// ============================================

const COLLAPSED_LINES = 2;

function BenefitBanner({ benefits }: { benefits: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);

  const rawText = benefits.length > 0
    ? benefits.map(b => b.replace(/ \/ /g, '\n').replace(/\//g, '\n')).join('\n')
    : '제휴를 제공하지 않는 매장입니다.\n사장님의 행운을 기다려주세요.';

  const hasBenefits = benefits.length > 0;

  return (
    <View style={styles.bannerContainer}>
      <ThemedText
        style={styles.bannerText}
        numberOfLines={expanded ? undefined : COLLAPSED_LINES}
        onTextLayout={(e) => {
          if (!needsExpand && e.nativeEvent.lines.length > COLLAPSED_LINES) {
            setNeedsExpand(true);
          }
        }}
        lightColor={TextColor.primary}
        darkColor={TextColor.primary}
      >
        {rawText}
      </ThemedText>
      {hasBenefits && needsExpand && (
        <TouchableOpacity onPress={() => setExpanded(prev => !prev)} style={styles.expandButton}>
          <ThemedText style={styles.expandText} lightColor={TextColor.secondary} darkColor={TextColor.secondary}>
            {expanded ? '접기' : '더보기'}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// CouponSection
// ============================================

function CouponSection({
  coupons,
  onCouponPress,
}: {
  coupons: Coupon[];
  onCouponPress?: () => void;
}) {
  if (coupons.length === 0) return null;

  const coupon = coupons[0];
  const CouponIcon = COUPON_ICONS[coupon.benefitType ?? ''];

  return (
    <View style={styles.couponContainer}>
      <View key={coupon.id} style={styles.couponCard}>
        {/* Left: Icon + Info */}
        <View style={styles.couponMain}>
          <View
            style={[
              styles.couponIconContainer,
              { backgroundColor: BENEFIT_ICON_BG[coupon.benefitType ?? ''] ?? CouponColor.yellow },
            ]}
          >
            {CouponIcon ? (
              <CouponIcon width={rs(48)} height={rs(48)} />
            ) : (
              <View style={styles.couponIconPlaceholder} />
            )}
          </View>
          <View style={styles.couponTextContainer}>
            <ThemedText style={styles.couponDiscount} lightColor={TextColor.primary} darkColor={TextColor.primary}>
              {coupon.discount}
            </ThemedText>
            <ThemedText style={styles.couponTitle} numberOfLines={1} lightColor={TextColor.primary} darkColor={TextColor.primary}>
              {coupon.title}
            </ThemedText>
            {coupon.description !== '' && (
              <ThemedText style={styles.couponMinOrder} lightColor={TextColor.secondary} darkColor={TextColor.secondary}>
                {coupon.description}
              </ThemedText>
            )}
            <ThemedText style={styles.couponExpiry} lightColor={TextColor.secondary} darkColor={TextColor.secondary}>
              {coupon.expiryDate}
            </ThemedText>
            {coupon.remainingCount != null && (
              <View style={styles.remainingBadge}>
                <ThemedText style={styles.remainingText} lightColor={Brand.primary} darkColor={Brand.primary}>
                  {coupon.remainingCount}장 남음
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Dashed Divider */}
        <View style={styles.dashedDivider} />

        {/* Right: 쿠폰 보기 버튼 */}
        <TouchableOpacity
          style={styles.couponViewArea}
          onPress={onCouponPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ThemedText style={styles.couponViewText} lightColor={Brand.primary} darkColor={Brand.primary}>쿠폰{'\n'}보기</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================
// StoreBenefits (Combined Export)
// ============================================

export function StoreBenefits({
  benefits,
  coupons,
  onCouponPress,
}: StoreBenefitsProps) {
  return (
    <View style={styles.container}>
      <BenefitBanner benefits={benefits} />
      {coupons.length > 0 && <View style={styles.thickDivider} />}
      <CouponSection
        coupons={coupons}
        onCouponPress={onCouponPress}
      />
      {coupons.length > 0 && <View style={styles.thickDivider} />}
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    gap: rs(12),
  },

  // BenefitBanner
  bannerContainer: {
    backgroundColor: Gray.gray2,
    borderRadius: rs(8),
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    marginTop: rs(12),
  },
  bannerText: {
    fontFamily: Fonts.regular,
    fontSize: rs(12),
    color: TextColor.primary,
    lineHeight: rs(18),
    textAlign: 'center',
  },
  expandButton: {
    marginTop: rs(4),
    alignItems: 'center',
  },
  expandText: {
    fontFamily: Fonts.regular,
    fontSize: rs(11),
    color: TextColor.secondary,
  },

  // CouponSection
  couponContainer: {
    gap: rs(12),
    marginTop: 0,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Gray.white,
    borderRadius: rs(16),
    paddingVertical: rs(16),
    paddingLeft: rs(12),
    paddingRight: rs(16),
    borderWidth: 1,
    borderColor: Gray.gray3,
  },
  couponCardIssued: {
    opacity: 0.4,
  },
  couponMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  couponIconContainer: {
    borderRadius: rs(16),
    alignItems: 'center',
    justifyContent: 'center',
    padding: rs(14),
  },
  couponIconPlaceholder: {
    width: rs(48),
    height: rs(48),
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
  couponMinOrder: {
    fontFamily: Fonts.regular,
    fontSize: rs(11),
    lineHeight: rs(16),
    color: TextColor.secondary,
  },
  couponExpiry: {
    fontFamily: Fonts.regular,
    fontSize: rs(11),
    lineHeight: rs(16),
    color: TextColor.secondary,
  },
  remainingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: rs(4),
    paddingHorizontal: rs(6),
    paddingVertical: rs(2),
    marginTop: rs(2),
  },
  remainingText: {
    fontFamily: Fonts.medium,
    fontSize: rs(10),
    lineHeight: rs(12),
    color: Brand.primary,
  },
  dashedDivider: {
    width: 0,
    height: rs(60),
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderColor: Gray.gray5,
    marginHorizontal: rs(12),
  },
  couponViewArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(4),
  },
  couponViewText: {
    fontFamily: Fonts.semiBold,
    fontSize: rs(12),
    color: Brand.primary,
    textAlign: 'center',
    lineHeight: rs(18),
  },
  thickDivider: {
    height: rs(10),
    backgroundColor: '#F5F5F5',
    marginHorizontal: -rs(20),
    marginTop: 0,
  },
});
