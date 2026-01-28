import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, } from "react-native";

export default function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require("@/assets/images/shopowner/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* --- 1. 상단 프로필 카드 --- */}
        <View style={styles.profileCard}>
          <View style={styles.iconBox}>
            <Ionicons name="storefront" size={rs(40)} color="#34B262" />
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
                  size={rs(20)}
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
                  size={rs(10)}
                  color="white"
                  style={{ marginRight: rs(4) }}
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
            <Ionicons name="chevron-forward" size={rs(12)} color="#668776" />
          </TouchableOpacity>
        </View>

        {/* --- 4. 성과 통계 --- */}
        <View style={styles.statsContainer}>
          <View style={styles.gridRow}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIconBox}>
                  <Ionicons name="home" size={rs(8)} color="#34B262" />
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
                  <Ionicons name="ticket" size={rs(8)} color="#34B262" />
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
                  <Ionicons name="people" size={rs(8)} color="#34B262" />
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
                    size={rs(8)}
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
              <Ionicons name="lock-closed" size={rs(20)} color="#828282" />
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
                <Ionicons name="notifications" size={rs(16)} color="#668776" />
              </View>
              <Text style={styles.notiTitle}>알림</Text>
            </View>
            <TouchableOpacity
              style={styles.moreLinkRow}
              onPress={() => navigation.navigate("Notification")}
            >
              <Text style={styles.moreLinkText}>전체보기</Text>
              <Ionicons name="chevron-forward" size={rs(12)} color="#668776" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* 알림 1 (리뷰 - 파랑) */}
          <View style={[styles.notiItem, styles.notiItemUnread]}>
            <View style={[styles.notiItemIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="chatbubble-ellipses" size={rs(14)} color="#2563EB" />
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
              <Ionicons name="ticket" size={rs(14)} color="#D97706" />
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
              <Ionicons name="heart" size={rs(14)} color="#FF3E41" />
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
                hitSlop={{ top: rs(10), bottom: rs(10), left: rs(10), right: rs(10) }}
              >
                <Ionicons name="close" size={rs(24)} color="#828282" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight: 0 },
  scrollContent: { paddingTop: rs(10), paddingBottom: rs(40), paddingHorizontal: rs(20) },
  pageTitle: {
    fontSize: rs(24),
    fontWeight: "bold",
    marginBottom: rs(20),
    color: "#333",
  },

  logo: { width: rs(120), height: rs(30), marginBottom: rs(10), marginLeft: 0 },

  // 프로필 카드
  profileCard: {
    width: "100%",
    height: rs(86),
    backgroundColor: "white",
    borderRadius: rs(8),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(12),
    marginBottom: rs(20),
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: rs(2), height: rs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(4),
    elevation: 3,
  },
  iconBox: {
    width: rs(62),
    height: rs(62),
    backgroundColor: "#EAF6EE",
    borderRadius: rs(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: rs(14),
  },
  profileImage: { width: "100%", height: "100%" },
  textContainer: { flex: 1, justifyContent: "center" },
  storeName: {
    fontSize: rs(15),
    fontWeight: "700",
    color: "black",
    lineHeight: rs(24),
  },
  greeting: {
    fontSize: rs(15),
    fontWeight: "500",
    color: "#828282",
    lineHeight: rs(24),
  },

  // 등급 카드
  levelCardShadow: {
    width: "100%",
    minHeight: rs(173),
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: rs(2), height: rs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(4),
    elevation: 3,
    borderRadius: rs(8),
    marginBottom: rs(25),
  },
  levelCard: {
    borderRadius: rs(8),
    overflow: "hidden",
    padding: rs(20),
    position: "relative",
  },
  levelImage: { width: "100%", height: "100%" },
  decoCircleTop: {
    position: "absolute",
    width: rs(98),
    height: rs(98),
    borderRadius: rs(49),
    backgroundColor: "#49AA7F",
    top: rs(-48),
    right: rs(-40),
  },
  decoCircleBottom: {
    position: "absolute",
    width: rs(98),
    height: rs(98),
    borderRadius: rs(49),
    backgroundColor: "#49AA7F",
    bottom: rs(-60),
    left: rs(-49),
  },
  levelHeader: { flexDirection: "row", alignItems: "center", marginBottom: rs(15) },
  // 아이콘 배경 원
  levelIconContainer: {
    width: rs(50),
    height: rs(49),
    backgroundColor: "transparent",
    borderRadius: rs(25),
    marginRight: rs(10),
    justifyContent: "center",
    alignItems: "center",
  },
  levelInfo: { flex: 1 },
  levelLabel: {
    color: "white",
    fontSize: rs(12),
    fontWeight: "500",
    marginBottom: rs(2),
    fontFamily: "System",
  },
  levelValue: {
    color: "white",
    fontSize: rs(17),
    fontWeight: "700",
    fontFamily: "System",
  },
  infoIcon: {
    width: rs(20),
    height: rs(20),
    backgroundColor: "rgba(255,255,255,0.80)",
    borderRadius: rs(10),
    justifyContent: "center",
    alignItems: "center",
  },

  progressContainer: {
    backgroundColor: "#54B77E",
    borderRadius: rs(8),
    paddingVertical: rs(10),
    paddingHorizontal: rs(15),
    marginBottom: rs(15),
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(8),
  },
  progressLabel: {
    color: "rgba(255,255,255,0.80)",
    fontSize: rs(10),
    fontWeight: "500",
  },
  progressValue: { color: "white", fontSize: rs(11), fontWeight: "600" },
  progressBarTrack: {
    width: "100%",
    height: rs(6),
    backgroundColor: "#74BD9F",
    borderRadius: rs(3),
    marginBottom: rs(8),
    overflow: "hidden",
  },
  progressBarFill: {
    width: "80%",
    height: "100%",
    backgroundColor: "#3EAE6B",
    borderRadius: rs(3),
  },
  progressDescRow: { flexDirection: "row", alignItems: "center" },
  progressDescText: { color: "white", fontSize: rs(10) },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255,255,255,0.70)",
    fontSize: rs(9),
    fontWeight: "500",
  },
  footerLink: {
    textDecorationLine: "underline",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: rs(1) },
    textShadowRadius: rs(4),
  },

  // 섹션 헤더
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: rs(10),
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionEmoji: { fontSize: rs(15), marginRight: rs(4) },
  sectionTitleText: {
    fontSize: rs(15),
    fontWeight: "700",
    color: "#668776",
    lineHeight: rs(22),
  },
  moreLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    transform: [{ translateY: rs(3) }],
  },
  moreLinkText: {
    fontSize: rs(11),
    fontWeight: "600",
    color: "#668776",
    lineHeight: rs(22),
    marginRight: rs(2),
  },
  moreLinkArrow: {
    fontSize: rs(10),
    color: "#668776",
    marginLeft: rs(3),
    fontWeight: "bold",
    marginTop: rs(1),
  },

  // 통계 컨테이너
  statsContainer: {
    position: "relative",
    width: "100%",
    gap: rs(11),
    paddingBottom: rs(20),
    marginBottom: rs(25),
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: rs(11),
  },
  statCard: {
    width: "48%",
    height: rs(68),
    backgroundColor: "white",
    borderRadius: rs(8),
    padding: rs(9),
    justifyContent: "center",
  },
  statHeader: { flexDirection: "row", alignItems: "center", marginBottom: rs(2) },
  statIconBox: {
    width: rs(14),
    height: rs(14),
    backgroundColor: "#EAF6EE",
    borderRadius: rs(3),
    marginRight: rs(5),
    justifyContent: "center",
    alignItems: "center",
  },
  statTitle: { fontSize: rs(8), color: "#668776", fontWeight: "400", flex: 1 },
  statNumber: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "black",
    marginBottom: 0,
  },
  statFooter: { flexDirection: "row", alignItems: "center", marginTop: rs(2) },
  statSubText: { fontSize: rs(8), color: "#668776", marginRight: rs(4) },
  trendBadge: { flexDirection: "row", alignItems: "center" },
  trendText: { fontSize: rs(8), color: "#34B262", fontWeight: "600" },
  alertText: { fontSize: rs(8), color: "#34B262", fontWeight: "600" },

  // 잠금 오버레이
  lockedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    zIndex: 10,
    borderRadius: rs(12),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 1)",
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: rs(2), height: rs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(4),
    elevation: 3,
  },
  lockIconCircle: {
    width: rs(41),
    height: rs(41),
    backgroundColor: "rgba(218, 218, 218, 0.59)",
    borderRadius: rs(20.5),
    marginBottom: rs(9),
    justifyContent: "center",
    alignItems: "center",
  },
  lockedTitle: {
    fontSize: rs(15),
    fontWeight: "600",
    color: "black",
    marginBottom: rs(4),
  },
  lockedSubTitle: {
    fontSize: rs(11),
    fontWeight: "500",
    color: "#668776",
    lineHeight: rs(16),
  },

  // 알림 박스
  notiBox: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: rs(8),
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: rs(2), height: rs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(4),
    elevation: 3,
    paddingTop: rs(10),
    paddingBottom: rs(5),
    marginBottom: 0,
  },
  notiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: rs(16),
    paddingBottom: rs(10),
    paddingTop: rs(5),
  },
  notiTitleRow: { flexDirection: "row", alignItems: "center" },
  notiIconBox: {
    width: rs(18),
    height: rs(18),
    marginRight: rs(5),
    justifyContent: "center",
    alignItems: "center",
  },
  notiTitle: { fontSize: rs(15), fontWeight: "700", color: "#668776" },
  divider: {
    height: 1,
    backgroundColor: "rgba(130, 130, 130, 0.15)",
    width: "100%",
  },
  notiItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rs(12),
    paddingHorizontal: rs(16),
    backgroundColor: "white",
  },
  notiItemUnread: { backgroundColor: "rgba(234, 246, 238, 0.50)" },
  notiItemIcon: {
    width: rs(25),
    height: rs(25),
    borderRadius: rs(8),
    justifyContent: "center",
    alignItems: "center",
    marginRight: rs(10),
  },
  notiContent: { flex: 1, justifyContent: "center" },
  notiText: { fontSize: rs(12), color: "black", marginBottom: rs(2), lineHeight: rs(18) },
  notiTime: { fontSize: rs(9), color: "#828282" },
  newBadgeDot: {
    width: rs(6),
    height: rs(6),
    backgroundColor: "#34B262",
    borderRadius: rs(3),
    position: "absolute",
    right: rs(16),
    top: rs(15),
  },

  // 모달(팝업) 관련 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: rs(335),
    maxHeight: "50%",
    backgroundColor: "white",
    borderRadius: rs(10),
    padding: rs(22),
    alignItems: "center",
  },

  // 모달 헤더
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(15),
  },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  headerImage: { width: rs(24), height: rs(24), marginRight: rs(3) },
  headerTitle: { fontSize: rs(17), fontWeight: "700", color: "black" },

  // 모달 리스트
  gradeList: { width: "100%", gap: rs(12) },
  gradeItemBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(217, 217, 217, 0.30)",
    borderRadius: rs(10),
    paddingVertical: rs(10),
    paddingHorizontal: rs(16),
  },
  gradeImage: { width: rs(40), height: rs(40), marginRight: rs(10) },
  gradeTextBox: { flex: 1, flexDirection: "column", justifyContent: "center" },
  gradeItemTitle: {
    fontSize: rs(15),
    fontWeight: "700",
    color: "black",
    marginBottom: rs(4),
  },
  gradeItemDesc: {
    fontSize: rs(11),
    color: "#668776",
    fontWeight: "600",
    lineHeight: rs(16),
  },
});