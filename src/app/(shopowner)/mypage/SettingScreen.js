import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function SettingScreen({ navigation }) {

  // 메뉴 클릭 핸들러
  const handlePress = (menuName) => {
    switch(menuName) {
        case '내 정보 수정':
            navigation.navigate('EditProfile'); 
            break;
        case '가게 관리':
            navigation.navigate('StoreManagement'); 
            break;
        case '이용약관':
            navigation.navigate('Terms'); 
            break;
        case '버전정보':
           navigation.navigate('Version'); 
            break;
        default:
            break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#FAFAFA' }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top:10, bottom:10, left:10, right:10}}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 타이틀 */}
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>설정</Text>
        </View>

        {/* ================= 섹션 1: 계정 ================= */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>계정</Text>
        </View>

        {/* 메뉴: 가게 관리 */}
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('가게 관리')}>
            <Text style={styles.menuText}>가게 관리</Text>
            <Ionicons name="chevron-forward" size={rs(16)} color="black" />
        </TouchableOpacity>

        {/* 메뉴: 내 정보 수정 */}
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('내 정보 수정')}>
            <Text style={styles.menuText}>내 정보 수정</Text>
            <Ionicons name="chevron-forward" size={rs(16)} color="black" />
        </TouchableOpacity>

        {/* 구분선 */}
        <View style={styles.divider} />


        {/* ================= 섹션 2: 기타 ================= */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>기타</Text>
        </View>

        {/* 메뉴: 이용약관 */}
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('이용약관')}>
            <Text style={styles.menuText}>이용약관</Text>
            <Ionicons name="chevron-forward" size={rs(16)} color="black" />
        </TouchableOpacity>

        {/* 메뉴: 버전정보 */}
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('버전정보')}>
            <Text style={styles.menuText}>버전정보</Text>
            <Ionicons name="chevron-forward" size={rs(16)} color="black" />
        </TouchableOpacity>

        {/* 구분선 */}
        <View style={styles.divider} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA' },
  content: { paddingBottom: rs(50) },

  // 타이틀
  titleContainer: { paddingHorizontal: rs(20), marginVertical: rs(10), marginBottom: rs(20) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },

  // 섹션 헤더 (계정, 기타)
  sectionHeader: { 
      paddingHorizontal: rs(20), 
      paddingVertical: rs(5), 
      marginTop: rs(10),
      marginBottom: rs(5)
  },
  sectionTitle: { 
      fontSize: rs(14), 
      fontWeight: '400', 
      color: '#444444', 
      fontFamily: 'Pretendard' 
  },

  // 메뉴 아이템
  menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: rs(20),
      paddingVertical: rs(15),
      backgroundColor: '#FAFAFA',
  },
  menuText: {
      fontSize: rs(14),
      fontWeight: '400',
      color: 'black',
      fontFamily: 'Pretendard',
  },

  // 구분선
  divider: {
      height: 1,
      backgroundColor: '#E6E6E6',
      width: '100%',
      marginVertical: rs(5),
  },
});