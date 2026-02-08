import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// [토큰 관리] 토큰 삭제 함수 임포트
import { removeToken } from '@/src/shared/lib/auth/token';

export default function WithdrawCompleteScreen({ navigation }) {

  const handleGoMain = async () => {
    try {
        // 1. 핸드폰에 저장된 토큰(로그인 정보) 삭제
        await removeToken(); 
    } catch (e) {
        console.log("토큰 삭제 중 오류(무시 가능):", e);
    } finally {
        // 2. 로그인 화면으로 초기화 및 이동
        // (뒤로가기 눌러도 다시 이 화면으로 못 오게 리셋)
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }], 
        });
    }
  }; // <--- [수정] 여기에 닫는 괄호가 빠져 있었습니다. 추가함.

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#FAFAFA' }} />

      <View style={styles.content}>
        
        {/* 1. 완료 아이콘 */}
        <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={rs(40)} color="white" />
        </View>

        {/* 2. 텍스트 영역 */}
        <View style={styles.textContainer}>
            <Text style={styles.title}>회원탈퇴가 완료되었습니다</Text>
            <Text style={styles.subtitle}>
                그동안 루키와 함께 행운을{'\n'}
                모아주셔서 진심으로 감사합니다
            </Text>
        </View>

        {/* 3. 메인으로 이동 버튼 */}
        <TouchableOpacity style={styles.blackBtn} onPress={handleGoMain} activeOpacity={0.8}>
            <Text style={styles.btnText}>메인페이지로 이동하기</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: rs(100),
  },

  // 아이콘 스타일
  iconCircle: {
      width: rs(80),
      height: rs(80),
      borderRadius: rs(40),
      backgroundColor: '#8ED2A8',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: rs(30),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },

  // 텍스트 스타일
  textContainer: {
      alignItems: 'center',
      marginBottom: rs(60),
  },
  title: {
      fontSize: rs(20),
      fontWeight: '700',
      color: 'black',
      fontFamily: 'Pretendard',
      marginBottom: rs(10),
      textAlign: 'center',
  },
  subtitle: {
      fontSize: rs(14),
      fontWeight: '500',
      color: '#828282',
      fontFamily: 'Pretendard',
      textAlign: 'center',
      lineHeight: rs(20),
  },

  // 버튼 스타일
  blackBtn: {
      width: rs(295),
      height: rs(40),
      backgroundColor: 'black',
      borderRadius: rs(8),
      justifyContent: 'center',
      alignItems: 'center',
  },
  btnText: {
      color: 'white',
      fontSize: rs(14),
      fontWeight: '700',
      fontFamily: 'Pretendard',
  },
});