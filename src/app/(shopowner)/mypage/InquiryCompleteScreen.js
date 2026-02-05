import { rs } from '@/src/shared/theme/scale';
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

export default function InquiryCompleteScreen({ navigation }) {

  const handleConfirm = () => {
    console.log("문의내역 페이지로 이동");
    navigation.replace('InquiryHistory');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

      <View style={styles.content}>
        
        {/* 1. 완료 이미지) */}
        <Image 
            source={require("@/assets/images/shopowner/ReportComplete.png")} 
            style={styles.image} 
            resizeMode="contain"
        />

        {/* 2. 텍스트 영역 */}
        <View style={styles.textContainer}>
            <Text style={styles.title}>문의가 접수되었어요</Text>
            <Text style={styles.subtitle}>꼼꼼히 확인하고 답변드릴게요</Text>
        </View>

        {/* 3. 확인 버튼 (검정색) */}
        <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
                <Text style={styles.btnText}>확인</Text>
            </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white',},
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: rs(80), },

  // 이미지 스타일
  image: { width: rs(94), height: rs(94), marginBottom: rs(20),},

  // 텍스트 스타일
  textContainer: { alignItems: 'center', gap: rs(5),},
  title: {
      fontSize: rs(20),
      fontWeight: '700',
      color: 'black',
      fontFamily: 'Pretendard',
      lineHeight: rs(28),
      textAlign: 'center',
  },
  subtitle: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', lineHeight: rs(19.6), textAlign: 'center',},

  // 하단 버튼 영역
  bottomContainer: { position: 'absolute', bottom: rs(30), left: 0, right: 0, paddingHorizontal: rs(24),},
  confirmBtn: { height: rs(40), backgroundColor: 'black', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center',},
  btnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard',
  },
});