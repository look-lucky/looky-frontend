import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Platform, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// [API] 내 가게 조회 & 상점 통계 조회 임포트
import { getMyStores, getStoreStats } from '@/src/api/store';

export default function HomeScreen({ navigation }) {
  // [상태 관리]
  const [modalVisible, setModalVisible] = useState(false); // 등급 안내 모달
  const [isLoading, setIsLoading] = useState(true);        // 로딩 상태
  const [refreshing, setRefreshing] = useState(false);     // 당겨서 새로고침

  // 화면 데이터 상태
  const [homeData, setHomeData] = useState({
    storeId: null,
    storeName: "등록된 가게 없음",
    ownerName: "사장님",
    stats: {
      regulars: 0,
      issuedCoupons: 0,
      newReviews: 0,    // '총 리뷰'로 사용
      usedCoupons: 0,
    }
  });

  // 서버 데이터 가져오기
  const fetchData = async () => {
    try {
      // 1. 내 가게 목록 조회
      const myStoresResponse = await getMyStores();

      const rawStoreData = myStoresResponse?.data;
      const myStores = Array.isArray(rawStoreData) ? rawStoreData : rawStoreData?.data || [];

      if (!myStores || myStores.length === 0) {
        setHomeData(prev => ({ ...prev, storeName: "가게를 등록해주세요" }));
        setIsLoading(false);
        return;
      }

      const currentStore = myStores[0];
      const storeId = currentStore?.id;

      if (!storeId) {
        console.error("가게 ID를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      // 2. 상점 통계 조회 API 호출
      console.log(`[API] 통계 조회 시작: storeId=${storeId}`);
      const statsResponse = await getStoreStats(storeId);

      // 통계 데이터 언랩핑
      const statsData = statsResponse?.data?.data || statsResponse?.data || {};

      console.log("📊 [통계 데이터 수신]:", statsData);

      setHomeData({
        storeId: storeId,
        storeName: currentStore.name,
        ownerName: currentStore.ownerName || "사장님",
        stats: {
          // [수정 완료] 로그 기반으로 키값 매핑
          regulars: statsData.totalRegulars || 0,
          issuedCoupons: statsData.totalIssuedCoupons || 0,
          newReviews: statsData.totalReviews || 0,
          usedCoupons: statsData.totalUsedCoupons || 0,
        }
      });

    } catch (error) {
      console.error("홈 데이터 로딩 실패:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#34B262" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 로고 */}
        <Image
          source={require("@/assets/images/shopowner/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* --- 1. 상단 프로필 카드 --- */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8}>
          <View style={styles.iconBox}>
            <Ionicons name="storefront-outline" size={rs(32)} color="#34B262" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.storeName}>{homeData.storeName}</Text>
            <Text style={styles.greeting}>{homeData.ownerName} 사장님, 반가워요!</Text>
          </View>
          <Ionicons name="chevron-down" size={rs(20)} color="#828282" />
        </TouchableOpacity>

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

              <TouchableOpacity
                style={styles.infoIcon}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={rs(18)}
                  color="#628473"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <Ionicons name="sparkles" size={rs(12)} color="#A5F3C3" style={{ marginRight: 4 }} />
                <Text style={styles.progressLabel}>훌륭해요! 행운이 가득한 매장이군요</Text>
              </View>
              <Text style={[styles.progressLabel2, { marginTop: rs(2) }]}>학생들에게 행운을 나눠주세요!</Text>
            </View>
          </LinearGradient>
        </View>

        {/* --- 3. 성과 섹션 헤더 --- */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>📊</Text>
            <Text style={styles.sectionTitleText}>{homeData.storeName}의 성과</Text>
          </View>
        </View>

        {/* --- 4. 성과 통계 그리드 --- */}
        <View style={styles.statsContainer}>
          <View style={styles.gridRow}>

            {/* 카드 1: 단골 손님 (찜) */}
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Coupon', { initialTab: 'patron' })}
            >
              <View style={styles.statIconBox}>
                <Ionicons name="people" size={rs(18)} color="#34B262" />
              </View>
              <View style={styles.statInfoBox}>
                <Text style={styles.statTitle}>단골 손님</Text>
                <Text style={styles.statNumber}>{homeData.stats.regulars}</Text>
                <Text style={styles.statSubText}>명이 찜했어요</Text>
              </View>
            </TouchableOpacity>

            {/* 카드 2: 발행한 쿠폰 */}
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Coupon', { initialTab: 'coupon' })}
            >
              <View style={styles.statIconBox}>
                <Ionicons name="ticket" size={rs(18)} color="#34B262" />
              </View>
              <View style={styles.statInfoBox}>
                <Text style={styles.statTitle}>발행한 쿠폰</Text>
                <Text style={styles.statNumber}>{homeData.stats.issuedCoupons}</Text>
                <Text style={styles.statSubText}>장을 발행했어요</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>

            {/* 카드 3: 총 리뷰 */}
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Review')}
            >
              <View style={styles.statIconBox}>
                <Ionicons name="chatbox-ellipses" size={rs(18)} color="#34B262" />
              </View>
              <View style={styles.statInfoBox}>
                <Text style={styles.statTitle}>총 리뷰</Text>
                <Text style={styles.statNumber}>{homeData.stats.newReviews}</Text>
                <Text style={styles.statSubText}>명이 남겼어요</Text>
              </View>
            </TouchableOpacity>

            {/* 카드 4: 사용된 쿠폰 */}
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Coupon', { initialTab: 'coupon' })}
            >
              <View style={styles.statIconBox}>
                <Ionicons name="qr-code" size={rs(18)} color="#34B262" />
              </View>
              <View style={styles.statInfoBox}>
                <Text style={styles.statTitle}>사용된 쿠폰</Text>
                <Text style={styles.statNumber}>{homeData.stats.usedCoupons}</Text>
                <Text style={styles.statSubText}>장 사용되었어요</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- 5. 쿠폰 사용완료 처리 버튼 --- */}
        <TouchableOpacity style={styles.couponProcessBtn} activeOpacity={0.8}>
          <Ionicons name="scan-circle-outline" size={rs(20)} color="#34B262" style={{ marginRight: rs(8) }} />
          <Text style={styles.couponProcessText}>쿠폰 사용완료 처리</Text>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={{ height: rs(50) }} />

      </ScrollView>

      {/* --- [모달] 등급 안내 팝업 --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleRow}>
                <Image
                  source={require("@/assets/images/shopowner/leaf.png")}
                  style={styles.headerImage}
                  resizeMode="contain"
                />
                <Text style={styles.headerTitle}>클로버 등급 시스템</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: rs(10), bottom: rs(10), left: rs(10), right: rs(10) }}
              >
                <Ionicons name="close" size={rs(24)} color="#828282" />
              </TouchableOpacity>
            </View>

            {/* 등급 리스트 */}
            <View style={styles.gradeList}>
              <View style={styles.gradeItemBox}>
                <Image
                  source={require("@/assets/images/shopowner/1clover.png")}
                  style={styles.gradeImage}
                  resizeMode="contain"
                />
                <View style={styles.gradeTextBox}>
                  <Text style={styles.gradeItemTitle}>씨앗</Text>
                  <Text style={styles.gradeItemDesc}>아직 니어딜에 정식 등록되지 않은 상태예요.</Text>
                </View>
              </View>
              <View style={styles.gradeItemBox}>
                <Image
                  source={require("@/assets/images/shopowner/2clover.png")}
                  style={styles.gradeImage}
                  resizeMode="contain"
                />
                <View style={styles.gradeTextBox}>
                  <Text style={styles.gradeItemTitle}>새싹</Text>
                  <Text style={styles.gradeItemDesc}>니어딜의 파트너가 되셨군요! 환영합니다.</Text>
                </View>
              </View>
              <View style={styles.gradeItemBox}>
                <Image
                  source={require("@/assets/images/shopowner/3clover.png")}
                  style={styles.gradeImage}
                  resizeMode="contain"
                />
                <View style={styles.gradeTextBox}>
                  <Text style={styles.gradeItemTitle}>세잎</Text>
                  <Text style={styles.gradeItemDesc}>가게 정보를 모두 등록하여 손님 맞을 준비 완료!</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  scrollContent: { paddingTop: rs(10), paddingBottom: rs(40), paddingHorizontal: rs(20) },
  logo: { width: rs(120), height: rs(30), marginBottom: rs(10), marginLeft: 0 },

  // 프로필 카드 스타일
  profileCard: {
    width: "100%", height: rs(80), backgroundColor: "white", borderRadius: rs(12),
    flexDirection: "row", alignItems: "center", paddingHorizontal: rs(16), marginBottom: rs(20),
    shadowColor: "rgba(0,0,0,0.05)", shadowOffset: { width: 0, height: rs(2) }, shadowOpacity: 1, shadowRadius: rs(8), elevation: 4,
  },
  iconBox: {
    width: rs(50), height: rs(50), backgroundColor: "#EAF6EE", borderWidth: 1, borderColor: "#EAF6EE",
    borderRadius: rs(12), justifyContent: "center", alignItems: "center", marginRight: rs(14),
  },
  textContainer: { flex: 1, justifyContent: "center" },
  storeName: { fontSize: rs(16), fontWeight: "700", color: "black", marginBottom: rs(5) },
  greeting: { fontSize: rs(13), fontWeight: "400", color: "#828282" },

  // 등급 카드 스타일
  levelCardShadow: {
    width: "100%", minHeight: rs(150), shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: rs(2), height: rs(2) }, shadowOpacity: 1, shadowRadius: rs(4), elevation: 3,
    borderRadius: rs(12), marginBottom: rs(25),
  },
  levelCard: { borderRadius: rs(12), overflow: "hidden", padding: rs(20), position: "relative", minHeight: rs(150), justifyContent: 'space-between' },
  decoCircleTop: { position: "absolute", width: rs(120), height: rs(120), borderRadius: rs(60), backgroundColor: "rgba(255,255,255,0.1)", top: rs(-40), right: rs(-30) },
  decoCircleBottom: { position: "absolute", width: rs(100), height: rs(100), borderRadius: rs(50), backgroundColor: "rgba(255,255,255,0.05)", bottom: rs(-40), left: rs(-20) },
  levelHeader: { flexDirection: "row", alignItems: "center", marginBottom: rs(10) },
  levelIconContainer: { width: rs(50), height: rs(50), marginRight: rs(10), justifyContent: "center", alignItems: "center" },
  levelImage: { width: "100%", height: "100%" },
  levelInfo: { flex: 1 },
  levelLabel: { color: "rgba(255,255,255,0.8)", fontSize: rs(11), fontWeight: "500", marginBottom: rs(2) },
  levelValue: { color: "white", fontSize: rs(20), fontWeight: "700" },
  infoIcon: { padding: rs(5), backgroundColor: "#FFFFFFCC", borderRadius: rs(20) },
  progressContainer: { backgroundColor: "#54B77E", borderRadius: rs(8), paddingVertical: rs(12), paddingHorizontal: rs(15) },
  progressTextRow: { flexDirection: "row", alignItems: "center", marginBottom: rs(2) },
  progressLabel: { color: "white", fontSize: rs(12), fontWeight: "500" },
  progressLabel2: { color: "#FFFFFFCC", fontSize: rs(12), fontWeight: "500" },

  // 섹션 헤더 스타일
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: rs(12) },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionEmoji: { fontSize: rs(16), marginRight: rs(6) },
  sectionTitleText: { fontSize: rs(17), fontWeight: "700", color: "#668776" },

  // 통계 카드(그리드) 스타일
  statsContainer: { width: "100%", gap: rs(5), marginBottom: rs(20) },
  gridRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: rs(5) },
  statCard: {
    width: "49%", backgroundColor: "white", borderRadius: rs(12), padding: rs(16),
    flexDirection: 'row', alignItems: 'flex-start', shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: rs(2) }, shadowOpacity: 1, shadowRadius: rs(4), elevation: 2,
  },
  statIconBox: { width: rs(40), height: rs(36), backgroundColor: "#EAF6EE", borderRadius: rs(10), justifyContent: "center", alignItems: "center", marginRight: rs(10), marginTop: rs(7) },
  statInfoBox: { flex: 1, justifyContent: 'center' },
  statTitle: { fontSize: rs(10), color: "#828282", fontWeight: "500", marginBottom: rs(4) },
  statNumber: { fontSize: rs(18), fontWeight: "700", color: "black", marginBottom: rs(2) },
  statSubText: { fontSize: rs(10), color: "#828282", fontWeight: "400" },

  // 쿠폰 처리 버튼 스타일
  couponProcessBtn: {
    width: '100%', height: rs(52), backgroundColor: "white", borderRadius: rs(12),
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA',
    shadowColor: "rgba(0,0,0,0.03)", shadowOffset: { width: 0, height: rs(2) }, shadowOpacity: 1, shadowRadius: rs(4), elevation: 2,
  },
  couponProcessText: { fontSize: rs(15), fontWeight: '700', color: '#34B262' },

  // 모달 스타일
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: rs(335), backgroundColor: "white", borderRadius: rs(12), padding: rs(24), alignItems: "center" },
  modalHeader: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: rs(20) },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  headerImage: { width: rs(24), height: rs(24), marginRight: rs(6) },
  headerTitle: { fontSize: rs(18), fontWeight: "700", color: "black" },
  gradeList: { width: "100%", gap: rs(12) },
  gradeItemBox: { width: "100%", flexDirection: "row", alignItems: "center", backgroundColor: "#F9F9F9", borderRadius: rs(10), padding: rs(12) },
  gradeImage: { width: rs(40), height: rs(40), marginRight: rs(12) },
  gradeTextBox: { flex: 1 },
  gradeItemTitle: { fontSize: rs(15), fontWeight: "700", color: "black", marginBottom: rs(2) },
  gradeItemDesc: { fontSize: rs(11), color: "#666", lineHeight: rs(16) },
});