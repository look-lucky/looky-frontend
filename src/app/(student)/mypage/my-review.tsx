import { useDeleteReview } from '@/src/api/review';
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// TODO: 백엔드에 GET /api/my-reviews (내가 쓴 리뷰 목록 조회) 엔드포인트 요청 필요
type ReviewItem = {
  id: number;
  storeId: number;
  store: string;
  date: string;
  rating: number;
  content: string;
  photos: number;
  hasReply: boolean;
  replyDate?: string;
  replyContent?: string;
};

export default function MyReview() {
  const router = useRouter();

  // API 미구현 - GET /api/my-reviews 연동 시 교체 필요
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isReplyOpen, setIsReplyOpen] = useState<Record<number, boolean>>({});
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [editErrorPopupVisible, setEditErrorPopupVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const { mutate: deleteReview } = useDeleteReview();

  const toggleReply = (id: number) =>
    setIsReplyOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleMenu = (id: number) =>
    setActiveMenuId((prev) => (prev === id ? null : id));

  const closeMenu = () => setActiveMenuId(null);

  const handleEditPress = (id: number) => {
    closeMenu();
    const review = reviews.find((r) => r.id === id);
    if (!review) return;
    if (review.hasReply) {
      setEditErrorPopupVisible(true);
    } else {
      router.push(
        `/mypage/edit-review?reviewId=${review.id}&storeName=${encodeURIComponent(review.store)}&rating=${review.rating}&content=${encodeURIComponent(review.content)}`
      );
    }
  };

  const handleDeletePress = (id: number) => {
    closeMenu();
    setSelectedReviewId(id);
    setDeletePopupVisible(true);
  };

  const confirmDelete = () => {
    if (!selectedReviewId) return;
    deleteReview(
      { reviewId: selectedReviewId },
      {
        onSuccess: () => {
          setReviews((prev) => prev.filter((r) => r.id !== selectedReviewId));
          setDeletePopupVisible(false);
          setSelectedReviewId(null);
        },
      }
    );
  };

  return (
    <TouchableWithoutFeedback onPress={closeMenu}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>내가 쓴 리뷰</Text>
        </View>

        <View style={styles.summaryBanner}>
          <View style={styles.summaryIconBox}>
            <Ionicons name="pencil" size={rs(14)} color="#34B262" />
          </View>
          <Text style={styles.summaryText}>
            <Text style={{ fontWeight: '600' }}>니어딜</Text>님은 지금까지{' '}
            <Text style={{ fontWeight: '700', color: '#34B262' }}>
              {reviews.length}번
            </Text>
            의 소중한 기록을{'\n'}남겨주셨어요! ✍🏻
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.storeName}>{review.store}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={{ position: 'relative', zIndex: 10 }}>
                  <TouchableOpacity
                    onPress={() => toggleMenu(review.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="ellipsis-vertical" size={rs(16)} color="#BDBDBD" />
                  </TouchableOpacity>
                  {activeMenuId === review.id && (
                    <View style={styles.menuPopup}>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleEditPress(review.id)}
                      >
                        <Text style={styles.menuText}>수정</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleDeletePress(review.id)}
                      >
                        <Text style={styles.menuText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.starRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={rs(14)}
                    color={i < review.rating ? '#FBBC05' : '#E0E0E0'}
                  />
                ))}
              </View>

              <Text style={styles.reviewContent}>{review.content}</Text>

              {review.hasReply && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.replySection}>
                    <TouchableOpacity
                      style={styles.replyHeader}
                      onPress={() => toggleReply(review.id)}
                    >
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center', gap: rs(5) }}
                      >
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={rs(16)}
                          color="#444444"
                        />
                        <Text style={styles.replyTitle}>사장님 답글</Text>
                      </View>
                      <Ionicons
                        name={isReplyOpen[review.id] ? 'chevron-up' : 'chevron-down'}
                        size={rs(16)}
                        color="#828282"
                      />
                    </TouchableOpacity>
                    {isReplyOpen[review.id] && (
                      <View style={styles.replyContentBox}>
                        {review.replyDate ? (
                          <Text style={styles.replyDate}>{review.replyDate}</Text>
                        ) : null}
                        <Text style={styles.replyText}>{review.replyContent}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>
          ))}
          <View style={{ height: rs(50) }} />
        </ScrollView>

        <Modal
          transparent
          visible={deletePopupVisible}
          animationType="fade"
          onRequestClose={() => setDeletePopupVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.popupContainer}>
              <View style={styles.popupTextContainer}>
                <Text style={styles.popupTitle}>리뷰를 삭제하시겠어요?</Text>
                <Text style={styles.popupSubtitle}>삭제된 리뷰는 복구할 수 없어요</Text>
              </View>
              <View style={styles.popupBtnContainer}>
                <TouchableOpacity
                  style={styles.popupBtnGray}
                  onPress={() => setDeletePopupVisible(false)}
                >
                  <Text style={styles.popupBtnTextWhite}>아니요</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.popupBtnGreen} onPress={confirmDelete}>
                  <Text style={styles.popupBtnTextWhite}>삭제할게요</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          visible={editErrorPopupVisible}
          animationType="fade"
          onRequestClose={() => setEditErrorPopupVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.popupContainer}>
              <View style={styles.popupTextContainer}>
                <Text style={styles.popupTitle}>리뷰를 수정할 수 없어요</Text>
                <Text style={styles.popupSubtitle}>
                  사장님이 답글을 남겨주셔서 수정이 불가합니다.
                </Text>
              </View>
              <View style={styles.popupBtnContainerOne}>
                <TouchableOpacity
                  style={styles.popupBtnFullGreen}
                  onPress={() => setEditErrorPopupVisible(false)}
                >
                  <Text style={styles.popupBtnTextWhite}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { paddingHorizontal: rs(20), paddingTop: rs(10), paddingBottom: rs(10) },
  titleContainer: { paddingHorizontal: rs(20), marginBottom: rs(15) },
  titleText: {
    fontSize: rs(20),
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Pretendard',
  },
  summaryBanner: {
    marginHorizontal: rs(20),
    marginBottom: rs(20),
    backgroundColor: 'rgba(52, 178, 98, 0.10)',
    borderRadius: rs(12),
    paddingVertical: rs(12),
    paddingHorizontal: rs(15),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryIconBox: {
    width: rs(42),
    height: rs(42),
    borderRadius: rs(12),
    backgroundColor: 'rgba(52, 178, 98, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: rs(13),
    fontFamily: 'Inter',
    color: 'black',
    lineHeight: rs(19),
  },
  scrollContent: { paddingHorizontal: rs(20) },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: rs(12),
    padding: rs(20),
    marginBottom: rs(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: rs(8),
    zIndex: 2,
  },
  storeName: {
    fontSize: rs(16),
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Pretendard',
    marginBottom: rs(2),
  },
  reviewDate: { fontSize: rs(12), color: '#828282', fontFamily: 'Pretendard' },
  starRow: { flexDirection: 'row', gap: rs(2), marginBottom: rs(10) },
  reviewContent: {
    fontSize: rs(14),
    color: 'black',
    fontFamily: 'Pretendard',
    lineHeight: rs(20),
    marginBottom: rs(12),
  },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: rs(12) },
  replySection: {},
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: rs(4),
  },
  replyTitle: {
    fontSize: rs(14),
    fontWeight: '700',
    color: '#444444',
    fontFamily: 'Pretendard',
  },
  replyContentBox: {
    marginTop: rs(10),
    backgroundColor: '#F5F5F5',
    borderRadius: rs(12),
    padding: rs(15),
  },
  replyDate: {
    fontSize: rs(12),
    color: '#828282',
    marginBottom: rs(5),
    fontFamily: 'Pretendard',
  },
  replyText: {
    fontSize: rs(14),
    color: 'black',
    fontFamily: 'Pretendard',
    lineHeight: rs(20),
  },
  menuPopup: {
    position: 'absolute',
    top: rs(20),
    right: 0,
    width: rs(78),
    backgroundColor: 'white',
    borderRadius: rs(5),
    paddingVertical: rs(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  menuItem: { paddingVertical: rs(6), alignItems: 'center', justifyContent: 'center' },
  menuText: {
    fontSize: rs(12),
    fontFamily: 'Pretendard',
    fontWeight: '400',
    color: '#545454',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: rs(335),
    backgroundColor: 'white',
    borderRadius: rs(10),
    paddingTop: rs(40),
    paddingBottom: rs(25),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  popupTextContainer: {
    alignItems: 'center',
    marginBottom: rs(20),
    paddingHorizontal: rs(10),
  },
  popupTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Pretendard',
    marginBottom: rs(5),
    textAlign: 'center',
  },
  popupSubtitle: {
    fontSize: rs(14),
    fontWeight: '500',
    color: '#828282',
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
  popupBtnContainer: { flexDirection: 'row', gap: rs(7) },
  popupBtnGray: {
    width: rs(150),
    paddingVertical: rs(10),
    backgroundColor: '#D5D5D5',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBtnGreen: {
    width: rs(150),
    paddingVertical: rs(10),
    backgroundColor: '#34B262',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBtnTextWhite: {
    fontSize: rs(14),
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Pretendard',
  },
  popupBtnContainerOne: { width: '100%', alignItems: 'center' },
  popupBtnFullGreen: {
    width: rs(300),
    paddingVertical: rs(10),
    backgroundColor: '#34B262',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
