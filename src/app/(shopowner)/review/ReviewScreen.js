import LookyLogo from "@/assets/images/logo/looky-logo.svg";
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// [API] 훅 임포트
import { useDeleteReview, useGetReviews, useGetReviewStats, useUpdateReview } from '@/src/api/review';
import { useGetMyStores } from '@/src/api/store';
import { ErrorPopup } from '@/src/shared/common/error-popup';
import { getToken } from '@/src/shared/lib/auth/token';

export default function ReviewScreen({ navigation }) {
  const [filter, setFilter] = useState('all');

  // 답글 모달 상태
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // 실제 대댓글 대상 리뷰 객체
  const [selectedReviewId, setSelectedReviewId] = useState(null); // Parent Review ID
  const [editingReplyId, setEditingReplyId] = useState(null); // Reply ID (if editing)
  const [replyText, setReplyText] = useState('');

  // [핵심] 낙관적 업데이트를 위한 임시 답글 저장소 (새로고침 전까지 화면에 보여줌)
  const [tempReplies, setTempReplies] = useState({});

  // 에러 팝업 관련 상태
  const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);
  const [isPopupRefreshing, setIsPopupRefreshing] = useState(false);

  // 1. 내 가게 정보 조회 → storeId 추출
  const { data: storeDataResponse } = useGetMyStores();
  const [myStoreId, setMyStoreId] = useState(null);
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    const initStore = async () => {
      // 1. AsyncStorage에서 선택된 가게 ID 가져오기
      const savedStoreId = await AsyncStorage.getItem('SELECTED_STORE_ID');

      const rawData = storeDataResponse?.data;
      const myStoresList = (Array.isArray(rawData) ? rawData : rawData?.data) || [];

      if (savedStoreId) {
        setMyStoreId(parseInt(savedStoreId, 10));
        // 상점 이름 찾기
        const currentStore = myStoresList.find(s => s.id === parseInt(savedStoreId, 10));
        if (currentStore) {
          setStoreName(currentStore.name || '');
        }
      } else if (myStoresList.length > 0) {
        // 저장된 게 없으면 첫 번째 가게 사용
        const firstStore = myStoresList[0];
        setMyStoreId(firstStore.id);
        setStoreName(firstStore.name || '');
        await AsyncStorage.setItem('SELECTED_STORE_ID', firstStore.id.toString());
      }
    };

    initStore();
  }, [storeDataResponse]);

  // 2. 리뷰 목록 조회
  const {
    data: reviewsResponse,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useGetReviews(myStoreId, { pageable: { page: 0, size: 100 } }, { query: { enabled: !!myStoreId } });

  const { mutate: deleteReviewMutation } = useDeleteReview();
  const { mutate: updateReviewMutation } = useUpdateReview();

  // 3. 리뷰 통계 조회
  const {
    data: statsResponse,
    isError: isStatsError,
    refetch: refetchStats
  } = useGetReviewStats(myStoreId, { query: { enabled: !!myStoreId } });

  // [추가] 화면 포커스 시 데이터 다시 불러오기 (하단 탭 클릭 등 제어)
  useFocusEffect(
    useCallback(() => {
      if (myStoreId) {
        refetchReviews();
        refetchStats();
      }
    }, [myStoreId, refetchReviews, refetchStats])
  );

  // 에러 발생 시 처리
  useEffect(() => {
    if (isReviewsError || isStatsError) {
      setIsErrorPopupVisible(true);
      setIsPopupRefreshing(false);
    }
  }, [isReviewsError, isStatsError]);

  const handleErrorRefresh = async () => {
    setIsPopupRefreshing(true);
    await Promise.all([
      refetchReviews(),
      refetchStats()
    ]);
    setIsPopupRefreshing(false);
  };

  // =================================================================
  // 데이터 가공 로직
  // =================================================================
  const rawReviews = reviewsResponse?.data?.data?.content || reviewsResponse?.data?.content || [];

  const processReviews = (list) => {
    if (!list || list.length === 0) return [];

    // 서버에서 받은 데이터가 이미 부모 위주로 되어 있고, 자식 답글이 children에 포함된 구조임
    const combined = list.map(parent => {
      // 1. 서버에서 온 답글 찾기 (children 배열 확인)
      // children이 있고, 배열이며, 길이가 0보다 크면 마지막 답글을 가져옴 (최신순?)
      // 보통 답글은 하나만 달리지만, 여러 개라면 마지막 것이 최신일 가능성 높음
      const serverReplies = parent.children;
      const serverReply = (serverReplies && serverReplies.length > 0)
        ? serverReplies[serverReplies.length - 1]
        : null;

      // 2. [핵심] 서버에 없으면, 방금 내가 쓴 임시 답글(tempReplies) 확인
      const localReplyContent = tempReplies[parent.reviewId];
      // serverReply가 있으면 그걸 쓰고, 없으면 로컬 임시 답글을 씀
      // 단, 로컬 답글은 content만 있으므로 객체로 만들어줌
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
  const openReplyModal = (review, existingReply = null) => {
    setReplyingTo(review);
    setSelectedReviewId(review.reviewId);
    if (existingReply) {
      setEditingReplyId(existingReply.reviewId);
      setReplyText(existingReply.content || '');
    } else {
      setEditingReplyId(null);
      setReplyText('');
    }
    setIsReplyMode(true);
  };

  // [추가] 뒤로가기 버튼 클릭 시 확인 팝업
  const handleBackPress = () => {
    if (replyText.trim().length > 0) {
      Alert.alert(
        '작성 중인 내용이 있습니다',
        '나가시겠습니까? 작성 중인 내용은 저장되지 않습니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '나가기',
            style: 'destructive',
            onPress: () => {
              setIsReplyMode(false);
              setReplyingTo(null);
              setReplyText('');
            }
          },
        ]
      );
    } else {
      setIsReplyMode(false);
      setReplyingTo(null);
    }
  };

  const handleDeleteReply = (replyId, parentReviewId) => {
    Alert.alert(
      '답글 삭제',
      '정말로 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteReviewMutation({ reviewId: replyId }, {
              onSuccess: () => {
                // 로컬 상태에서도 제거하여 즉시 반영
                const newTemp = { ...tempReplies };
                delete newTemp[parentReviewId];
                setTempReplies(newTemp);

                setTimeout(() => {
                  refetchReviews();
                }, 500);
              },
              onError: (err) => {
                console.error("Delete Error", err);
                Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
              }
            });
          }
        }
      ]
    );
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

    // 수정 모드일 경우
    if (editingReplyId) {
      try {
        const tokenData = await getToken();
        const token = tokenData?.accessToken;

        const formData = new FormData();
        const requestBody = JSON.stringify({
          content: replyText.trim(),
        });

        formData.append("request", {
          string: requestBody,
          type: "application/json",
          name: "request"
        });

        console.log("🚀 [답글 수정] 전송 시작...");

        const response = await fetch(`https://api.looky.kr/api/reviews/${editingReplyId}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
          body: formData,
        });

        const textResponse = await response.text();
        console.log("📩 [답글 수정 응답]", response.status, textResponse);

        if (response.ok) {
          // UI 업데이트
          setReplyText('');
          setEditingReplyId(null);
          setIsReplyMode(false);
          setReplyingTo(null);

          setTimeout(() => {
            refetchReviews();
          }, 500);
        } else {
          Alert.alert('오류', `수정 실패 (${response.status})`);
        }
      } catch (err) {
        console.error("Update Error", err);
        Alert.alert('오류', '수정 중 문제가 발생했습니다.');
      }
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

        setReplyText('');
        setIsReplyMode(false);
        setReplyingTo(null);

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

  const renderReplyView = () => {
    if (!replyingTo) return null;

    return (
      <View style={styles.replyViewContainer}>
        <View style={styles.replyHeader}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={rs(24)} color="black" />
          </TouchableOpacity>
          <Text style={styles.replyTitle}>답글달기</Text>
          <View style={{ width: rs(24) }} />
        </View>

        <ScrollView contentContainerStyle={styles.replyScrollContent}>
          <View style={styles.replyCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.profileCircle, { backgroundColor: getProfileColor(replyingTo.username) }]} />
              <Text style={styles.authorName}>{replyingTo.username}</Text>
              <View style={styles.badgeUnanswered}>
                <Text style={styles.textUnanswered}>미답변</Text>
              </View>
            </View>

            <View style={styles.ratingRow}>
              {renderStars(replyingTo.rating)}
              <Text style={styles.dateText}>{formatDate(replyingTo.createdAt)}</Text>
            </View>

            {replyingTo.imageUrls && replyingTo.imageUrls.length > 0 && (
              <View style={styles.imageRow}>
                {replyingTo.imageUrls.map((url, idx) => (
                  <Image key={idx} source={{ uri: url }} style={styles.reviewImage} />
                ))}
              </View>
            )}

            <Text style={styles.reviewContent}>{replyingTo.content}</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder="답글을 입력해주세요"
                multiline
                value={replyText}
                onChangeText={setReplyText}
                maxLength={300}
              />
              <Text style={styles.charCount}>{replyText.length}/300</Text>
            </View>

            <Text style={styles.warningText}>
              작성하신 답글에 부적절한 단어가 포함될 경우 답글이 삭제될 수 있습니다.
            </Text>

            <TouchableOpacity
              style={styles.fullSaveButton}
              onPress={saveReply}
            >
              <Ionicons name="chatbubble-outline" size={rs(18)} color="white" style={{ marginRight: rs(8) }} />
              <Text style={styles.fullSaveButtonText}>{editingReplyId ? '수정 완료' : '답글 달기'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isReplyMode ? (
        renderReplyView()
      ) : isReviewsLoading && !isPopupRefreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#34B262" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <LookyLogo
            width={rs(120)}
            height={rs(37)}
            style={styles.logo}
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
                      <View style={[styles.profileCircle, { backgroundColor: getProfileColor(review.nickname) }]} />
                      <Text style={styles.authorName}>{review.nickname}</Text>


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
                          onPress={() => openReplyModal(review)}
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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(4) }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(6) }}>
                            <Text style={styles.replyLabel}>사장님 답글</Text>
                            <Text style={styles.replyDate}>{formatDate(reply.createdAt)}</Text>
                          </View>
                          {!reply.isLocal && (
                            <View style={{ flexDirection: 'row', gap: rs(8) }}>
                              <TouchableOpacity onPress={() => openReplyModal(review, reply)}>
                                <Text style={{ fontSize: rs(11), color: '#828282' }}>수정</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteReply(reply.reviewId, review.reviewId)}>
                                <Text style={{ fontSize: rs(11), color: '#FF3E41' }}>삭제</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <Text style={styles.replyContent}>{reply.content}</Text>
                      </View>
                    )}

                  </View>
                );
              })
            )}
          </View>

        </ScrollView>
      )}

      <ErrorPopup
        visible={isErrorPopupVisible}
        type="NETWORK"
        isRefreshing={isPopupRefreshing}
        onRefresh={handleErrorRefresh}
        onClose={() => setIsErrorPopupVisible(false)}
      />

    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, },
  scrollContent: { paddingTop: rs(10), paddingBottom: rs(40), paddingHorizontal: rs(20) },

  logo: { width: rs(120), height: rs(37), marginBottom: rs(10), marginLeft: rs(-10) },
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
  // Reply View Styles
  replyViewContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(20),
    paddingVertical: rs(15),
    backgroundColor: 'white',
  },
  replyTitle: { fontSize: rs(18), fontWeight: '700', color: 'black' },
  replyScrollContent: { padding: rs(20) },
  replyCard: {
    backgroundColor: 'white',
    borderRadius: rs(15),
    padding: rs(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: rs(10),
    elevation: 3,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: rs(12),
    padding: rs(15),
    marginTop: rs(10),
    minHeight: rs(180),
  },
  replyInput: {
    fontSize: rs(14),
    color: 'black',
    textAlignVertical: 'top',
    minHeight: rs(140),
  },
  charCount: {
    textAlign: 'right',
    fontSize: rs(12),
    color: '#828282',
    marginTop: rs(5),
  },
  warningText: {
    fontSize: rs(12),
    color: '#BDBDBD',
    lineHeight: rs(18),
    marginTop: rs(20),
    marginBottom: rs(40),
  },
  fullSaveButton: {
    backgroundColor: '#34B262',
    borderRadius: rs(12),
    height: rs(50),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#34B262",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: rs(8),
    elevation: 4,
  },
  fullSaveButtonText: {
    color: 'white',
    fontSize: rs(16),
    fontWeight: '700',
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
  replyLabel: { fontSize: rs(11), color: '#34B262' },
  replyDate: { fontSize: rs(9), color: '#828282' },
  replyContent: { fontSize: rs(11), color: 'black', lineHeight: rs(18) },

});