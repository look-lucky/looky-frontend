import GiftIcon from '@/assets/images/icons/coupon/gift.svg';
import HotPriceIcon from '@/assets/images/icons/coupon/hot-price.svg';
import PriceTagDollarIcon from '@/assets/images/icons/coupon/price-tag-dollar.svg';
import DownloadDoneIcon from '@/assets/images/icons/store/download-done.svg';
import DownloadIcon from '@/assets/images/icons/store/download.svg';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import {
  Fonts,
  Gray,
  Text as TextColor
} from '@/src/shared/theme/theme';
import type { Coupon } from '@/src/shared/types/store';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CouponModalProps {
  visible: boolean;
  onClose: () => void;
  storeName: string;
  coupons: Coupon[];
  onIssueCoupon: (couponId: string) => void;
  isIssuing: boolean;
}

const BENEFIT_ICON_BG: Record<string, string> = {
  PERCENTAGE_DISCOUNT: '#FFDDDE',
  FIXED_DISCOUNT: '#BEFFD1',
  SERVICE_GIFT: '#FFEABC',
};

const COUPON_ICONS: Record<string, any> = {
  PERCENTAGE_DISCOUNT: HotPriceIcon,
  FIXED_DISCOUNT: PriceTagDollarIcon,
  SERVICE_GIFT: GiftIcon,
};

export function CouponModal({
  visible,
  onClose,
  storeName,
  coupons,
  onIssueCoupon,
  isIssuing,
}: CouponModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: insets.bottom || rs(20) }]}>
          {/* BottomSheet Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Banner Box */}
          <View style={styles.bannerContainer}>
            <LinearGradient
              colors={['#33B369', 'rgba(47, 183, 134, 0.80)']}
              style={styles.bannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.bannerTextContent}>
                <ThemedText style={styles.bannerTitle}>
                  {storeName} 쿠폰함
                </ThemedText>
                <ThemedText style={styles.bannerSubtitle}>
                  매장 내 모든 행운을 모았어요{'\n'}얼른 행운을 사용해주세요!
                </ThemedText>
              </View>
              <Image
                source={require('@/assets/images/icons/home/clover-home.png')}
                style={styles.bannerClover}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          {/* Coupon List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {coupons.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText type="caption" lightColor={TextColor.tertiary} darkColor={TextColor.tertiary}>
                  발급 가능한 쿠폰이 없습니다
                </ThemedText>
              </View>
            ) : (
              coupons.map((coupon) => {
                const isIssued = coupon.isDownloaded ?? false;
                const isSoldOut = coupon.remainingCount != null && coupon.remainingCount === 0;
                const iconBg = BENEFIT_ICON_BG[coupon.benefitType ?? ''] ?? '#FFEABC';
                const CouponIcon = COUPON_ICONS[coupon.benefitType ?? ''];

                return (
                  <View key={coupon.id} style={[styles.couponCard, (isIssued || isSoldOut) && styles.couponCardIssued]}>
                    <View style={styles.couponMain}>
                      {/* Left: Icon Background */}
                      <View style={[styles.couponIconBox, { backgroundColor: iconBg }]}>
                        {CouponIcon ? (
                          <CouponIcon width={rs(48)} height={rs(48)} />
                        ) : (
                          <View style={styles.couponIconPlaceholder} />
                        )}
                      </View>

                      {/* Middle: Info */}
                      <View style={styles.couponTextContainer}>
                        <ThemedText style={styles.couponDiscount}>
                          {coupon.discount}
                        </ThemedText>
                        <ThemedText style={styles.couponTitle} numberOfLines={1}>
                          {coupon.title}
                        </ThemedText>
                        <View style={styles.metaContainer}>
                          {coupon.description !== '' && (
                            <ThemedText style={styles.metaText}>{coupon.description}</ThemedText>
                          )}
                          <ThemedText style={styles.metaText}>{coupon.expiryDate}</ThemedText>
                        </View>
                        {coupon.remainingCount != null && (
                          <View style={styles.remainingBadge}>
                            <ThemedText style={styles.remainingText}>
                              {coupon.remainingCount}장 남음
                            </ThemedText>
                          </View>
                        )}
                      </View>

                      {/* Vertical Separator (Custom Dashed) */}
                      <View style={styles.separatorContainer}>
                        {Array.from({ length: 12 }).map((_, i) => (
                          <View key={i} style={styles.dash} />
                        ))}
                      </View>

                      {/* Right: Download Icon Area */}
                      <TouchableOpacity
                        style={styles.downloadArea}
                        onPress={() => onIssueCoupon(coupon.id)}
                        disabled={isIssued || isSoldOut || isIssuing}
                        activeOpacity={0.6}
                      >
                        {isIssued ? (
                          <DownloadDoneIcon width={rs(16)} height={rs(16)} color="#999999" />
                        ) : (
                          <DownloadIcon width={rs(16)} height={rs(16)} color="#999999" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Close Button Area */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <ThemedText style={styles.closeBtnText}>닫기</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Gray.popupBg,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '80%',
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    overflow: 'hidden',
  },
  handleContainer: {
    width: '100%',
    height: rs(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: rs(48),
    height: rs(4),
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    borderRadius: rs(100),
  },
  bannerContainer: {
    paddingHorizontal: rs(20),
    paddingBottom: rs(10),
  },
  bannerGradient: {
    width: '100%',
    height: rs(100),
    borderRadius: rs(12),
    paddingHorizontal: rs(20),
    flexDirection: 'row',
    alignItems: 'center',
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
    // shadow for Android
    elevation: 2,
  },
  bannerTextContent: {
    flex: 1,
    gap: rs(5),
  },
  bannerTitle: {
    fontSize: rs(20),
    fontFamily: Fonts.semiBold,
    color: Gray.white,
    lineHeight: 24,
  },
  bannerSubtitle: {
    fontSize: rs(12),
    fontFamily: Fonts.semiBold,
    color: Gray.white,
    lineHeight: rs(16.8),
  },
  bannerClover: {
    width: rs(94),
    height: rs(94),
    opacity: 0.6,
    position: 'absolute',
    right: 0,
    top: rs(3),
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: rs(20),
    gap: rs(10),
    paddingBottom: rs(16),
  },
  emptyContainer: {
    paddingVertical: rs(40),
    alignItems: 'center',
  },
  couponCard: {
    width: '100%',
    height: rs(100),
    backgroundColor: '#FBFBFB',
    borderRadius: rs(15),
    paddingLeft: rs(15),
    paddingRight: rs(10),
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: rs(3),
    // shadow for Android
    elevation: 2,
    marginBottom: rs(2),
  },
  couponCardIssued: {
    opacity: 0.6,
  },
  couponMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(15),
  },
  couponIconBox: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
    padding: rs(10),
  },
  couponIconPlaceholder: {
    width: rs(45),
    height: rs(45),
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: rs(8),
  },
  couponTextContainer: {
    flex: 1,
    paddingVertical: rs(5),
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: rs(3),
  },
  couponDiscount: {
    fontSize: rs(14),
    fontFamily: Fonts.semiBold,
    color: Gray.black,
    lineHeight: rs(18),
  },
  couponTitle: {
    fontSize: rs(12),
    fontFamily: Fonts.regular,
    color: Gray.black,
    lineHeight: rs(16),
  },
  metaContainer: {
    gap: rs(1),
  },
  metaText: {
    fontSize: rs(10),
    fontFamily: Fonts.regular,
    color: '#757575',
    lineHeight: rs(14),
  },
  remainingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE4E5',
    borderRadius: rs(2),
    paddingHorizontal: rs(5),
    height: rs(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: rs(2),
  },
  remainingText: {
    fontSize: rs(8),
    fontFamily: Fonts.semiBold,
    color: '#F15051',
    lineHeight: rs(9),
  },
  separatorContainer: {
    height: '100%',
    width: rs(1),
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: rs(5),
  },
  dash: {
    width: rs(1),
    height: rs(4),
    backgroundColor: '#C4C4C4',
  },
  downloadArea: {
    width: rs(40),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: rs(8),
  },
  footer: {
    width: '100%',
    paddingHorizontal: rs(24),
    paddingTop: rs(10),
    paddingBottom: rs(10),
  },
  closeBtn: {
    width: '100%',
    height: rs(40),
    backgroundColor: Gray.white,
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: rs(14),
    fontFamily: Fonts.medium,
    color: Gray.black,
    lineHeight: rs(19.6),
  },
});
