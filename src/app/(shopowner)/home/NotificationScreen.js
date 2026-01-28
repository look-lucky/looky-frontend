import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. 더미 데이터 
const NOTIFICATIONS = [
  { 
    id: '1', 
    type: 'review', // 리뷰 (파랑)
    text: "새로운 리뷰가 달렸습니다: ‘분위기가 너무 좋아요!’", 
    time: '10분 전', 
    isUnread: true 
  },
  { 
    id: '2', 
    type: 'coupon', // 쿠폰 (노랑)
    text: "10% 할인 쿠폰이 모두 소진되었습니다.", 
    time: '1시간 전', 
    isUnread: true 
  },
  { 
    id: '3', 
    type: 'heart', // 좋아요 (빨강)
    text: "네잎클로버까지 좋아요 10개 남았어요!", 
    time: '3시간 전', 
    isUnread: false 
  },
  { 
    id: '4', 
    type: 'review', 
    text: "새로운 리뷰가 달렸습니다: ‘분위기가 너무 좋아요!’", 
    time: '10분 전', 
    isUnread: false 
  },
  { 
    id: '5', 
    type: 'coupon', 
    text: "10% 할인 쿠폰이 모두 소진되었습니다.", 
    time: '1시간 전', 
    isUnread: false 
  },
  { 
    id: '6', 
    type: 'heart', 
    text: "네잎클로버까지 좋아요 10개 남았어요!", 
    time: '3시간 전', 
    isUnread: false 
  },
];

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // 아이콘 및 색상 결정 함수
  const getIconInfo = (type) => {
    switch (type) {
      case 'review':
        return { name: 'chatbubble-ellipses', color: '#2563EB', bg: '#DBEAFE' };
      case 'coupon':
        return { name: 'ticket', color: '#D97706', bg: '#FEF4C7' };
      case 'heart':
        return { name: 'heart', color: '#DC2626', bg: '#FEE2E2' };
      default:
        return { name: 'notifications', color: '#333', bg: '#EEE' };
    }
  };

  // 리스트 아이템 렌더링
  const renderItem = ({ item }) => {
    const iconInfo = getIconInfo(item.type);
    
    return (
      <View style={[
        styles.itemContainer, 
        item.isUnread && styles.itemUnread // 미확인 항목 배경색 적용
      ]}>
        {/* 1. 아이콘 */}
        <View style={[styles.iconBox, { backgroundColor: iconInfo.bg }]}>
          <Ionicons name={iconInfo.name} size={14} color={iconInfo.color} />
        </View>

        {/* 2. 텍스트 내용 */}
        <View style={styles.textContainer}>
          <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
            {item.text}
          </Text>
          <Text style={styles.itemTime}>{item.time}</Text>
        </View>

        {/* 3. 읽지 않음 녹색 점 */}
        {item.isUnread && <View style={styles.unreadDot} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- 헤더 --- */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1B1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>전체알림</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* --- 필터 버튼 & 카운트 --- */}
      <View style={styles.filterRow}>
        <View style={styles.buttonGroup}>
          {/* 전체 버튼 */}
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'all' ? styles.filterBtnActive : styles.filterBtnInactive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' ? styles.textActive : styles.textInactive]}>전체</Text>
          </TouchableOpacity>

          {/* 미확인 버튼 */}
          <TouchableOpacity 
            style={[styles.filterBtn, filter === 'unread' ? styles.filterBtnActive : styles.filterBtnInactive]}
            onPress={() => setFilter('unread')}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={[styles.filterText, filter === 'unread' ? styles.textActive : styles.textInactive]}>미확인</Text>
              {/* 미확인 빨간 점(숫자로 바꾸기) */}
              <View style={styles.redDotBox}>
                 <View style={styles.redDot} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.totalCount}>총 {NOTIFICATIONS.length}개</Text>
      </View>

      {/* --- 알림 리스트 (카드 형태) --- */}
      <View style={styles.listCard}>
        <FlatList
          data={NOTIFICATIONS}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', paddingTop: Platform.OS === "android" ? StatusBar.currentHeight: 0,
  },
  
  // 헤더 스타일
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 필터 영역 스타일
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    // backgroundColor: 'white',
    // borderRadius: 10,
    // padding: 4,
    gap: 8,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 55,
    height: 30,
  },
  filterBtnActive: {
    backgroundColor: '#34B262', // 활성 녹색
  },
  filterBtnInactive: {
    backgroundColor: 'rgba(218, 218, 218, 0.50)', // 비활성 회색
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  textActive: { color: 'white' },
  textInactive: { color: '#828282' },

  // 미확인 버튼 안 빨간 점(원숫자로 바꿔야함)
  redDotBox: {
    marginLeft: 4,
    width: 6, 
    height: 6, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  redDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF3E41',
  },
  totalCount: {
    fontSize: 11,
    color: '#828282',
  },

  // 리스트 카드 (흰색 박스)
  listCard: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 300, // 알림 갯수 맞춰서 조정 필요
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  listContent: {
    paddingVertical: 0,
  },
  
  // 리스트 아이템
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20, // 높이 조절
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  itemUnread: {
    backgroundColor: 'rgba(234, 246, 238, 0.50)',
  },
  
  iconBox: {
    width: 25,
    height: 25,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 11,
    color: 'black',
    marginBottom: 4,
    lineHeight: 16,
  },
  itemTime: {
    fontSize: 10,
    color: '#828282',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34B262',
    marginLeft: 8,
  },
  
  divider: {
    height: 1,
    backgroundColor: 'rgba(130, 130, 130, 0.15)',
    width: '100%',
  },
});