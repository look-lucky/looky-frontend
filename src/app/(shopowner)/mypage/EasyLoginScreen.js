import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import {
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function EasyLoginScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

      {/* 1. 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top:10, bottom:10, left:10, right:10}}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* 2. 타이틀 */}
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>간편 로그인</Text>
        </View>

        {/* 3. 상단 안내 문구 */}
        <View style={styles.statusTextContainer}>
            <Text style={styles.statusText}>카카오 계정과 간편 로그인이 연동되어 있습니다.</Text>
        </View>

        {/* 4. 소셜 로그인 버튼 영역 */}
        <View style={styles.socialRow}>
            
            {/* 카카오 (연동됨) */}
            <View style={styles.socialItem}>
                <TouchableOpacity activeOpacity={0.8}>
                    <View style={styles.kakaoButton}>
                        {/* 카카오 심볼 대용 (채워진 말풍선) */}
                        <Ionicons name="chatbubble-sharp" size={rs(24)} color="#191919" />
                        
                        {/* 연동 확인 배지 (초록색 체크) */}
                        <View style={styles.checkBadge}>
                            <Ionicons name="checkmark" size={rs(10)} color="white" />
                        </View>
                    </View>
                </TouchableOpacity>
                <Text style={styles.socialLabel}>카카오</Text>
            </View>

            {/* 구글 */}
            <View style={styles.socialItem}>
                <TouchableOpacity activeOpacity={0.6}>
                    <View style={styles.commonButton}>
                        <Image source={require("@/assets/images/shopowner/google.png")} style={{ width: rs(26), height: rs(26) }} resizeMode="contain" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.socialLabel}>구글</Text>
            </View>

            {/* 애플 */}
            <View style={styles.socialItem}>
                <TouchableOpacity activeOpacity={0.6}>
                    <View style={styles.commonButton}>
                        <Ionicons name="logo-apple" size={rs(26)} color="black" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.socialLabel}>애플</Text>
            </View>

        </View>

        {/* 5. 하단 설명 문구 */}
        <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
                휴대폰 번호 또는 닉네임으로 로그인하시면{'\n'}
                카카오 연동을 해지하거나 계정을 변경할 수 있어요.
            </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA',},
  
  // 헤더
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA', },

  content: { paddingHorizontal: rs(20), paddingTop: rs(10), alignItems: 'center',},

  // 타이틀
  titleContainer: { width: '100%', marginBottom: rs(40),},
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard',},

  // 상단 상태 텍스트
  statusTextContainer: { marginBottom: rs(30), },
  statusText: { fontSize: rs(12), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard',},

  // 소셜 버튼 행
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: rs(30), marginBottom: rs(40),},
  socialItem: { alignItems: 'center', gap: rs(10),},
  
  // 카카오 버튼 (노란색)
  kakaoButton: {
      width: rs(60),
      height: rs(60),
      backgroundColor: '#FEE500',
      borderRadius: rs(30),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#FEE500',
  },
  
  // 공통 버튼 (흰색 + 회색 테두리) - 구글, 애플
  commonButton: {
      width: rs(60),
      height: rs(60),
      backgroundColor: 'white',
      borderRadius: rs(30),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#DCDCDC',
  },

  // 체크 배지 (카카오 우측 하단)
  checkBadge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: rs(18),
      height: rs(18),
      backgroundColor: '#34B262',
      borderRadius: rs(9),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FAFAFA',
  },

  // 라벨 (카카오, 구글, 애플)
  socialLabel: {
      fontSize: rs(12),
      fontWeight: '400',
      color: 'black',
      fontFamily: 'Pretendard',
  },

  // 하단 설명 문구
  descriptionContainer: { alignItems: 'center',},
  descriptionText: {
      fontSize: rs(12),
      fontWeight: '500',
      color: '#828282',
      fontFamily: 'Pretendard',
      textAlign: 'center',
      lineHeight: rs(18),
  },
});