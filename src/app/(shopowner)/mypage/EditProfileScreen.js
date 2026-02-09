import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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

export default function EditProfileScreen({ navigation }) {
  
  // 메뉴 클릭 핸들러
  const handlePress = (menuName) => {
    console.log(`${menuName} 클릭`);
    // navigation.navigate(menuName); 

    // 아이디 변경 화면 연결
    if (menuName === '아이디') {
        navigation.navigate('ChangeId');
    }
    else if (menuName === '비밀번호') {
        navigation.navigate('ChangePassword');
    }
    else if (menuName === '회원탈퇴') {
        navigation.navigate('Withdraw');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

      {/* 1. 헤더 (뒤로가기 버튼) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top:10, bottom:10, left:10, right:10}}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      {/* 2. 페이지 타이틀  */}
      <View style={styles.fixedTitleContainer}>
        <Text style={styles.pageTitle}>내 정보 수정</Text>
      </View>

      {/* 3. 스크롤 영역 */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* 메뉴 리스트 (그룹 1) */}
        <View style={styles.menuGroup}>
          <MenuRow label="아이디" onPress={() => handlePress('아이디')} />
          <MenuRow label="비밀번호" onPress={() => handlePress('비밀번호')} isLast={true} />
        </View>

        <View style={styles.divider} />

        {/* 회원탈퇴 (그룹 2) */}
        <TouchableOpacity style={styles.menuRow} onPress={() => handlePress('회원탈퇴')}>
            <Text style={styles.deleteAccountText}>회원탈퇴</Text>
            <Ionicons name="chevron-forward" size={rs(16)} color="#BDBDBD" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// 재사용 가능한 메뉴 행 컴포넌트
const MenuRow = ({ label, onPress, isLast }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
        <Text style={styles.menuText}>{label}</Text>
        <Ionicons name="chevron-forward" size={rs(16)} color="#1B1D1F" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', },
  
  // 헤더
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA',},

  // 고정된 타이틀 영역
  fixedTitleContainer: { paddingHorizontal: rs(20), marginTop: rs(10), marginBottom: rs(10), backgroundColor: '#FAFAFA', zIndex: 1,},
  
  pageTitle: { fontSize: rs(20), fontWeight: '700',  color: 'black', fontFamily: 'Pretendard',},

  // 스크롤 컨텐츠 영역
  content: { paddingHorizontal: rs(20), paddingBottom: rs(50), paddingTop: rs(10),},

  // menuGroup: {// 필요시 스타일 추가},
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: rs(18),  backgroundColor: 'transparent', },
  menuText: { fontSize: rs(15), fontWeight: '500', color: '#1B1D1F', fontFamily: 'Pretendard',},

  // 구분선
  divider: { height: 1, backgroundColor: '#E6E6E6',  marginVertical: rs(10),},

  // 회원탈퇴 텍스트
  deleteAccountText: { fontSize: rs(14), fontWeight: '500', color: '#BDBDBD',  fontFamily: 'Pretendard',},
});