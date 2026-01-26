import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require("@/assets/images/shopowner/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* --- 1. 상단 프로필 카드 --- */}
        <View style={styles.profileCard}>
          <View style={styles.iconBox}>
            <Ionicons name="storefront" size={40} color="#34B262" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.storeName}>채영식당</Text>
            <Text style={styles.greeting}>이채영 사장님! 반가워요!</Text>
          </View>
        </View>

        {/* --- 2. 등급 현황 카드 --- */}
        <View style={styles.levelCardShadow}>
          <LinearGradient
            colors={["#36AB66", "#349D73"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.levelCard}
          >
            <View style={styles.decoCircleTop} />
            <View style={styles.decoCircleBottom} />

            <View style={styles.levelHeader}>
              <View style={styles.levelIconContainer}>
                <Image
                  source={require("@/assets/images/shopowner/3clover.png")}
                  style={styles.levelImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.levelInfo}>
                <Text style={styles.levelLabel}>현재 등급</Text>
                <Text style={styles.levelValue}>세잎클로버</Text>
              </View>

              {/* 정보 아이콘 (팝업 열기) */}
              <TouchableOpacity
                style={styles.infoIcon}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#668776"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressLabel}>다음 등급까지</Text>
                <Text style={styles.progressValue}>40 / 50</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={styles.progressBarFill} />
              </View>
              <View style={styles.progressDescRow}>
                {/* 작은 클로버 아이콘(나중에 바꿔야함) */}
                <Ionicons
                  name="leaf"
                  size={10}
                  color="white"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.progressDescText}>
                  <Text style={{ fontWeight: "700" }}>네잎클로버</Text>까지
                  좋아요 <Text style={{ fontWeight: "700" }}>10개</Text>{" "}
                  남았어요!
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>다음 혜택: 네잎 전용 기능</Text>
              <Text style={[styles.footerText, styles.footerLink]}>
                전체 혜택 보기
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* --- 3. 섹션 헤더 --- */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>📊</Text>
            <Text style={styles.sectionTitleText}>오늘의 성과</Text>
          </View>
          <TouchableOpacity style={styles.moreLinkRow}>
            <Text style={styles.moreLinkText}>자세히 보러가기</Text>
            <Ionicons name="chevron-forward" size={12} color="#668776" />
          </TouchableOpacity>
        </View>

        {/* --- 4. 성과 통계 --- */}
        <View style={styles.statsContainer}>
          <View style={styles.gridRow}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIconBox}>
                  <Ionicons name="home" size={8} color="#34B262" />
                </View>
                <Text style={styles.statTitle}>오늘 가게 페이지</Text>
              </View>
              <Text style={styles.statNumber}>127</Text>
              <View style={styles.statFooter}>
                <Text style={styles.statSubText}>명이 조회했어요</Text>
                <View style={styles.trendBadge}>
                  <Text style={styles.trendText}>▲ 12%</Text>
                </View>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIconBox}>
                  <Ionicons name="ticket" size={8} color="#34B262" />
                </View>
                <Text style={styles.statTitle}>사용된 쿠폰</Text>
              </View>
              <Text style={styles.statNumber}>8</Text>
              <View style={styles.statFooter}>
                <Text style={styles.statSubText}>장 사용되었어요</Text>
                <View style={styles.trendBadge}>
                  <Text style={styles.trendText}>▲ 8%</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIconBox}>
                  <Ionicons name="people" size={8} color="#34B262" />
                </View>
                <Text style={styles.statTitle}>이번 주 방문</Text>
              </View>
              <Text style={styles.statNumber}>1,234</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIconBox}>
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={8}
                    color="#34B262"
                  />
                </View>
                <Text style={styles.statTitle}>새 리뷰</Text>
                <Text style={styles.alertText}>미답변 2</Text>
              </View>
              <Text style={styles.statNumber}>15</Text>
            </View>
          </View>

          {/* 잠금 화면 */}
          <View style={styles.lockedOverlay}>
            <View style={styles.lockIconCircle}>
              <Ionicons name="lock-closed" size={20} color="#828282" />
            </View>
            <Text style={styles.lockedTitle}>추후 공개될 예정이에요</Text>
            <Text style={styles.lockedSubTitle}>조금만 기다려주세요!</Text>
            <Text style={styles.lockedSubTitle}>
              사장님의 더 나은 편의를 위해 노력할게요!
            </Text>
          </View>
        </View>

        {/* --- 5. 알림 박스 --- */}
        <View style={styles.notiBox}>
          <View style={styles.notiHeader}>
            <View style={styles.notiTitleRow}>
              {/* 알림 아이콘 */}
              <View style={styles.notiIconBox}>
                <Ionicons name="notifications" size={16} color="#668776" />
              </View>
              <Text style={styles.notiTitle}>알림</Text>
            </View>
            <TouchableOpacity
              style={styles.moreLinkRow}
              onPress={() => navigation.navigate("Notification")}
            >
              <Text style={styles.moreLinkText}>전체보기</Text>
              <Ionicons name="chevron-forward" size={12} color="#668776" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* 알림 1 (리뷰 - 파랑) */}
          <View style={[styles.notiItem, styles.notiItemUnread]}>
            <View style={[styles.notiItemIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="chatbubble-ellipses" size={14} color="#2563EB" />
            </View>
            <View style={styles.notiContent}>
              <Text style={styles.notiText} numberOfLines={1}>
                새로운 리뷰가 달렸습니다: ‘분위기가 너무 좋아요!’
              </Text>
              <Text style={styles.notiTime}>10분 전</Text>
            </View>
            <View style={styles.newBadgeDot} />
          </View>

          <View style={styles.divider} />

          {/* 알림 2 (쿠폰 - 노랑) */}
          <View style={[styles.notiItem, styles.notiItemUnread]}>
            <View style={[styles.notiItemIcon, { backgroundColor: "#FEF4C7" }]}>
              <Ionicons name="ticket" size={14} color="#D97706" />
            </View>
            <View style={styles.notiContent}>
              <Text style={styles.notiText} numberOfLines={1}>
                10% 할인 쿠폰이 모두 소진되었습니다.
              </Text>
              <Text style={styles.notiTime}>1시간 전</Text>
            </View>
            <View style={styles.newBadgeDot} />
          </View>

          <View style={styles.divider} />

          {/* 알림 3 (좋아요 - 빨강) */}
          <View style={styles.notiItem}>
            <View style={[styles.notiItemIcon, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="heart" size={14} color="#FF3E41" />
            </View>
            <View style={styles.notiContent}>
              <Text style={styles.notiText} numberOfLines={1}>
                네잎클로버까지 좋아요 10개 남았어요!
              </Text>
              <Text style={styles.notiTime}>3시간 전</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 등급 안내 모달 (팝업창) 시작        */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {/* 모달 컨텐츠 박스 */}
          <View style={styles.modalContent}>
            {/* 1. 헤더 (아이콘 + 타이틀 + 닫기) */}
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleRow}>
                <Image
                  source={require("@/assets/images/shopowner/leaf.png")}
                  style={styles.headerImage}
                  resizeMode="contain"
                />
                <Text style={styles.headerTitle}>클로버 등급 시스템</Text>
              </View>
              {/* 닫기 버튼 */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#828282" />
              </TouchableOpacity>
            </View>

            {/* 2. 등급 리스트 */}
            <View style={styles.gradeList}>
              {/* (1) 씨앗 */}
              <View style={styles.gradeItemBox}>
                <Image
                  source={require("@/assets/images/shopowner/1clover.png")}
                  style={styles.gradeImage}
                  resizeMode="contain"
                />
                <View style={styles.gradeTextBox}>
                  <Text style={styles.gradeItemTitle}>씨앗</Text>
                  <Text style={styles.gradeItemDesc}>
                    아직 니어딜에 정식 등록되지 않은 상태예요.
                  </Text>
                  <Text style={styles.gradeItemDesc}>(입점 신청 필요)</Text>
                </View>
              </View>

              {/* (2) 새싹 */}
              <View style={styles.gradeItemBox}>
                <Image
                  source={require("@/assets/images/shopowner/2clover.png")}
                  style={styles.gradeImage}
                  resizeMode="contain"
                />
                <View style={styles.gradeTextBox}>
                  <Text style={styles.gradeItemTitle}>새싹</Text>
                  <Text style={styles.gradeItemDesc}>
                    니어딜의 파트너가 되셨군요! 환영합니다.
                  </Text>
                </View>
              </View>

              {/* (3) 세잎 */}
              <View style={styles.gradeItemBox}>
                <Image
                  source={require("@/assets/images/shopowner/3clover.png")}
                  style={styles.gradeImage}
                  resizeMode="contain"
                />
                <View style={styles.gradeTextBox}>
                  <Text style={styles.gradeItemTitle}>세잎</Text>
                  <Text style={styles.gradeItemDesc}>
                    가게 정보를 모두 등록하여 손님 맞을 준비 완료!
                  </Text>
                  <Text style={styles.gradeItemDesc}>
                    학생들을 위해 행운을 나눠주세요!
                  </Text>
                </View>
              </View>

              {/* (4) 네잎 */}
              <View style={styles.gradeItemBox}>
                <Image
                  source={require("@/assets/images/shopowner/4clover.png")}
                  style={styles.gradeImage}
                  resizeMode="contain"
                />
                <View style={styles.gradeTextBox}>
                  <Text style={styles.gradeItemTitle}>네잎</Text>
                  <Text style={styles.gradeItemDesc}>
                    곧 업데이트 될 예정이에요
                  </Text>
                  <Text style={styles.gradeItemDesc}>잠시만 기다려주세요!</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* 등급 안내 모달 (팝업창) 끝 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  scrollContent: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },

  logo: { width: 120, height: 30, marginBottom: 10, marginLeft: 0 },

  // 프로필 카드
  profileCard: {
    width: "100%",
    height: 86,
    backgroundColor: "white",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconBox: {
    width: 62,
    height: 62,
    backgroundColor: "#EAF6EE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  profileImage: { width: "100%", height: "100%" },
  textContainer: { flex: 1, justifyContent: "center" },
  storeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "black",
    lineHeight: 24,
  },
  greeting: {
    fontSize: 15,
    fontWeight: "500",
    color: "#828282",
    lineHeight: 24,
  },

  // 등급 카드
  levelCardShadow: {
    width: "100%",
    minHeight: 173,
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 8,
    marginBottom: 25,
  },
  levelCard: {
    borderRadius: 8,
    overflow: "hidden",
    padding: 20,
    position: "relative",
  },
  levelImage: { width: "100%", height: "100%" },
  decoCircleTop: {
    position: "absolute",
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: "#49AA7F",
    top: -48,
    right: -40,
  },
  decoCircleBottom: {
    position: "absolute",
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: "#49AA7F",
    bottom: -60,
    left: -49,
  },
  levelHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  // 아이콘 배경 원
  levelIconContainer: {
    width: 50,
    height: 49,
    backgroundColor: "transparent",
    borderRadius: 25,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  levelInfo: { flex: 1 },
  levelLabel: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
    fontFamily: "System",
  },
  levelValue: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "System",
  },
  infoIcon: {
    width: 20,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.80)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  progressContainer: {
    backgroundColor: "#54B77E",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 10,
    fontWeight: "500",
  },
  progressValue: { color: "white", fontSize: 11, fontWeight: "600" },
  progressBarTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "#74BD9F",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "80%",
    height: "100%",
    backgroundColor: "#3EAE6B",
    borderRadius: 3,
  },
  progressDescRow: { flexDirection: "row", alignItems: "center" },
  progressDescText: { color: "white", fontSize: 10 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 9,
    fontWeight: "500",
  },
  footerLink: {
    textDecorationLine: "underline",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // 섹션 헤더
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionEmoji: { fontSize: 15, marginRight: 4 },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#668776",
    lineHeight: 22,
  },
  moreLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    transform: [{ translateY: 3 }],
  },
  moreLinkText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#668776",
    lineHeight: 22,
    marginRight: 2,
  },
  moreLinkArrow: {
    fontSize: 10,
    color: "#668776",
    marginLeft: 3,
    fontWeight: "bold",
    marginTop: 1,
  },

  // 통계 컨테이너
  statsContainer: {
    position: "relative",
    width: "100%",
    gap: 11,
    paddingBottom: 20,
    marginBottom: 25,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 11,
  },
  statCard: {
    width: "48%",
    height: 68,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 9,
    justifyContent: "center",
  },
  statHeader: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  statIconBox: {
    width: 14,
    height: 14,
    backgroundColor: "#EAF6EE",
    borderRadius: 3,
    marginRight: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  statTitle: { fontSize: 8, color: "#668776", fontWeight: "400", flex: 1 },
  statNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
    marginBottom: 0,
  },
  statFooter: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  statSubText: { fontSize: 8, color: "#668776", marginRight: 4 },
  trendBadge: { flexDirection: "row", alignItems: "center" },
  trendText: { fontSize: 8, color: "#34B262", fontWeight: "600" },
  alertText: { fontSize: 8, color: "#34B262", fontWeight: "600" },

  // 잠금 오버레이
  lockedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    zIndex: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 1)",
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockIconCircle: {
    width: 41,
    height: 41,
    backgroundColor: "rgba(218, 218, 218, 0.59)",
    borderRadius: 20.5,
    marginBottom: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "black",
    marginBottom: 4,
  },
  lockedSubTitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#668776",
    lineHeight: 16,
  },

  // 알림 박스
  notiBox: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    paddingTop: 10,
    paddingBottom: 5,
    marginBottom: 0,
  },
  notiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 5,
  },
  notiTitleRow: { flexDirection: "row", alignItems: "center" },
  notiIconBox: {
    width: 18,
    height: 18,
    marginRight: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  notiTitle: { fontSize: 15, fontWeight: "700", color: "#668776" },
  divider: {
    height: 1,
    backgroundColor: "rgba(130, 130, 130, 0.15)",
    width: "100%",
  },
  notiItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  notiItemUnread: { backgroundColor: "rgba(234, 246, 238, 0.50)" },
  notiItemIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  notiContent: { flex: 1, justifyContent: "center" },
  notiText: { fontSize: 12, color: "black", marginBottom: 2, lineHeight: 18 },
  notiTime: { fontSize: 9, color: "#828282" },
  newBadgeDot: {
    width: 6,
    height: 6,
    backgroundColor: "#34B262",
    borderRadius: 3,
    position: "absolute",
    right: 16,
    top: 15,
  },

  // 모달(팝업) 관련 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 335,
    maxHeight: "50%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 22,
    alignItems: "center",
  },

  // 모달 헤더
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  headerImage: { width: 24, height: 24, marginRight: 3 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "black" },

  // 모달 리스트
  gradeList: { width: "100%", gap: 12 },
  gradeItemBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(217, 217, 217, 0.30)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  gradeImage: { width: 40, height: 40, marginRight: 10 },
  gradeTextBox: { flex: 1, flexDirection: "column", justifyContent: "center" },
  gradeItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "black",
    marginBottom: 4,
  },
  gradeItemDesc: {
    fontSize: 11,
    color: "#668776",
    fontWeight: "600",
    lineHeight: 16,
  },
});
