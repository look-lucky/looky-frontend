import { ThemedText } from "@/src/shared/common/themed-text";
import { useAuth } from "@/src/shared/lib/auth";
import { rs } from "@/src/shared/theme/scale";
import { Gray } from "@/src/shared/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyPageTab() {
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuth();

  const onLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: handleLogout },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 초록색 배경 Header */}
      <View style={[styles.headerBackground, { paddingTop: insets.top }]}>
        {/* 타이틀 */}
        <Text style={styles.headerTitle}>마이페이지</Text>

        {/* 프로필 카드 - 더 진한 초록색 */}
        <View style={styles.profileCard}>
          {/* 프로필 아이콘 */}
          <View style={styles.profileIconContainer}>
            <Ionicons name="person-circle-outline" size={rs(66)} color="#FFFFFF" />
          </View>

          {/* 프로필 정보 */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>띠로롱 님</Text>
            <Text style={styles.profileSchool}>전북대학교 공과대학</Text>
          </View>

          {/* 수정 버튼 */}
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 마이 쿠폰 카드 */}
        <View style={styles.couponCard}>
          <View style={styles.couponItem}>
            <Text style={[styles.couponNumber, { color: "#009951" }]}>4</Text>
            <Text style={styles.couponLabel}>보유 쿠폰</Text>
          </View>
          <View style={styles.couponDivider} />
          <View style={styles.couponItem}>
            <Text style={[styles.couponNumber, { color: "#EB4335" }]}>2</Text>
            <Text style={styles.couponLabel}>곧 만료</Text>
          </View>
          <View style={styles.couponDivider} />
          <View style={styles.couponItem}>
            <Text style={[styles.couponNumber, { color: "#000000" }]}>12</Text>
            <Text style={styles.couponLabel}>사용 완료</Text>
          </View>
        </View>

        {/* 메뉴 리스트 */}
        <View style={styles.menuCard}>
          {/* 찜한 매장 */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="bookmark-outline" size={rs(20)} color="#828282" />
              <Text style={styles.menuText}>찜한 매장</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuCount}>12</Text>
              <Ionicons name="chevron-forward" size={rs(16)} color="#828282" />
            </View>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* 내가 쓴 리뷰 */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="document-text-outline" size={rs(20)} color="#828282" />
              <Text style={styles.menuText}>내가 쓴 리뷰</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuCount}>19</Text>
              <Ionicons name="chevron-forward" size={rs(16)} color="#828282" />
            </View>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* 알림 설정 */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={rs(20)} color="#828282" />
              <Text style={styles.menuText}>알림 설정</Text>
            </View>
            <Ionicons name="chevron-forward" size={rs(16)} color="#828282" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* 고객센터 */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={rs(20)} color="#828282" />
              <Text style={styles.menuText}>고객센터</Text>
            </View>
            <Ionicons name="chevron-forward" size={rs(16)} color="#828282" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* 설정 */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="settings-outline" size={rs(20)} color="#828282" />
              <Text style={styles.menuText}>설정</Text>
            </View>
            <Ionicons name="chevron-forward" size={rs(16)} color="#828282" />
          </TouchableOpacity>
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={rs(16)} color={Gray.gray9} />
          <ThemedText style={styles.logoutText}>로그아웃</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  headerBackground: {
    backgroundColor: "#8AD97E",
    paddingHorizontal: rs(20),
    paddingBottom: rs(40),
  },
  headerTitle: {
    fontSize: rs(18),
    fontWeight: "600",
    color: "#FFFFFF",
    paddingTop: rs(8),
    paddingBottom: rs(16),
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7ACE6D",
    borderRadius: rs(12),
    paddingVertical: rs(12),
    paddingHorizontal: rs(10),
  },
  profileIconContainer: {
    width: rs(66),
    height: rs(66),
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    paddingLeft: rs(12),
  },
  profileName: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileSchool: {
    fontSize: rs(14),
    color: "#FFFFFF",
    opacity: 0.9,
  },
  editButton: {
    paddingHorizontal: rs(14),
    paddingVertical: rs(6),
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  editButtonText: {
    fontSize: rs(13),
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    top: rs(-20),
  },
  couponCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: rs(12),
    paddingVertical: rs(15),
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: rs(12),
  },
  couponItem: {
    flex: 1,
    alignItems: "center",
  },
  couponNumber: {
    fontSize: rs(28),
    fontWeight: "600",
  },
  couponLabel: {
    fontSize: rs(13),
    color: "#828282",
  },
  couponDivider: {
    width: 1,
    height: rs(40),
    backgroundColor: "#E0E0E0",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: rs(12),
    marginHorizontal: rs(12),
    marginTop: rs(16),
    paddingHorizontal: rs(20),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: rs(16),
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
  },
  menuText: {
    fontSize: rs(15),
    fontWeight: "500",
    color: "#000000",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  menuCount: {
    fontSize: rs(15),
    color: "#828282",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: rs(6),
    paddingVertical: rs(12),
    paddingHorizontal: rs(24),
    borderWidth: 1,
    borderColor: Gray.gray4,
    borderRadius: rs(8),
    marginVertical: rs(28),
  },
  logoutText: {
    fontSize: rs(14),
    color: Gray.gray9,
  },
});
