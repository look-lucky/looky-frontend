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

export default function StoreSelectScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState('manual');

  // 더미 데이터 (가게 목록)
  const storeList = [
    { id: 'manual', name: '직접 입력', address: null },
    { id: '1', name: '치쿠린 서울', address: '서울 마포구 서교동 446-6' },
    { id: '2', name: '치쿠린', address: '전북특별자치도 전주시 덕진구 덕진동1가 1266-6' },
    { id: '3', name: '일본라멘전문점 치쿠린 원광대점', address: '전북특별자치도 익산시 신동 790-22' },
  ];

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
                    내 가게를 선택해주세요!
                </Text>
                <Text style={styles.subtitleText}>
                    지도에 등록된 가게 정보를 불러왔어요{'\n'}
                    내 가게가 있다면 클릭하고 없다면 직접 입력해주세요
                </Text>
            </View>

            {/* 3. 검색창 */}
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="가게명 검색"
                    placeholderTextColor="#999999"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <Ionicons name="search" size={rs(20)} color="#828282" />
            </View>

            {/* 4. 가게 리스트 카드 */}
            <View style={styles.cardContainer}>
                {storeList.map((item, index) => (
                    <View key={item.id}>
                        <TouchableOpacity 
                            style={styles.listItem}
                            activeOpacity={0.7}
                            onPress={() => setSelectedId(item.id)}
                        >
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                {item.address && (
                                    <Text style={styles.itemAddress}>{item.address}</Text>
                                )}
                            </View>

                            {/* 라디오 버튼 UI */}
                            <View style={styles.radioButtonContainer}>
                                {selectedId === item.id ? (
                                    <View style={styles.radioSelected}>
                                        <View style={styles.radioInnerWhite} />
                                    </View>
                                ) : (
                                    <View style={styles.radioUnselected} />
                                )}
                            </View>
                        </TouchableOpacity>
                        
                        {/* 마지막 아이템이 아닐 때만 구분선 표시 */}
                        {index < storeList.length - 1 && <View style={styles.divider} />}
                    </View>
                ))}
            </View>

        </ScrollView>

        {/* 5. 하단 버튼 */}
        <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>선택하기</Text>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(10),
    backgroundColor: '#F9F9F9',
  },
  scrollContent: {
    paddingHorizontal: rs(20),
    paddingBottom: rs(100),
  },

  // 타이틀
  titleContainer: {
    marginTop: rs(20),
    marginBottom: rs(20),
  },
  titleText: {
    fontSize: rs(22),
    fontWeight: '700',
    color: '#1B1D1F',
    fontFamily: 'Pretendard',
    lineHeight: rs(30),
    marginBottom: rs(8),
  },
  subtitleText: {
    fontSize: rs(13),
    fontWeight: '400',
    color: '#828282',
    fontFamily: 'Pretendard',
    lineHeight: rs(19),
  },

  // 검색창
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: rs(12),
    height: rs(48),
    paddingHorizontal: rs(16),
    marginBottom: rs(20),
  },
  searchInput: {
    flex: 1,
    fontSize: rs(14),
    fontFamily: 'Pretendard',
    color: 'black',
    marginRight: rs(10),
  },

  // 카드 컨테이너
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: rs(16),
    paddingVertical: rs(10),
    paddingHorizontal: rs(20),
    // 그림자 효과
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: rs(18),
  },
  itemTextContainer: {
    flex: 1,
    paddingRight: rs(10),
  },
  itemName: {
    fontSize: rs(15),
    fontWeight: '600',
    color: '#1B1D1F',
    fontFamily: 'Pretendard',
    marginBottom: rs(4),
  },
  itemAddress: {
    fontSize: rs(12),
    fontWeight: '400',
    color: '#828282',
    fontFamily: 'Pretendard',
    lineHeight: rs(16),
  },
  
  // 구분선
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%',
  },

  // 라디오 버튼 스타일
  radioButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: rs(22),
    height: rs(22),
    borderRadius: rs(11),
    backgroundColor: '#5CE357',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#5CE357",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  radioInnerWhite: {
    width: rs(10),
    height: rs(10),
    borderRadius: rs(5),
    backgroundColor: 'white',
    opacity: 0.8,
    display: 'none'
  },
  radioSelected: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: '#66E155',
    borderWidth: 1,
    borderColor: '#66E155',
    shadowColor: "#66E155",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  radioUnselected: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: '#D9D9D9',
  },

  // 하단 버튼
  bottomButtonContainer: {
    position: 'absolute',
    bottom: rs(20),
    left: 0,
    right: 0,
    paddingHorizontal: rs(20),
  },
  selectButton: {
    width: '100%',
    height: rs(50),
    backgroundColor: '#34B262', 
    borderRadius: rs(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: rs(16),
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Pretendard',
  },
});