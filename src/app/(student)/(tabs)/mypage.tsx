import { useGetMyCoupons } from "@/src/api/coupon";
import { CommonResponseListIssueCouponResponse } from "@/src/api/generated.schemas";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useAuth } from "@/src/shared/lib/auth";
import { rs } from "@/src/shared/theme/scale";
import { Fonts, Gray, Owner, Primary, System, Text as TextColor } from "@/src/shared/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MenuItem = ({
  icon,
  text,
  rightText,
  onPress,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  rightText?: string;
  onPress?: () => void;
  isLast?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.menuItemRow, !isLast && styles.menuItemBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <Ionicons name={icon} size={rs(20)} color={TextColor.secondary} />
      <ThemedText style={styles.menuItemText}>{text}</ThemedText>
    </View>
    <View style={styles.menuItemRight}>
      {rightText && (
        <ThemedText style={styles.menuItemCount}>{rightText}</ThemedText>
      )}
      <Ionicons name="chevron-forward" size={rs(16)} color={Gray.gray5} />
    </View>
  </TouchableOpacity>
);

export default function MyPageTab() {
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuth();
  const router = useRouter();

  const { data: myCouponsRes } = useGetMyCoupons({
    query: {
      select: (res) =>
        (res as unknown as { data: CommonResponseListIssueCouponResponse })
          .data,
    },
  });

  const couponCounts = useMemo(() => {
    const coupons = Array.isArray(myCouponsRes?.data) ? myCouponsRes.data : [];
    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000;

    let owned = 0;
    let expiringSoon = 0;
    let used = 0;

    for (const c of coupons) {
      if (c.status === "USED") {
        used++;
      } else if (c.status === "UNUSED" || c.status === "ACTIVATED") {
        owned++;
        if (c.expiresAt) {
          const expiresAt = new Date(c.expiresAt).getTime();
          if (expiresAt - now <= threeDays && expiresAt - now > 0) {
            expiringSoon++;
          }
        }
      }
    }

    return { owned, expiringSoon, used };
  }, [myCouponsRes]);

  const onLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await handleLogout();
          router.replace("/landing");
        },
      },
    ]);
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>마이페이지</ThemedText>
      </View>

      {/* 프로필 카드 */}
      <View style={styles.fixedProfileContainer}>
        <LinearGradient
          colors={[Owner.primary, "#2FB786"]}
          style={styles.profileGradientBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.profileContentRow}>
            <View style={styles.profileIconBox}>
              <Ionicons name="person" size={rs(24)} color={Primary[400]} />
            </View>
            <View style={styles.profileTextColumn}>
              <ThemedText style={styles.profileName}>띠로롱 님</ThemedText>
              <ThemedText style={styles.profileGreeting}>
                전북대학교 공과대학
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <ThemedText style={styles.editButtonText}>수정</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* 메뉴 영역 */}
      <View style={styles.menuScrollArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 쿠폰 카드 */}
          <View style={styles.couponCard}>
            <View style={styles.couponItem}>
              <ThemedText style={[styles.couponNumber, { color: Primary[500] }]}>
                {couponCounts.owned}
              </ThemedText>
              <ThemedText style={styles.couponLabel}>보유 쿠폰</ThemedText>
            </View>
            <View style={styles.couponDivider} />
            <View style={styles.couponItem}>
              <ThemedText style={[styles.couponNumber, { color: System.error }]}>
                {couponCounts.expiringSoon}
              </ThemedText>
              <ThemedText style={styles.couponLabel}>곧 만료</ThemedText>
            </View>
            <View style={styles.couponDivider} />
            <View style={styles.couponItem}>
              <ThemedText style={[styles.couponNumber, { color: TextColor.primary }]}>
                {couponCounts.used}
              </ThemedText>
              <ThemedText style={styles.couponLabel}>사용 완료</ThemedText>
            </View>
          </View>

          {/* 그룹 1: 찜한 매장 / 내가 쓴 리뷰 */}
          <View style={styles.menuGroupBox}>
            <MenuItem
              icon="bookmark-outline"
              text="찜한 매장"
              rightText="12"
              onPress={() => router.push('/mypage/favorite')}
            />
            <MenuItem
              icon="document-text-outline"
              text="내가 쓴 리뷰"
              rightText="19"
              onPress={() => router.push('/mypage/my-review')}
              isLast
            />
          </View>

          {/* 그룹 2: 알림 설정 / 고객센터 / 설정 */}
          <View style={styles.menuGroupBox}>
            <MenuItem icon="notifications-outline" text="알림 설정" />
            <MenuItem icon="chatbubble-ellipses-outline" text="고객센터" onPress={() => router.push("/inquiry")} />
            <MenuItem icon="settings-sharp" text="설정" isLast />
          </View>

          {/* 로그아웃 */}
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={rs(16)} color={Gray.gray9} />
            <ThemedText style={styles.logoutText}>로그아웃</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Gray.white,
  },

  // 헤더
  headerContainer: {
    height: rs(50),
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: rs(20),
    backgroundColor: Gray.white,
  },
  headerTitle: {
    fontSize: rs(18),
    fontWeight: "700",
    color: TextColor.primary,
    fontFamily: Fonts.bold,
  },

  // 프로필 카드
  fixedProfileContainer: {
    paddingHorizontal: rs(20),
    paddingBottom: rs(20),
    backgroundColor: Gray.white,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    elevation: 2,
  },
  profileGradientBox: {
    height: rs(100),
    borderRadius: rs(12),
    justifyContent: "center",
    paddingHorizontal: rs(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileIconBox: {
    width: rs(44),
    height: rs(44),
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  profileTextColumn: {
    flex: 1,
    marginLeft: rs(16),
  },
  profileName: {
    fontSize: rs(18),
    fontWeight: "700",
    color: Gray.white,
    fontFamily: Fonts.bold,
    marginBottom: rs(4),
  },
  profileGreeting: {
    fontSize: rs(12),
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.90)",
    fontFamily: Fonts.medium,
  },
  editButton: {
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(12),
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  editButtonText: {
    fontSize: rs(12),
    fontWeight: "500",
    color: Gray.white,
    fontFamily: Fonts.medium,
  },

  // 메뉴 영역
  menuScrollArea: {
    flex: 1,
    backgroundColor: Primary.textBg,
  },
  scrollContent: {
    paddingTop: rs(20),
    paddingHorizontal: rs(20),
    paddingBottom: rs(50),
    gap: rs(16),
  },

  // 쿠폰 카드
  couponCard: {
    flexDirection: "row",
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    paddingVertical: rs(16),
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  couponItem: {
    flex: 1,
    alignItems: "center",
  },
  couponNumber: {
    fontSize: rs(28),
    fontWeight: "600",
    fontFamily: Fonts.semiBold,
  },
  couponLabel: {
    fontSize: rs(12),
    color: TextColor.tertiary,
    fontFamily: Fonts.regular,
    marginTop: rs(4),
  },
  couponDivider: {
    width: 1,
    height: rs(40),
    backgroundColor: Gray.gray4,
  },

  // 메뉴 그룹
  menuGroupBox: {
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    paddingVertical: rs(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  menuItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: rs(14),
    paddingHorizontal: rs(16),
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Gray.gray2,
    marginHorizontal: rs(16),
    paddingHorizontal: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
  },
  menuItemText: {
    fontSize: rs(14),
    fontWeight: "400",
    color: TextColor.secondary,
    fontFamily: Fonts.regular,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  menuItemCount: {
    fontSize: rs(14),
    color: Gray.gray9,
    fontFamily: Fonts.regular,
  },

  // 로그아웃
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: rs(4),
    gap: rs(4),
  },
  logoutText: {
    fontSize: rs(12),
    fontWeight: "400",
    color: Gray.gray9,
    fontFamily: Fonts.regular,
  },
});
