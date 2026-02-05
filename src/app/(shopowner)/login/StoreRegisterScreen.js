import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function StoreRegisterScreen({ navigation }) {
  // 입력 상태 관리
  const [storeName, setStoreName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />
      {/* 1. 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* 2. 타이틀 영역 */}
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>
                    안녕하세요 사장님 !{'\n'}
                    가게 정보를 입력해주세요!
                </Text>
                <Text style={styles.subtitleText}>
                    지도에 등록되지않은 가게 정보를 입력해주세요{'\n'}
                    내 가게가 있다면 클릭하고 없다면 직접 입력해주세요
                </Text>
            </View>

            {/* 3. 입력 폼 영역 */}
            <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>가게명/주소</Text>
                <View style={styles.descriptionRow}>
                    <Text style={styles.descriptionText}>가게명과 주소를 정확히 입력해주세요</Text>
                    <Text style={styles.descriptionText}>네이버맵 기준 가게명으로 설정해주세요</Text>
                </View>

                {/* 입력창 리스트 */}
                <View style={styles.inputList}>
                    {/* 가게명 */}
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="가게명"
                            placeholderTextColor="#828282"
                            value={storeName}
                            onChangeText={setStoreName}
                        />
                    </View>

                    {/* 가게 지점명 */}
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="가게 지점명"
                            placeholderTextColor="#828282"
                            value={branchName}
                            onChangeText={setBranchName}
                        />
                    </View>

                    {/* 가게 주소 */}
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="가게 주소"
                            placeholderTextColor="#828282"
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>

                    {/* 상세 주소 (스타일 다름) */}
                    <View style={styles.detailInputBox}>
                        <TextInput
                            style={styles.detailTextInput}
                            placeholder="상세주소를 입력해주세요 (예: 4층, 405호)"
                            placeholderTextColor="#D0D0D0"
                            value={detailAddress}
                            onChangeText={setDetailAddress}
                        />
                    </View>
                </View>
            </View>

        </ScrollView>

        {/* 4. 하단 버튼 */}
        <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.registerButtonText}>등록하기</Text>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(10),
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(100),
  },

  // 타이틀
  titleContainer: {
    marginTop: rs(20),
    marginBottom: rs(40),
  },
  titleText: {
    fontSize: rs(20),
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Pretendard',
    lineHeight: rs(30),
    marginBottom: rs(10),
  },
  subtitleText: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#A6A6A6',
    fontFamily: 'Pretendard',
    lineHeight: rs(19.6),
  },

  // 폼 영역
  formContainer: {
    marginBottom: rs(20),
  },
  sectionTitle: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#272828',
    fontFamily: 'Pretendard',
    lineHeight: rs(22.4),
    marginBottom: rs(5),
  },
  descriptionRow: {
      gap: rs(2), 
      marginBottom: rs(20),
  },
  descriptionText: {
    fontSize: rs(10),
    fontWeight: '400',
    color: '#828282',
    fontFamily: 'Inter',
    lineHeight: rs(14),
  },

  // 입력창 리스트
  inputList: {
      gap: rs(10),
  },
  
  // 일반 입력창
  inputBox: {
    height: rs(40),
    backgroundColor: 'white',
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: rs(16),
  },
  textInput: {
    fontSize: rs(14),
    fontWeight: '400',
    color: 'black',
    fontFamily: 'Pretendard',
    padding: 0,
  },

  // 상세 주소 입력창
  detailInputBox: {
    height: rs(40),
    backgroundColor: '#ECECEC',
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: rs(16),
  },
  detailTextInput: {
    fontSize: rs(14),
    fontWeight: '400',
    color: 'black',
    fontFamily: 'Pretendard',
    padding: 0,
  },

  // 하단 버튼
  bottomButtonContainer: {
    position: 'absolute',
    bottom: rs(34),
    left: 0,
    right: 0,
    paddingHorizontal: rs(24),
  },
  registerButton: {
    width: '100%',
    height: rs(40),
    backgroundColor: '#40CE2B',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: rs(14),
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Pretendard',
  },
});