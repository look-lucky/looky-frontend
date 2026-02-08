import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/src/shared/lib/auth/auth-context';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// [API 함수 임포트]
import { getMyStores } from '@/src/api/store'; // 내 가게 정보 가져오기 (점주 이름 확인용)

// 재사용 가능한 메뉴 아이템 컴포넌트
const MenuItem = ({ icon, text, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.menuItemRow, !isLast && styles.menuItemBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <Ionicons name={icon} size={rs(20)} color="#444444" />
      <Text style={styles.menuItemText}>{text}</Text>
    </View>
    <Ionicons name="chevron-forward" size={rs(16)} color="#BDBDBD" />
  </TouchableOpacity>
);

export default function MypageScreen({ navigation }) {
  // [상태 관리] 점주 이름 (기본값: 루키)
  const [ownerName, setOwnerName] = useState('루키');

  // [API 호출] 내 정보(점주 이름) 가져오기
  useEffect(() => {
    const fetchOwnerInfo = async () => {
      try {
        const response = await getMyStores();
        const myStores = response.data;
        
        // 등록된 가게가 있고, ownerName 정보가 있다면 업데이트
        if (myStores && myStores.length > 0) {
          const name = myStores[0].ownerName || '사장님'; 
          setOwnerName(name);
        }
      } catch (error) {
        console.error('점주 정보 로딩 실패:', error);
      }
    };

    fetchOwnerInfo();
  }, []);

  const { handleLogout: authLogout } = useAuth();
  const handleMockPress = (menuName) => {
    console.log(`${menuName} 클릭됨`);

    if (menuName === '가게 관리') {
        navigation.navigate('StoreManagement');
    }
    else if (menuName === '내 정보 수정') {
        navigation.navigate('EditProfile');
    }
    else if (menuName === '고객센터') {
      navigation.navigate('Inquiry');
   }
    else if (menuName === '설정') {
      navigation.navigate('Setting');
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: authLogout }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

      {/* 1. 헤더 */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      {/* 2. 프로필 카드 */}
      <View style={styles.fixedProfileContainer}>
        <LinearGradient
          colors={['#33B369', '#2FB786']}
          style={styles.profileGradientBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.profileContentRow}>
            {/* 가게 아이콘 */}
            <View style={styles.shopIconBox}>
              <Ionicons name="storefront" size={rs(24)} color="#33B369" />
            </View>
            {/* 텍스트 정보 */}
            <View style={styles.profileTextColumn}>
              {/* [수정] 점주 이름 연결 */}
              <Text style={styles.profileName}>{ownerName} 사장님</Text>
              <Text style={styles.profileGreeting}>오늘 하루도 행운이 가득하길 바라요!</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* 3. 메뉴 리스트 */}
      <View style={styles.menuScrollArea}>
        <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
        >
          {/* 그룹 1: 가게 관리 / 내 정보 수정 */}
          <View style={styles.menuGroupBox}>
            <MenuItem
              icon="storefront-outline"
              text="가게 관리"
              onPress={() => handleMockPress('가게 관리')}
            />
            <MenuItem
              icon="document-text-outline"
              text="내 정보 수정"
              onPress={() => handleMockPress('내 정보 수정')}
              isLast
            />
          </View>

          {/* 그룹 2: 고객센터 / 설정 */}
          <View style={styles.menuGroupBox}>
            <MenuItem
              icon="chatbubble-ellipses-outline"
              text="고객센터"
              onPress={() => handleMockPress('고객센터')}
            />
            <MenuItem
              icon="settings-sharp"
              text="설정"
              onPress={() => handleMockPress('설정')}
              isLast
            />
          </View>

          {/* 로그아웃 버튼 */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={rs(16)} color="#828282" />
              <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // [전체 레이아웃]
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  
  // [상단 헤더]
  headerContainer: {
    height: rs(50),
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: rs(20),
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: rs(18),
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Pretendard',
  },
  
  // [프로필 카드 영역]
  fixedProfileContainer: {
    paddingHorizontal: rs(20),
    paddingBottom: rs(20),
    backgroundColor: 'white', 
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    elevation: 2,
  },
  profileGradientBox: { 
    height: rs(100),
    borderRadius: rs(12),
    justifyContent: 'center',
    paddingHorizontal: rs(25),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileContentRow: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopIconBox: { 
    width: rs(44),
    height: rs(44),
    backgroundColor: 'white',
    borderRadius: rs(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: rs(15),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  profileTextColumn: { 
    justifyContent: 'center',
  },
  profileName: { 
    fontSize: rs(18),
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Pretendard',
    marginBottom: rs(4),
  },
  profileGreeting: { 
    fontSize: rs(11),
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.90)',
    fontFamily: 'Pretendard',
  },

  // [메뉴 리스트 영역]
  menuScrollArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    paddingTop: rs(20),
    paddingHorizontal: rs(20),
    paddingBottom: rs(50),
    gap: rs(15), 
  },
  menuGroupBox: { 
    backgroundColor: 'white',
    borderRadius: rs(12),
    paddingVertical: rs(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  menuItemRow: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: rs(14),
    paddingHorizontal: rs(15),
  },
  menuItemBorder: { 
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5', 
    marginHorizontal: rs(15), 
    paddingHorizontal: 0, 
  },
  menuItemLeft: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  menuItemText: { 
    fontSize: rs(14),
    fontWeight: '400',
    color: '#444444', 
    fontFamily: 'Pretendard',
  },

  // 로그아웃 버튼 스타일
  logoutButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: rs(20),
      gap: rs(5),
  },
  logoutText: {
      fontSize: rs(12),
      fontWeight: '400',
      color: '#828282',
      fontFamily: 'Pretendard',
  },
});