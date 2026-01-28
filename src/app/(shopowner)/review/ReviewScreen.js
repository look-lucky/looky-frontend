import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 1. 더미 데이터 (배고프당, 니어딜화이팅)
const INITIAL_REVIEWS = [
  {
    id: 1,
    author: '배고프당',
    profileColor: '#5F6AA9', // 프로필 원 색상
    date: '2026.01.08',
    rating: 4.5, // 별점 (소수점 가능하지만 여기선 4개/5개로 표현)
    content: '떡볶이가 정말 맛있어요! 매콤달콤한 맛이 최고입니다. 다음에 \n또 올게요~',
    images: [1, 2, 3], // 이미지 있을 경우 (더미)
    status: 'unanswered', // 미답변
    reply: null,
  },
  {
    id: 2,
    author: '니어딜화이팅',
    profileColor: '#A95F94',
    date: '2026.01.08',
    rating: 5,
    content: '가성비가 좋아요. 양도 많고 맛도 좋습니다.',
    images: [1, 2, 3],
    status: 'answered', // 답변완료
    reply: '감사합니다! 항상 맛있는 음식으로 보답하겠습니다 😊',
  },
];

export default function ReviewScreen({navigation}) {
  const [filter, setFilter] = useState('all');
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  
  // 답글 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // 1. 답글 달기 버튼 클릭 시
  const openReplyModal = (reviewId) => {
    setSelectedReviewId(reviewId);
    setReplyText('');
    setModalVisible(true);
  };

  // 2. 답글 저장
  const saveReply = () => {
    if (replyText.trim() === '') {
      Alert.alert('알림', '답글 내용을 입력해주세요.');
      return;
    }

    // 리뷰 상태 업데이트 (답변완료 처리)
    const updatedReviews = reviews.map((review) => {
      if (review.id === selectedReviewId) {
        return {
          ...review,
          status: 'answered',
          reply: replyText,
        };
      }
      return review;
    });

    setReviews(updatedReviews);
    setModalVisible(false);
    Alert.alert('완료', '답글이 등록되었습니다.');
  };

  // 별점 렌더링 함수 (노란 별)
  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons 
          key={i} 
          name="star" 
          size={rs(14)} 
          color={i < count ? "#FBBC05" : "#DADADA"} 
          style={{ marginRight: rs(2) }}
        />
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 상단 로고 */}
        <Image 
            source={require('@/assets/images/shopowner/logo2.png')} 
            style={styles.logo}
            resizeMode="contain"
        />

        {/* 페이지 타이틀 */}
        <View style={styles.titleContainer}>
            <Text style={styles.titleText}>
                <Text style={styles.storeName}>채영식당</Text>
                <Text style={styles.subText}> 의 리뷰</Text>
            </Text>
        </View>

        {/* 필터 및 카운트 */}
        <View style={styles.filterContainer}>
            <View style={styles.filterGroup}>
                <TouchableOpacity 
                    style={[styles.filterBtn, filter === 'all' ? styles.filterBtnActive : styles.filterBtnInactive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' ? styles.textActive : styles.textInactive]}>전체</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.filterBtn, filter === 'unread' ? styles.filterBtnActive : styles.filterBtnInactive]}
                    onPress={() => setFilter('unread')}
                >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[styles.filterText, filter === 'unread' ? styles.textActive : styles.textInactive]}>미답변</Text>
                        <View style={styles.redDotBox}><View style={styles.redDot} /></View>
                    </View>
                </TouchableOpacity>
            </View>
            <Text style={styles.totalCount}>총 {reviews.length}개</Text>
        </View>

        {/* --- 리뷰 리스트 --- */}
        <View style={styles.reviewList}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              
              {/* 1. 리뷰 헤더 (프로필, 닉네임, 상태뱃지) */}
              <View style={styles.cardHeader}>
                <View style={[styles.profileCircle, { backgroundColor: review.profileColor }]} />
                <Text style={styles.authorName}>{review.author}</Text>
                
                {/* 뱃지: 미답변 vs 답변완료 */}
                {review.status === 'unanswered' ? (
                   <View style={styles.badgeUnanswered}>
                      <Text style={styles.textUnanswered}>미답변</Text>
                   </View>
                ) : (
                   <View style={styles.badgeAnswered}>
                      <Text style={styles.textAnswered}>답변완료</Text>
                   </View>
                )}
              </View>

              {/* 2. 별점 및 날짜 */}
              <View style={styles.ratingRow}>
                {renderStars(review.rating)}
                <Text style={styles.dateText}>{review.date}</Text>
              </View>

              {/* 3. 리뷰 이미지 (3개 나열) */}
              <View style={styles.imageRow}>
                  <View style={styles.reviewImage} />
                  <View style={styles.reviewImage} />
                  <View style={styles.reviewImage} />
              </View>

              {/* 4. 리뷰 내용 */}
              <Text style={styles.reviewContent}>{review.content}</Text>

              {/* 5. 하단 액션 (답글달기 버튼 OR 사장님 답글 박스) */}
              {review.status === 'unanswered' ? (
                // (1) 미답변일 때: 답글 달기 버튼
                <View style={styles.actionRow}>
                   <TouchableOpacity 
                      style={styles.replyButton} 
                      onPress={() => openReplyModal(review.id)}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={rs(12)} color="white" style={{marginRight: rs(6)}} />
                      <Text style={styles.replyButtonText}>답글 달기</Text>
                   </TouchableOpacity>

                   <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('Report')}>
                      <Ionicons name="flag-outline" size={rs(14)} color="#aaa" style={{marginRight: rs(2)}} />
                      <Text style={styles.reportText}>신고</Text>
                   </TouchableOpacity>
                </View>
              ) : (
                // (2) 답변완료일 때: 사장님 답글 박스
                <View style={styles.replyBox}>
                    <Text style={styles.replyLabel}>사장님 답글</Text>
                    <Text style={styles.replyContent}>{review.reply}</Text>
                </View>
              )}

            </View>
          ))}
        </View>

      </ScrollView>

      {/* --- 답글 작성 모달 --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
           behavior={Platform.OS === "ios" ? "padding" : "height"}
           style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>답글 작성하기</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={rs(24)} color="#333" />
                </TouchableOpacity>
            </View>
            
            <TextInput
                style={styles.inputBox}
                placeholder="손님에게 감사의 마음을 전해보세요!"
                multiline
                value={replyText}
                onChangeText={setReplyText}
                autoFocus
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveReply}>
                <Text style={styles.saveButtonText}>답글 등록</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight: 0, },
  scrollContent: { paddingTop: rs(10), paddingBottom: rs(40), paddingHorizontal: rs(20) },

  // 로고 & 타이틀
  logo: { width: rs(120), height: rs(30), marginBottom: rs(10), marginLeft: 0 },
  titleContainer: { alignItems: 'flex-start', marginBottom: rs(20) },
  titleText: { textAlign: 'left', lineHeight: rs(24) },
  storeName: { fontSize: rs(20), fontWeight: '700', color: 'black' },
  subText: { fontSize: rs(14), fontWeight: '700', color: 'black' },

  // 필터
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(15) },
  filterGroup: { flexDirection: 'row', gap: rs(8) },
  filterBtn: { height: rs(32), minWidth: rs(55), paddingHorizontal: rs(14), borderRadius: rs(16), justifyContent: 'center', alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#34B262' },
  filterBtnInactive: { backgroundColor: 'rgba(218, 218, 218, 0.50)' },
  filterText: { fontSize: rs(13), fontWeight: '500' },
  textActive: { color: 'white' },
  textInactive: { color: '#828282' },
  redDotBox: { marginLeft: rs(4), width: rs(6), height: rs(6), justifyContent: 'center', alignItems: 'center' },
  redDot: { width: rs(5), height: rs(5), borderRadius: rs(2.5), backgroundColor: '#FF3E41' },
  totalCount: { fontSize: rs(11), color: '#828282' },

  // --- 리뷰 카드 스타일 ---
  reviewList: { gap: rs(20) },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: rs(12),
    padding: rs(20),
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: rs(2), height: rs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(4),
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(10) },
  profileCircle: { width: rs(31), height: rs(31), borderRadius: rs(15.5), marginRight: rs(10) },
  authorName: { fontSize: rs(14), fontWeight: '700', color: 'black', marginRight: rs(10) },
  
  // 뱃지 스타일
  badgeUnanswered: { backgroundColor: '#FEE2E2', borderRadius: rs(8), paddingHorizontal: rs(8), paddingVertical: rs(2) },
  textUnanswered: { fontSize: rs(10), color: '#DC2626' },
  badgeAnswered: { backgroundColor: '#E0EDE4', borderRadius: rs(8), paddingHorizontal: rs(8), paddingVertical: rs(2) },
  textAnswered: { fontSize: rs(10), color: '#34B262' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: rs(10) },
  dateText: { fontSize: rs(10), color: '#828282' },

  imageRow: { flexDirection: 'row', gap: rs(5), marginBottom: rs(10) },
  reviewImage: { width: rs(90), height: rs(90), backgroundColor: '#D9D9D9', borderRadius: rs(4) }, // 사이즈 조정 가능

  reviewContent: { fontSize: rs(11), color: 'black', lineHeight: rs(16), marginBottom: rs(15) },

  // 액션 버튼 (답글달기 / 신고)
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  replyButton: {
    flex: 1, 
    height: rs(30), 
    backgroundColor: '#34B262', 
    borderRadius: rs(12), 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: rs(5), 
    marginRight: rs(24),
    maxWidth: rs(200),
  },
  replyButtonText: { color: 'white', fontSize: rs(11), fontWeight: '500' },
  
  reportButton: { flexDirection: 'row', alignItems: 'center' },
  reportText: { fontSize: rs(11), color: '#aaa' },

  // 사장님 답글 박스 (답변완료 시)
  replyBox: {
    backgroundColor: '#E0EDE4',
    borderRadius: rs(8),
    padding: rs(12),
    marginTop: rs(5),
  },
  replyLabel: { fontSize: rs(9), color: '#34B262', marginBottom: rs(4) },
  replyContent: { fontSize: rs(10), color: 'black', lineHeight: rs(14) },

  // --- 모달 스타일 ---
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: rs(20), borderTopRightRadius: rs(20), padding: rs(20), minHeight: rs(300) },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(20) },
  modalTitle: { fontSize: rs(18), fontWeight: 'bold' },
  inputBox: { 
      backgroundColor: '#F5F5F5', 
      borderRadius: rs(10), 
      padding: rs(15), 
      height: rs(120), 
      textAlignVertical: 'top', 
      marginBottom: rs(20) 
  },
  saveButton: { backgroundColor: '#34B262', padding: rs(15), borderRadius: rs(10), alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: rs(16) },
});