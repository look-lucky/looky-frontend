import DownloadIcon from '@/assets/images/icons/store/download.svg';
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
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// Re-export type for convenience
export type { Coupon };

interface StoreBenefitsProps {
  benefits: string[];
  coupons: Coupon[];
  issuedCouponIds?: number[];
  onIssueCoupon?: (couponId: string) => void;
  isIssuing?: boolean;
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

function BenefitBanner({ benefits }: { benefits: string[] }) {
  if (benefits.length === 0) return null;

  return (
    <View style={styles.bannerContainer}>
      <ThemedText style={styles.bannerText} numberOfLines={2}>
        {benefits.join('\n')}
      </ThemedText>
    </View>
  );
}

// ============================================
// CouponSection
// ============================================

function CouponSection({
  coupons,
  issuedCouponIds = [],
  onIssueCoupon,
  isIssuing = false,
}: {
  coupons: Coupon[];
  issuedCouponIds?: number[];
  onIssueCoupon?: (couponId: string) => void;
  isIssuing?: boolean;
}) {
  if (coupons.length === 0) return null;

  return (
    <View style={styles.couponContainer}>
      {coupons.map((coupon) => {
        const isIssued = issuedCouponIds.includes(Number(coupon.id));
        const CouponIcon = COUPON_ICONS[coupon.benefitType ?? ''];
        return (
          <View key={coupon.id} style={[styles.couponCard, isIssued && styles.couponCardIssued]}>
            {/* Left: Icon + Info */}
            <View style={styles.couponMain}>
              <View
                style={[
                  styles.couponIconContainer,
                  { backgroundColor: BENEFIT_ICON_BG[coupon.benefitType ?? ''] ?? CouponColor.yellow },
                ]}
              >
                {CouponIcon ? (
                  <CouponIcon width={rs(40)} height={rs(40)} />
                ) : (
                  <View style={styles.couponIconPlaceholder} />
                )}
              </View>
              <View style={styles.couponTextContainer}>
                <ThemedText style={styles.couponDiscount}>
                  {coupon.discount}
                </ThemedText>
                <ThemedText style={styles.couponTitle} numberOfLines={1}>
                  {coupon.title}
                </ThemedText>
                {coupon.description !== '' && (
                  <ThemedText style={styles.couponMinOrder}>
                    {coupon.description}
                  </ThemedText>
                )}
                <ThemedText style={styles.couponExpiry}>
                  {coupon.expiryDate}
                </ThemedText>
                {coupon.remainingCount != null && (
                  <View style={styles.remainingBadge}>
                    <ThemedText style={styles.remainingText}>
                      {coupon.remainingCount}장 남음
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            {/* Dashed Divider */}
            <View style={styles.dashedDivider} />

            {/* Right: Download Icon */}
            <TouchableOpacity
              style={styles.downloadArea}
              onPress={() => onIssueCoupon?.(coupon.id)}
              disabled={isIssued || isIssuing || !onIssueCoupon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isIssued ? (
                <ThemedText style={styles.issuedText}>발급완료</ThemedText>
              ) : (
                <DownloadIcon width={rs(16)} height={rs(16)} />
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

// ============================================
// StoreBenefits (Combined Export)
// ============================================

export function StoreBenefits({
  benefits,
  coupons,
  issuedCouponIds,
  onIssueCoupon,
  isIssuing,
}: StoreBenefitsProps) {
  return (
    <View style={styles.container}>
      <BenefitBanner benefits={benefits} />
      <CouponSection
        coupons={coupons}
        issuedCouponIds={issuedCouponIds}
        onIssueCoupon={onIssueCoupon}
        isIssuing={isIssuing}
      />
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
    borderRadius: rs(16),
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
  },
  bannerText: {
    fontFamily: Fonts.regular,
    fontSize: rs(12),
    color: TextColor.primary,
    lineHeight: rs(18),
  },

  // CouponSection
  couponContainer: {
    gap: rs(12),
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
  downloadArea: {
    width: rs(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  issuedText: {
    fontFamily: Fonts.medium,
    fontSize: rs(10),
    color: TextColor.tertiary,
  },
});
