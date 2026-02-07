import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// 더미 데이터
const LIKED_STORES = [
    {
        id: 1,
        name: '이문형 감자탕',
        category: '식당',
        rating: 4.8,
        reviewCount: 120,
        image: 'https://placehold.co/60x60/png?text=Store1',
    },
    {
        id: 2,
        name: '이문형 감자탕',
        category: '식당',
        rating: 4.8,
        reviewCount: 120,
        image: 'https://placehold.co/60x60/png?text=Store2',
    },
    {
        id: 3,
        name: '맛있는 파스타',
        category: '식당',
        rating: 4.5,
        reviewCount: 85,
        image: 'https://placehold.co/60x60/png?text=Store3',
    },
];

export default function LikedStoreScreen({ navigation }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('recent'); // 'recent' | 'rating'

  const toggleFilter = () => {
      setIsFilterOpen(!isFilterOpen);
  };

  const selectFilter = (type) => {
      setFilterType(type);
      setIsFilterOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

      {/* 1. 헤더 (가게 관리 페이지와 동일) */}
      <View style={styles.header}>
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            hitSlop={{top:10, bottom:10, left:10, right:10}}
        >
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      {/* 2. 컨텐츠 영역 (가게 관리 페이지와 동일 구조) */}
      <View style={styles.contentContainer}>
          
          {/* 타이틀 영역 */}
          <View style={styles.titleRow}>
              <Text style={styles.pageTitle}>찜한 매장</Text>
              {/* 우측 버튼이 필요하다면 여기에 추가 (예: 편집) */}
          </View>

          {/* 메인 컨텐츠 (스크롤 영역) */}
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isFilterOpen}
          >
              {/* 필터 버튼 자리 확보를 위한 여백 (필터 높이만큼) */}
              <View style={{ height: rs(40) }} /> 

              {/* 리스트 아이템들 */}
              {LIKED_STORES.map((store) => (
                  <View key={store.id} style={styles.storeCard}>
                      <View style={styles.cardLeft}>
                          <Image source={{ uri: store.image }} style={styles.storeImage} />
                          <View style={styles.storeInfo}>
                              <Text style={styles.storeCategory}>{store.category}</Text>
                              <Text style={styles.storeName}>{store.name}</Text>
                              <View style={styles.ratingRow}>
                                  <Ionicons name="star" size={rs(12)} color="#FBBC05" />
                                  <Text style={styles.ratingText}>{store.rating}</Text>
                                  <Text style={styles.reviewCountText}>({store.reviewCount})</Text>
                              </View>
                          </View>
                      </View>
                      <TouchableOpacity style={styles.bookmarkBtn}>
                          <Ionicons name="bookmark" size={rs(20)} color="#40CE2B" />
                      </TouchableOpacity>
                  </View>
              ))}
              
              <View style={{height: rs(50)}} />
          </ScrollView>

          {/* 3. 정렬 필터 (Dropdown) - 타이틀 바로 아래 위치 */}
          <View style={styles.filterContainer}>
              {isFilterOpen ? (
                  <View style={styles.filterDropdown}>
                      <TouchableOpacity 
                        style={[styles.filterOption, filterType === 'recent' && styles.filterOptionSelected]}
                        onPress={() => selectFilter('recent')}
                      >
                          <Text style={[styles.filterOptionText, filterType === 'recent' ? styles.textSelected : styles.textUnselected]}>
                              최근 찜한 순
                          </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filterOption, filterType === 'rating' && styles.filterOptionSelected]}
                        onPress={() => selectFilter('rating')}
                      >
                          <Text style={[styles.filterOptionText, filterType === 'rating' ? styles.textSelected : styles.textUnselected]}>
                              별점 높은 순
                          </Text>
                      </TouchableOpacity>
                  </View>
              ) : (
                  <TouchableOpacity style={styles.filterClosed} onPress={toggleFilter}>
                      <Text style={styles.filterText}>
                          {filterType === 'recent' ? '최근 찜한 순' : '별점 높은 순'}
                      </Text>
                      <Ionicons name="chevron-down" size={rs(12)} color="#828282" />
                  </TouchableOpacity>
              )}
          </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start' },
  contentContainer: { flex: 1, paddingHorizontal: rs(20) },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: rs(10), marginBottom: rs(20) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },

  // 스크롤 영역
  scrollContent: { paddingTop: rs(10) },

  // 가게 카드
  storeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'white', borderRadius: rs(12), padding: rs(20), marginBottom: rs(12), shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: rs(13) },
  storeImage: { width: rs(60), height: rs(60), borderRadius: rs(12), backgroundColor: '#D9D9D9' },
  storeInfo: { gap: rs(3) },
  storeCategory: { fontSize: rs(12), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard' },
  storeName: { fontSize: rs(16), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
  ratingText: { fontSize: rs(12), fontWeight: '400', color: 'black', fontFamily: 'Pretendard' },
  reviewCountText: { fontSize: rs(12), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard' },
  bookmarkBtn: { padding: rs(4) },

  // 필터 (Dropdown) 스타일 
  filterContainer: { position: 'absolute', top: rs(50), left: rs(20), zIndex: 100 },
  filterClosed: { flexDirection: 'row', alignItems: 'center', gap: rs(4), backgroundColor: 'rgba(217, 217, 217, 0.50)', paddingHorizontal: rs(12), paddingVertical: rs(6), borderRadius: rs(20) },
  filterText: { fontSize: rs(12), fontWeight: '400', color: 'black', fontFamily: 'Inter' },
  filterDropdown: { backgroundColor: 'white', borderRadius: rs(12), overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, minWidth: rs(110) },
  filterOption: { paddingVertical: rs(10), paddingHorizontal: rs(12), backgroundColor: 'white' },
  filterOptionSelected: { backgroundColor: '#D0E9D9' },
  filterOptionText: { fontSize: rs(13), fontFamily: 'Inter', fontWeight: '400' },
  textSelected: { color: '#34B262', fontWeight: '600' },
  textUnselected: { color: 'black' },
});