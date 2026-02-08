import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// [API] 소셜 회원가입 완료 함수
import { completeSocialSignup } from '@/src/api/auth';

export default function EasyLoginScreen({ navigation }) {
  // 로딩 상태 (API 호출 중)
  const [isLoading, setIsLoading] = useState(false);
  
  // 현재 연동된 계정 상태 (기본값: 카카오)
  // 실제로는 서버에서 '내 정보'를 받아와서 설정해야 함
  const [linkedProvider, setLinkedProvider] = useState('KAKAO'); 

  // [핵심] 소셜 로그인 핸들러
  const handleSocialLogin = async (provider) => {
    // 이미 연동된 계정이면 안내 메시지
    if (linkedProvider === provider) {
        Alert.alert('알림', `이미 ${provider} 계정과 연동되어 있습니다.`);
        return;
    }

    setIsLoading(true);

    try {
        // ============================================================
        // [TODO] 실제 카카오/구글/애플 SDK 로그인 코드 들어감
        // 지금은 '로그인 성공'했다고 가정하고 가짜 토큰
        // ============================================================
        
        // 1. SDK 로그인 시뮬레이션 (1초 대기)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockSocialToken = `mock_token_from_${provider}`; // 가짜 토큰

        // 2. 서버에 소셜 로그인 정보 전송 (API 호출)
        // 파라미터 구조는 API 명세서(auth.ts)에 따름
        await completeSocialSignup({
            provider: provider, // 'KAKAO', 'GOOGLE', 'APPLE'
            token: mockSocialToken
        });

        // 3. 성공 처리
        setLinkedProvider(provider); // 연동 상태 변경
        Alert.alert('성공', `${provider} 계정과 연동되었습니다.`);

    } catch (error) {
        console.error('소셜 연동 실패:', error);
        // 에러가 났지만 UI 테스트를 위해 성공으로 처리 (개발용)
        // 실제 배포 시엔 아래 두 줄 삭제 필요
        setLinkedProvider(provider); 
        Alert.alert('알림', `(테스트) ${provider} 연동 완료 (서버 에러 무시)`);
        
    } finally {
        setIsLoading(false);
    }
  };

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
            <Text style={styles.statusText}>
                {linkedProvider 
                    ? `${linkedProvider} 계정과 간편 로그인이 연동되어 있습니다.`
                    : '연동된 소셜 계정이 없습니다.'}
            </Text>
        </View>

        {/* 4. 소셜 로그인 버튼 영역 */}
        <View style={styles.socialRow}>
            
            {/* 카카오 */}
            <View style={styles.socialItem}>
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    onPress={() => handleSocialLogin('KAKAO')}
                    disabled={isLoading}
                >
                    <View style={styles.kakaoButton}>
                        {isLoading && linkedProvider !== 'KAKAO' ? (
                            <ActivityIndicator color="black" />
                        ) : (
                            <Ionicons name="chatbubble-sharp" size={rs(24)} color="#191919" />
                        )}
                        
                        {/* 연동 확인 배지 */}
                        {linkedProvider === 'KAKAO' && (
                            <View style={styles.checkBadge}>
                                <Ionicons name="checkmark" size={rs(10)} color="white" />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                <Text style={styles.socialLabel}>카카오</Text>
            </View>

            {/* 구글 */}
            <View style={styles.socialItem}>
                <TouchableOpacity 
                    activeOpacity={0.6}
                    onPress={() => handleSocialLogin('GOOGLE')}
                    disabled={isLoading}
                >
                    <View style={styles.commonButton}>
                        {isLoading && linkedProvider !== 'GOOGLE' ? (
                            <ActivityIndicator color="black" />
                        ) : (
                            <Image source={require("@/assets/images/shopowner/google.png")} style={{ width: rs(26), height: rs(26) }} resizeMode="contain" />
                        )}

                        {/* 연동 확인 배지 */}
                        {linkedProvider === 'GOOGLE' && (
                            <View style={styles.checkBadge}>
                                <Ionicons name="checkmark" size={rs(10)} color="white" />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                <Text style={styles.socialLabel}>구글</Text>
            </View>

            {/* 애플 */}
            <View style={styles.socialItem}>
                <TouchableOpacity 
                    activeOpacity={0.6}
                    onPress={() => handleSocialLogin('APPLE')}
                    disabled={isLoading}
                >
                    <View style={styles.commonButton}>
                        {isLoading && linkedProvider !== 'APPLE' ? (
                            <ActivityIndicator color="black" />
                        ) : (
                            <Ionicons name="logo-apple" size={rs(26)} color="black" />
                        )}

                        {/* 연동 확인 배지 */}
                        {linkedProvider === 'APPLE' && (
                            <View style={styles.checkBadge}>
                                <Ionicons name="checkmark" size={rs(10)} color="white" />
                            </View>
                        )}
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