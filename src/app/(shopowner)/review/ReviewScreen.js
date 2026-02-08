import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// [API] 훅 임포트
import { useGetReviews, useGetReviewStats } from '@/src/api/review';
import { useGetMyStores } from '@/src/api/store';
import { getToken } from '@/src/shared/lib/auth/token';

export default function ReviewScreen({ navigation }) {
  const [filter, setFilter] = useState('all');

  // 답글 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // [핵심] 낙관적 업데이트를 위한 임시 답글 저장소 (새로고침 전까지 화면에 보여줌)
  const [tempReplies, setTempReplies] = useState({});

  // 1. 내 가게 정보 조회 → storeId 추출
  const { data: storeDataResponse } = useGetMyStores();
  const [myStoreId, setMyStoreId] = useState(null);
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    const rawData = storeDataResponse?.data;
    const myStoreData = Array.isArray(rawData) ? rawData : rawData?.data;

    if (myStoreData) {
      const myStore = Array.isArray(myStoreData) ? myStoreData[0] : myStoreData;
      if (myStore) {
        setMyStoreId(myStore.id);
        setStoreName(myStore.name || '');
      }
    }
  }, [storeDataResponse]);

  // 2. 리뷰 목록 조회
  const {
    data: reviewsResponse,
    isLoading: isReviewsLoading,
    refetch: refetchReviews,
  } = useGetReviews(myStoreId, { pageable: { page: 0, size: 100 } }, { query: { enabled: !!myStoreId } });

  // 3. 리뷰 통계 조회
  const { data: statsResponse } = useGetReviewStats(myStoreId, { query: { enabled: !!myStoreId } });

  // =================================================================
  // 데이터 가공 로직
  // =================================================================
  const rawReviews = reviewsResponse?.data?.data?.content || reviewsResponse?.data?.content || [];

  const processReviews = (list) => {
    if (!list || list.length === 0) return [];

    const parents = list.filter(item => !item.parentReviewId);
    const replies = list.filter(item => item.parentReviewId);

    const combined = parents.map(parent => {
      // 1. 서버에서 온 답글 찾기
      const serverReply = (parent.replies && parent.replies.length > 0)
        ? parent.replies[0]
        : replies.find(r => r.parentReviewId === parent.reviewId);

      // 2. [핵심] 서버에 없으면, 방금 내가 쓴 임시 답글(tempReplies) 확인
      const localReplyContent = tempReplies[parent.reviewId];
      const finalReply = serverReply || (localReplyContent ? { content: localReplyContent, isLocal: true } : null);

      return {
        ...parent,
        replies: finalReply ? [finalReply] : []
      };
    });

    return combined;
  };

  const topLevelReviews = processReviews(rawReviews);

  // 필터 적용
  const reviews = filter === 'unread'
    ? topLevelReviews.filter(review => !review.replies || review.replies.length === 0)
    : topLevelReviews;

  const totalCount = topLevelReviews.length;
  // 미답변 개수 계산 시에도 임시 답글 반영
  const unansweredCount = topLevelReviews.filter(r => (!r.replies || r.replies.length === 0)).length;

  // =================================================================

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const getProfileColor = (name) => {
    const colors = ['#5F6AA9', '#A95F94', '#6AAA5F', '#AA8B5F', '#5FA9A9', '#9A5FA9'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // 1. 답글 달기 버튼 클릭 시
  const openReplyModal = (reviewId) => {
    setSelectedReviewId(reviewId);
    setReplyText('');
    setModalVisible(true);
  };

  // 2. 답글 저장
  const saveReply = async () => {
    if (replyText.trim() === '') {
      Alert.alert('알림', '답글 내용을 입력해주세요.');
      return;
    }
    if (!myStoreId || !selectedReviewId) {
      Alert.alert('오류', '매장 또는 리뷰 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const tokenData = await getToken();
      const token = tokenData?.accessToken;

      const formData = new FormData();
      const requestBody = JSON.stringify({
        content: replyText.trim(),
        parentReviewId: selectedReviewId,
      });

      formData.append("request", {
        string: requestBody,
        type: "application/json",
        name: "request"
      });

      console.log("🚀 [답글 등록] 전송 시작...");

      const response = await fetch(`https://api.looky.kr/api/stores/${myStoreId}/reviews`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      });

      const textResponse = await response.text();
      console.log("📩 [답글 응답]", response.status, textResponse);

      if (response.ok) {
        // [핵심] 성공 시 UI 즉시 강제 업데이트 (서버 응답 기다리지 않음)
        setTempReplies(prev => ({
          ...prev,
          [selectedReviewId]: replyText.trim()
        }));

        setModalVisible(false);
        setReplyText('');

        // 안내 없이 바로 반영하거나, 짧은 토스트만 띄움
        // Alert.alert 대신 UI가 바뀌는 것을 바로 보여줌

        // 백그라운드에서 진짜 데이터 갱신 요청
        setTimeout(() => {
          refetchReviews();
        }, 500);

      } else {
        Alert.alert('오류', `등록 실패 (${response.status})`);
      }

    } catch (error) {
      console.error("💥 [답글 등록 에러]", error);
      Alert.alert('오류', '네트워크 요청 중 문제가 발생했습니다.');
    }
  };

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

  if (isReviewsLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#34B262" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Image
          source={require('@/assets/images/shopowner/logo2.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            <Text style={styles.storeName}>{storeName || '내 가게'}</Text>
            <Text style={styles.subText}> 의 리뷰</Text>
          </Text>
        </View>

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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.filterText, filter === 'unread' ? styles.textActive : styles.textInactive]}>미답변</Text>
                {unansweredCount > 0 && (
                  <View style={styles.redDotBox}><View style={styles.redDot} /></View>
                )}
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.totalCount}>총 {filter === 'unread' ? unansweredCount : totalCount}개</Text>
        </View>

        <View style={styles.reviewList}>
          {reviews.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: rs(40) }}>
              <Text style={{ fontSize: rs(13), color: '#828282' }}>
                {filter === 'unread' ? '미답변 리뷰가 없습니다.' : '아직 리뷰가 없습니다.'}
              </Text>
            </View>
          ) : (
            reviews.map((review) => {
              // replies 배열이 있거나, tempReplies에 내 글이 있으면 답변 완료로 처리
              const hasReply = (review.replies && review.replies.length > 0);
              const reply = hasReply ? review.replies[0] : null;

              return (
                <View key={review.reviewId} style={styles.reviewCard}>

                  <View style={styles.cardHeader}>
                    <View style={[styles.profileCircle, { backgroundColor: getProfileColor(review.username) }]} />
                    <Text style={styles.authorName}>{review.username}</Text>

                    {!hasReply ? (
                      <View style={styles.badgeUnanswered}>
                        <Text style={styles.textUnanswered}>미답변</Text>
                      </View>
                    ) : (
                      <View style={styles.badgeAnswered}>
                        <Text style={styles.textAnswered}>답변완료</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.ratingRow}>
                    {renderStars(review.rating)}
                    <Text style={styles.dateText}>{formatDate(review.createdAt)}</Text>
                  </View>

                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <View style={styles.imageRow}>
                      {review.imageUrls.map((url, idx) => (
                        <Image key={idx} source={{ uri: url }} style={styles.reviewImage} />
                      ))}
                    </View>
                  )}

                  <Text style={styles.reviewContent}>{review.content}</Text>

                  {/* 답글 영역 */}
                  {!hasReply ? (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.replyButton}
                        onPress={() => openReplyModal(review.reviewId)}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={rs(12)} color="white" style={{ marginRight: rs(6) }} />
                        <Text style={styles.replyButtonText}>답글 달기</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('Report', { reviewId: review.reviewId })}>
                        <Ionicons name="flag-outline" size={rs(14)} color="#aaa" style={{ marginRight: rs(2) }} />
                        <Text style={styles.reportText}>신고</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.replyBox}>
                      <Text style={styles.replyLabel}>사장님 답글</Text>
                      <Text style={styles.replyContent}>{reply.content}</Text>
                    </View>
                  )}

                </View>
              );
            })
          )}
        </View>

      </ScrollView>

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

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveReply}
            >
              <Text style={styles.saveButtonText}>답글 등록</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, },
  scrollContent: { paddingTop: rs(10), paddingBottom: rs(40), paddingHorizontal: rs(20) },

  logo: { width: rs(120), height: rs(30), marginBottom: rs(10), marginLeft: 0 },
  titleContainer: { alignItems: 'flex-start', marginBottom: rs(20) },
  titleText: { textAlign: 'left', lineHeight: rs(24) },
  storeName: { fontSize: rs(20), fontWeight: '700', color: 'black' },
  subText: { fontSize: rs(14), fontWeight: '700', color: 'black' },

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

  badgeUnanswered: { backgroundColor: '#FEE2E2', borderRadius: rs(8), paddingHorizontal: rs(8), paddingVertical: rs(2) },
  textUnanswered: { fontSize: rs(10), color: '#DC2626' },
  badgeAnswered: { backgroundColor: '#E0EDE4', borderRadius: rs(8), paddingHorizontal: rs(8), paddingVertical: rs(2) },
  textAnswered: { fontSize: rs(10), color: '#34B262' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: rs(10) },
  dateText: { fontSize: rs(10), color: '#828282' },

  imageRow: { flexDirection: 'row', gap: rs(5), marginBottom: rs(10) },
  reviewImage: { width: rs(90), height: rs(90), backgroundColor: '#D9D9D9', borderRadius: rs(4) },

  reviewContent: { fontSize: rs(11), color: 'black', lineHeight: rs(16), marginBottom: rs(15) },

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

  replyBox: {
    backgroundColor: '#E0EDE4',
    borderRadius: rs(8),
    padding: rs(12),
    marginTop: rs(5),
  },
  replyLabel: { fontSize: rs(9), color: '#34B262', marginBottom: rs(4) },
  replyContent: { fontSize: rs(10), color: 'black', lineHeight: rs(14) },

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