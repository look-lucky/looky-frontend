import GiftIcon from "@/assets/images/icons/coupon/gift.svg";
import HotPriceIcon from "@/assets/images/icons/coupon/hot-price.svg";
import PriceTagDollarIcon from "@/assets/images/icons/coupon/price-tag-dollar.svg";
import LocationIcon from "@/assets/images/icons/home/location-icon.svg";
import { getGetMyCouponsQueryKey, useActivateCoupon, useGetMyCoupons } from "@/src/api/coupon";
import type { DownloadCouponResponse } from "@/src/api/generated.schemas";
import { logCouponUseStart, logCouponUseComplete } from "@/src/shared/lib/analytics";
import { AppButton } from "@/src/shared/common/app-button";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import {
  Coupon as CouponColor,
  Fonts,
  Gray,
  Owner,
  Primary,
  Text as TextColor,
} from "@/src/shared/theme/theme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CouponFilter = "all" | "FIXED_DISCOUNT" | "PERCENTAGE_DISCOUNT" | "SERVICE_GIFT";
type TabType = "owned" | "expiring" | "used";

const FILTER_BUTTONS: { type: CouponFilter; label: string }[] = [
  { type: "all", label: "전체" },
  { type: "FIXED_DISCOUNT", label: "금액 할인" },
  { type: "PERCENTAGE_DISCOUNT", label: "퍼센트 할인" },
  { type: "SERVICE_GIFT", label: "서비스 증정" },
];

const TABS: { type: TabType; label: string }[] = [
  { type: "owned", label: "보유" },
  { type: "expiring", label: "곧 만료" },
  { type: "used", label: "사용완료" },
];

const ACTIVATION_DURATION_MS = 5 * 60 * 1000; // 5분

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

const normalizeDate = (dateStr?: string) => {
  if (!dateStr) return "";
  let normalized = dateStr;
  if (dateStr && !dateStr.includes("T") && !dateStr.includes("Z") && !dateStr.includes("+")) {
    normalized = dateStr.replace(" ", "T") + "Z";
  }
  return normalized;
};

const formatDate = (dateStr?: string) => {
  const normalized = normalizeDate(dateStr);
  if (!normalized) return "";
  const d = new Date(new Date(normalized).getTime() - 32400000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  return `${y}년 ${m}월 ${day}일 ${h}시까지`;
};

const isExpiringSoon = (expiresAt?: string) => {
  const normalized = normalizeDate(expiresAt);
  if (!normalized) return false;
  const now = new Date();
  const expiry = new Date(new Date(normalized).getTime() - 32400000);
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 3; // 마이페이지와 동일하게 3일로 조정
};

const formatExpiryDateTime = (dateStr?: string) => {
  const normalized = normalizeDate(dateStr);
  if (!normalized) return "";
  const d = new Date(new Date(normalized).getTime() - 32400000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}까지`;
};

const parseAmount = (value?: string) => {
  if (!value) return NaN;
  return Number(value.replace(/,/g, ""));
};

const formatBenefit = (type?: string, value?: string) => {
  switch (type) {
    case "PERCENTAGE_DISCOUNT":
      return `${value}% 할인`;
    case "FIXED_DISCOUNT":
      return `${parseAmount(value).toLocaleString()}원 할인`;
    case "SERVICE_GIFT":
      return "서비스 증정";
    default:
      return value ?? "";
  }
};

const formatDiscount = (benefitType?: string, benefitValue?: string) => {
  switch (benefitType) {
    case "PERCENTAGE_DISCOUNT":
      return benefitValue ? `${benefitValue}%` : "";
    case "FIXED_DISCOUNT": {
      const num = parseAmount(benefitValue);
      return !isNaN(num) && benefitValue ? `${num.toLocaleString()}원` : "";
    }
    case "SERVICE_GIFT":
      return "서비스 증정";
    default:
      return benefitValue ?? "";
  }
};

const getTimeRemaining = (expiresAt?: string) => {
  const normalized = normalizeDate(expiresAt);
  if (!normalized) return "";
  const now = new Date();
  const expiry = new Date(new Date(normalized).getTime() - 32400000);
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs < 0) return "만료됨";

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 1) {
    return `${diffDays}일 남음`;
  }
  if (diffHours >= 1) {
    return `${diffHours}시간 남음`;
  }
  return `${diffMinutes}분 남음`;
};

export default function BenefitsTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { width: screenWidth } = useWindowDimensions();
  const tabWidth = (screenWidth - rs(40)) / TABS.length;
  const [selectedFilter, setSelectedFilter] = useState<CouponFilter>("all");
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [selectedTab, setSelectedTab] = useState<TabType>("owned");

  useEffect(() => {
    if (tab === "owned" || tab === "expiring" || tab === "used") {
      setSelectedTab(tab);
    }
  }, [tab]);
  const [selectedCoupon, setSelectedCoupon] = useState<DownloadCouponResponse | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [activationExpiresAt, setActivationExpiresAt] = useState<string | null>(null);
  const [codeExpired, setCodeExpired] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const queryClient = useQueryClient();
  const { mutate: activateCoupon, isPending: isActivating } = useActivateCoupon();

  // activationExpiresAt 기반 카운트다운 타이머
  useEffect(() => {
    if (!activationExpiresAt || codeExpired) return;
    const interval = setInterval(() => {
      const remaining = new Date(activationExpiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        setCouponCode(null);
        setCodeExpired(true);
        setRemainingSeconds(0);
      } else {
        setRemainingSeconds(Math.ceil(remaining / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activationExpiresAt, codeExpired]);

  const closeModal = () => {
    setSelectedCoupon(null);
    setCouponCode(null);
    setActivationExpiresAt(null);
    setCodeExpired(false);
    setRemainingSeconds(0);
  };

  const handleOpenCoupon = (coupon: DownloadCouponResponse) => {
    setSelectedCoupon(coupon);
    // ACTIVATED 상태면 목록 데이터의 코드/만료시간 바로 사용
    const activationExpiresAt = (coupon as any).activationExpiresAt as string | null;
    if (coupon.status === "ACTIVATED" && coupon.couponCode && activationExpiresAt) {
      const remaining = new Date(activationExpiresAt).getTime() - Date.now();
      if (remaining > 0) {
        setCouponCode(coupon.couponCode);
        setActivationExpiresAt(activationExpiresAt);
        setCodeExpired(false);
        setRemainingSeconds(Math.ceil(remaining / 1000));
        return;
      }
    }
    setCouponCode(null);
    setActivationExpiresAt(null);
    setCodeExpired(false);
    setRemainingSeconds(0);
  };

  const handleUseCoupon = () => {
    if (!selectedCoupon?.studentCouponId) return;
    if (couponCode && !codeExpired) return;
    logCouponUseStart({
      couponId: String(selectedCoupon.studentCouponId),
      storeId: (selectedCoupon as any).storeId,
      storeName: selectedCoupon.storeName ?? '',
    });
    activateCoupon(
      { studentCouponId: selectedCoupon.studentCouponId },
      {
        onSuccess: (res) => {
          const responseData = (res as any)?.data?.data;
          const code = (responseData?.verificationCode ?? responseData?.couponCode) as string | undefined;
          const serverExpiresAt = responseData?.activationExpiresAt as string | undefined;
          if (code) {
            // 서버 만료시간이 있으면 사용, 없으면 5분
            const expiresAt = serverExpiresAt ?? new Date(Date.now() + ACTIVATION_DURATION_MS).toISOString();
            const remaining = new Date(expiresAt).getTime() - Date.now();
            setCouponCode(code);
            setActivationExpiresAt(expiresAt);
            setCodeExpired(remaining <= 0);
            setRemainingSeconds(remaining > 0 ? Math.ceil(remaining / 1000) : 0);
            queryClient.invalidateQueries({ queryKey: getGetMyCouponsQueryKey() });
            logCouponUseComplete({
              couponId: String(selectedCoupon.studentCouponId),
              storeId: (selectedCoupon as any).storeId,
              storeName: selectedCoupon.storeName ?? '',
            });
          }
        },
        onError: (err: any) => {
          const errCode = err?.data?.data?.code;
          if (errCode === "STATE_CONFLICT") {
            // 서버에서 이미 activate → 목록 새로고침해서 코드 가져옴
            queryClient.invalidateQueries({ queryKey: getGetMyCouponsQueryKey() });
          }
        },
      },
    );
  };

  // API 호출
  const { data: myCouponsRes, isLoading } = useGetMyCoupons();
  const rawCoupons = (myCouponsRes as any)?.data?.data;
  const coupons = (Array.isArray(rawCoupons) ? rawCoupons : []) as DownloadCouponResponse[];

  // STATE_CONFLICT 후 invalidate 시 selectedCoupon을 최신 데이터로 동기화
  useEffect(() => {
    if (!selectedCoupon || couponCode) return;
    const updated = coupons.find((c) => c.studentCouponId === selectedCoupon.studentCouponId);
    if (updated?.status === "ACTIVATED" && updated.couponCode) {
      const updatedExpiresAt = (updated as any).activationExpiresAt as string | null;
      const remaining = updatedExpiresAt ? new Date(updatedExpiresAt).getTime() - Date.now() : 0;
      if (remaining > 0) {
        setCouponCode(updated.couponCode);
        setActivationExpiresAt(updatedExpiresAt);
        setCodeExpired(false);
        setRemainingSeconds(Math.ceil(remaining / 1000));
      }
    }
  }, [coupons]);

  // 탭별 필터링
  const tabFilteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter((c) => {
      let isExpired = false;
      if (c.expiresAt) {
        const normalized = normalizeDate(c.expiresAt);
        const expiryTime = new Date(normalized).getTime() - 32400000;
        if (expiryTime <= now.getTime()) {
          isExpired = true;
        }
      }

      switch (selectedTab) {
        case "owned":
          return (c.status === "UNUSED" || c.status === "ACTIVATED") && !isExpired;
        case "expiring":
          // UNUSED 상태이면서 유효기간 체크 로직 통과 시
          return c.status === "UNUSED" && !isExpired && isExpiringSoon(c.expiresAt);
        case "used":
          // 명시적 사용/만료 상태거나, UNUSED지만 시간이 지났을 때
          return (
            c.status === "USED" ||
            c.status === "EXPIRED" ||
            ((c.status === "UNUSED" || c.status === "ACTIVATED") && isExpired)
          );
        default:
          return true;
      }
    });
  }, [coupons, selectedTab]);

  // 혜택 타입별 필터링
  const filteredCoupons = useMemo(() => {
    if (selectedFilter === "all") return tabFilteredCoupons;
    return tabFilteredCoupons.filter((c) => c.benefitType === selectedFilter);
  }, [tabFilteredCoupons, selectedFilter]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Banner */}
      <View style={styles.bannerPadding}>
        <View style={styles.banner}>
          <View style={styles.bannerTextContent}>
            <ThemedText style={styles.bannerTitle}>내 쿠폰함</ThemedText>
            <ThemedText style={styles.bannerSubtitle}>
              {"캠퍼스 앞 행운을 모았어요\n얼른 행운을 사용해주세요!"}
            </ThemedText>
          </View>
          <Image
            source={require("@/assets/images/icons/home/clover-home.png")}
            style={styles.bannerClover}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Category Tabs */}

      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.type}
              style={styles.tabButton}
              onPress={() => setSelectedTab(tab.type)}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  selectedTab === tab.type && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabDivider} />

        {/* Coupon Count
        <View style={styles.couponCountContainer}>
          <ThemedText style={styles.couponCountText}>
            쿠폰 {filteredCoupons.length}개
          </ThemedText>
        </View> */}

        <View
          style={[
            styles.tabIndicator,
            {
              width: tabWidth,
              left: rs(20) + TABS.findIndex((t) => t.type === selectedTab) * tabWidth,
            },
          ]}
        />
      </View>

      {/* Filter Buttons */}
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
                  selectedFilter === btn.type &&
                  styles.filterButtonTextActive,
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
        style={styles.couponListContainer}
        contentContainerStyle={[styles.couponListContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Primary["500"]} />
          </View>
        ) : filteredCoupons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {selectedTab === "owned"
                ? "보유한 쿠폰이 없습니다"
                : selectedTab === "expiring"
                  ? "곧 만료되는 쿠폰이 없습니다"
                  : "사용 완료된 쿠폰이 없습니다"}
            </ThemedText>
          </View>
        ) : (
          filteredCoupons.map((coupon) => {
            const CouponIcon = COUPON_ICONS[coupon.benefitType ?? ""];
            
            // 유효기간 체크 (isUsed 판단용)
            let isExpired = false;
            if (coupon.expiresAt) {
              const normalized = normalizeDate(coupon.expiresAt);
              const expiryTime = new Date(normalized).getTime() - 32400000;
              if (expiryTime <= Date.now()) {
                isExpired = true;
              }
            }
            
            const isUsed = coupon.status === "USED" || coupon.status === "EXPIRED" || isExpired;

            return (
              <TouchableOpacity
                key={coupon.studentCouponId}
                style={[styles.couponCard, isUsed && styles.couponCardUsed]}
                onPress={() => handleOpenCoupon(coupon)}
                activeOpacity={0.8}
                disabled={isUsed}
              >
                <View
                  style={[
                    styles.couponIconContainer,
                    {
                      backgroundColor:
                        BENEFIT_ICON_BG[coupon.benefitType ?? ""] ??
                        CouponColor.yellow,
                    },
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
                    {formatDiscount(coupon.benefitType, coupon.benefitValue)}
                  </ThemedText>
                  <ThemedText style={styles.couponTitle}>
                    {coupon.title ?? `쿠폰 #${coupon.studentCouponId}`}
                  </ThemedText>
                  <ThemedText style={styles.couponMinOrder}>
                    최소 주문 {coupon.minOrderAmount ? `${Number(coupon.minOrderAmount).toLocaleString()}원` : "-"}
                  </ThemedText>
                  <ThemedText style={styles.couponExpireDate}>
                    {formatExpiryDateTime(coupon.expiresAt)}
                  </ThemedText>
                  <View style={styles.couponBottomRow}>
                    <View style={styles.couponStoreNameRow}>
                      <LocationIcon width={rs(12)} height={rs(12)} fill={Gray.white} />
                      <ThemedText style={styles.couponDescription}>
                        {coupon.storeName ?? ""}
                      </ThemedText>
                    </View>
                    {getTimeRemaining(coupon.expiresAt) && !isUsed ? (
                      <View style={styles.couponTimeRemainingBadge}>
                        <ThemedText style={styles.couponTimeRemaining}>
                          {getTimeRemaining(coupon.expiresAt)}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* 사용 완료 오버레이 (텍스트 제거, 더 연하게) */}
                {isUsed && (
                  <View style={styles.usedOverlay} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* 쿠폰 쓰기 모달 */}
      <Modal
        visible={selectedCoupon !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
              <ThemedText style={styles.modalCloseText}>✕</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.modalTitle}>쿠폰 쓰기</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              쿠폰 코드를 사장님께 보여드리고 바로 사용해 보세요!
            </ThemedText>

            <View style={styles.ticketOuter}>
              {/* 상단: 쿠폰 정보 */}
              <View style={styles.ticketTop}>
                <ThemedText style={styles.couponDetailTitle}>
                  {selectedCoupon?.title}
                </ThemedText>
                <View style={styles.couponDetailDivider} />
                <View style={styles.couponDetailRow}>
                  <ThemedText style={styles.couponDetailLabel}>사용처</ThemedText>
                  <ThemedText style={styles.couponDetailValue}>
                    {selectedCoupon?.storeName}
                  </ThemedText>
                </View>
                <View style={styles.couponDetailRow}>
                  <ThemedText style={styles.couponDetailLabel}>혜택</ThemedText>
                  <ThemedText style={styles.couponDetailValue}>
                    {formatBenefit(selectedCoupon?.benefitType, selectedCoupon?.benefitValue)}
                  </ThemedText>
                </View>
                <View style={styles.couponDetailRow}>
                  <ThemedText style={styles.couponDetailLabel}>만료기한</ThemedText>
                  <ThemedText style={styles.couponDetailValue}>
                    {formatExpiryDateTime(selectedCoupon?.expiresAt)}
                  </ThemedText>
                </View>
              </View>

              {/* 점선 분리선 + 양쪽 홈 */}
              <View style={styles.ticketPerforated}>
                <View style={styles.notchLeft} />
                <View style={styles.ticketDashedLine} />
                <View style={styles.notchRight} />
              </View>

              {/* 하단: 버튼 or 코드 */}
              <View style={styles.ticketBottom}>
                {couponCode && !codeExpired ? (
                  <View style={styles.codeSection}>
                    <View style={styles.codeContainer}>
                      {couponCode.split("").map((digit, i) => (
                        <View key={i} style={styles.codeDigitBox}>
                          <ThemedText style={styles.codeDigit}>{digit}</ThemedText>
                        </View>
                      ))}
                    </View>
                    <ThemedText style={styles.codeExpireText}>
                      {`${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")} 후 만료`}
                    </ThemedText>
                  </View>
                ) : (
                  <AppButton
                    label={codeExpired ? "다시 사용하기" : "사용하기"}
                    onPress={handleUseCoupon}
                    disabled={isActivating}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
  },
  bannerPadding: {
    paddingHorizontal: rs(16),
    paddingTop: rs(44),
    paddingBottom: rs(16),
    backgroundColor: Gray.white,
  },
  banner: {
    backgroundColor: Owner.primary,
    borderRadius: rs(16),
    paddingHorizontal: rs(20),
    paddingVertical: rs(20),
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
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
  tabContainer: {
    backgroundColor: Gray.white,
    paddingTop: rs(8),
    paddingBottom: rs(8),
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(20),
  },
  tabButton: {
    flex: 1,
    height: rs(24),
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontFamily: Fonts.regular,
    fontSize: rs(16),
    color: TextColor.placeholder,
  },
  tabTextActive: {
    fontFamily: Fonts.semiBold,
    color: TextColor.primary,
  },
  tabDivider: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: rs(2),
    backgroundColor: Gray.gray2,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: rs(2),
    backgroundColor: Gray.black,
  },
  filterContainer: {
    height: rs(44),
    backgroundColor: Primary["textBg"],
  },
  filterScrollContent: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(8),
    gap: rs(8),
    flexDirection: "row",
  },
  filterButton: {
    borderRadius: rs(20),
    paddingHorizontal: rs(12),
    paddingVertical: rs(4),
    backgroundColor: Gray.white,
    alignItems: "center",
    justifyContent: "center",
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
  couponCountContainer: {
    paddingHorizontal: rs(20),
    height: rs(20),
    justifyContent: "center",
  },
  couponCountText: {
    fontFamily: Fonts.medium,
    fontSize: rs(12),
    color: TextColor.primary,
  },
  couponListContainer: {
    flex: 1,
    backgroundColor: Primary["textBg"],
  },
  couponListContent: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(12),
    gap: rs(12),
  },
  couponCard: {
    backgroundColor: Gray.white,
    borderRadius: rs(16),
    paddingHorizontal: rs(12),
    paddingVertical: rs(16),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(16),
    borderWidth: 1,
    borderColor: Gray.gray3,
  },
  couponCardUsed: {
    opacity: 0.8,
  },
  couponIconContainer: {
    borderRadius: rs(12),
    alignItems: "center",
    justifyContent: "center",
    padding: rs(12),
  },
  couponIconPlaceholder: {
    width: rs(44),
    height: rs(44),
    backgroundColor: "rgba(0,0,0,0.1)",
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
  couponDescription: {
    fontFamily: Fonts.regular,
    fontSize: rs(11),
    lineHeight: rs(16),
    color: Gray.white,
  },
  couponMinOrder: {
    fontFamily: Fonts.regular,
    fontSize: rs(11),
    lineHeight: rs(16),
    color: TextColor.secondary,
  },
  couponExpireDate: {
    fontFamily: Fonts.regular,
    fontSize: rs(11),
    lineHeight: rs(16),
    color: TextColor.secondary,
  },
  couponBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  couponStoreNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(4),
    backgroundColor: Gray.black,
    borderRadius: rs(4),
    paddingHorizontal: rs(6),
    paddingVertical: rs(2),
  },
  couponTimeRemainingBadge: {
    backgroundColor: "#FEE2E2",
    borderRadius: rs(4),
    paddingHorizontal: rs(6),
    paddingVertical: rs(2),
  },
  couponTimeRemaining: {
    fontFamily: Fonts.medium,
    fontSize: rs(11),
    lineHeight: rs(16),
    color: "#DC2626",
  },
  loadingContainer: {
    paddingVertical: rs(40),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: rs(40),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: rs(14),
    color: TextColor.tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Gray.popupBg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rs(20),
  },
  modalContainer: {
    width: "100%",
    backgroundColor: Gray.white,
    borderRadius: rs(16),
    padding: rs(24),
    gap: rs(8),
  },
  modalCloseButton: {
    position: "absolute",
    top: rs(8),
    right: rs(8),
    padding: rs(12),
  },
  modalCloseText: {
    fontSize: rs(18),
    color: TextColor.secondary,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: rs(20),
    color: TextColor.primary,
    textAlign: "center",
  },
  modalSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: rs(13),
    color: TextColor.secondary,
    textAlign: "center",
  },
  ticketOuter: {},
  ticketTop: {
    backgroundColor: Gray.gray1,
    padding: rs(16),
    gap: rs(4),
  },
  ticketPerforated: {
    height: rs(24),
    justifyContent: "center",
    backgroundColor: Gray.gray1,
  },
  notchLeft: {
    position: "absolute",
    left: -rs(12),
    width: rs(24),
    height: rs(24),
    borderRadius: rs(12),
    backgroundColor: Gray.white,
    zIndex: 1,
  },
  notchRight: {
    position: "absolute",
    right: -rs(12),
    width: rs(24),
    height: rs(24),
    borderRadius: rs(12),
    backgroundColor: Gray.white,
    zIndex: 1,
  },
  ticketDashedLine: {
    borderBottomWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Gray.gray9,
  },
  ticketBottom: {
    backgroundColor: Gray.gray1,
    padding: rs(16),
  },
  couponDetailTitle: {
    fontFamily: Fonts.bold,
    fontSize: rs(18),
    color: Primary["500"],
    textAlign: "center",
  },
  couponDetailDivider: {
    height: 1,
    backgroundColor: Gray.gray3,
    marginVertical: rs(2),
  },
  couponDetailRow: {
    flexDirection: "row",
    gap: rs(16),
  },
  couponDetailLabel: {
    fontFamily: Fonts.medium,
    fontSize: rs(12),
    color: TextColor.secondary,
    width: rs(48),
  },
  couponDetailValue: {
    fontFamily: Fonts.regular,
    fontSize: rs(12),
    color: TextColor.primary,
    flex: 1,
  },
  codeSection: {
    gap: rs(8),
    alignItems: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: rs(12),
  },
  codeExpireText: {
    fontFamily: Fonts.medium,
    fontSize: rs(12),
    color: TextColor.secondary,
  },
  codeDigitBox: {
    width: rs(48),
    height: rs(48),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Gray.gray3,
    borderRadius: rs(8),
  },
  codeDigit: {
    fontFamily: Fonts.bold,
    fontSize: rs(24),
    lineHeight: rs(32),
    color: TextColor.primary,
  },
  useButton: {
    marginTop: rs(4),
  },
  usedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: rs(16),
    zIndex: 10,
  },
});
