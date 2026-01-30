import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Gray, System } from '@/src/shared/theme/theme';
import type { Coupon } from '@/src/shared/types/store';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// Re-export type for convenience
export type { Coupon };

interface StoreBenefitsProps {
  benefits: string[];
  coupons: Coupon[];
}

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

function CouponSection({ coupons }: { coupons: Coupon[] }) {
  if (coupons.length === 0) return null;

  return (
    <View style={styles.couponContainer}>
      {coupons.map((coupon) => (
        <View key={coupon.id} style={styles.couponCard}>
          <View style={styles.couponLeft}>
            <View style={styles.discountBadge}>
              <ThemedText style={styles.percentIcon}>%</ThemedText>
            </View>
          </View>
          <View style={styles.couponContent}>
            <View style={styles.couponHeader}>
              <ThemedText type="defaultSemiBold">{coupon.title}</ThemedText>
              <ThemedText type='defaultSemiBold' lightColor={System.hotSoldOut}>{coupon.discount}</ThemedText>
            </View>
            <ThemedText style={styles.couponDescription}>{coupon.description}</ThemedText>
            <View style={styles.couponFooter}>
              <ThemedText style={styles.couponExpiry}>{coupon.expiryDate}</ThemedText>
              <TouchableOpacity style={styles.couponButton}>
                <ThemedText type="default" lightColor={Gray.white}>쿠폰 받기</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================
// StoreBenefits (Combined Export)
// ============================================

export function StoreBenefits({ benefits, coupons }: StoreBenefitsProps) {
  return (
    <View style={styles.container}>
      <BenefitBanner benefits={benefits} />
      <CouponSection coupons={coupons} />
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
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
  },
  bannerText: {
    fontSize: rs(12),
    color: '#000000',
    lineHeight: rs(18),
  },

  // CouponSection
  couponContainer: {
    gap: rs(12),
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: rs(12),
    gap: rs(12),
  },
  couponLeft: {
    width: rs(40),
    height: rs(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    width: rs(40),
    height: rs(40),
    borderRadius: 16,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentIcon: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#ff9800',
  },
  couponContent: {
    flex: 1,
    gap: rs(2),
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponTitle: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#1d1b20',
  },
  couponDescription: {
    fontSize: rs(12),
    color: '#666',
  },
  couponFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: rs(4),
  },
  couponExpiry: {
    fontSize: rs(10),
    color: '#999',
  },
  couponButton: {
    backgroundColor: '#34b262',
    borderRadius: 16,
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
  }
});
