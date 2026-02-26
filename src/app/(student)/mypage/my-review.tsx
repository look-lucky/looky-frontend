import type { PageResponseReviewResponse } from '@/src/api/generated.schemas';
import { useGetStudentInfo } from '@/src/api/my-page';
import { useDeleteReview, useGetMyReviews } from '@/src/api/review';
import { AppButton } from '@/src/shared/common/app-button';
import { AppPopup } from '@/src/shared/common/app-popup';
import { ErrorPopup } from '@/src/shared/common/error-popup';
import { rs } from '@/src/shared/theme/scale';
import { Brand, Gray, Text as TextColor } from '@/src/shared/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyReview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: myReviewsRes, refetch } = useGetMyReviews({
    pageable: { page: 0, size: 100 },
  });

  const { data: studentInfoRes } = useGetStudentInfo();
  const nickname = (studentInfoRes as any)?.data?.data?.nickname ?? '나';

  const allReviews = useMemo(() => {
    const raw = (myReviewsRes as any)?.data?.data as
      | PageResponseReviewResponse
      | undefined;
    return raw?.content ?? [];
  }, [myReviewsRes]);

  // ownerReply(= isOwnerReply)는 루트 리뷰에 "사장님 답글 달림" bool로 옴 (별도 reply 객체 아님)
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);
  const [networkErrorVisible, setNetworkErrorVisible] = useState(false);
  const [deleteApiErrorVisible, setDeleteApiErrorVisible] = useState(false);

  const { mutate: deleteReview } = useDeleteReview();

  const toggleMenu = (id: number) =>
    setActiveMenuId((prev) => (prev === id ? null : id));

  const closeMenu = () => setActiveMenuId(null);

  const handleCardPress = (storeId?: number) => {
    if (!storeId) return;
    router.push(`/store/${storeId}?tab=review`);
  };

  const handleEditPress = (id: number) => {
    closeMenu();
    const review = allReviews.find((r) => r.reviewId === id);
    if (!review) return;
    const imageUrlsParam = review.imageUrls && review.imageUrls.length > 0
      ? encodeURIComponent(JSON.stringify(review.imageUrls))
      : '';
    router.push(
      `/mypage/edit-review?reviewId=${review.reviewId}&storeName=${encodeURIComponent(review.storeName ?? '')}&rating=${review.rating}&content=${encodeURIComponent(review.content ?? '')}&imageUrls=${imageUrlsParam}`
    );
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
          refetch();
          setDeletePopupVisible(false);
          setSelectedReviewId(null);
          setDeleteSuccessVisible(true);
        },
        onError: (error: any) => {
          setDeletePopupVisible(false);
          if (error?.status) {
            setDeleteApiErrorVisible(true);
          } else {
            setNetworkErrorVisible(true);
          }
        },
      }
    );
  };

  return (
    <TouchableWithoutFeedback onPress={closeMenu}>
      <View style={[styles.container, { paddingTop: insets.top }]}>

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
            <Text style={{ fontWeight: '600' }}>{nickname}</Text>님은 지금까지{' '}
            <Text style={{ fontWeight: '700', color: '#34B262' }}>
              {allReviews.length}번
            </Text>
            의 소중한 기록을{'\n'}남겨주셨어요! ✍🏻
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {allReviews.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>작성한 리뷰가 없습니다</Text>
            </View>
          )}

          {allReviews.map((review) => {
            const hasReply = review.ownerReply ?? false;
            const dateStr = review.createdAt
              ? new Date(review.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              : '';
            return (
              <View
                key={review.reviewId}
                style={styles.reviewCard}
              >
                <View style={styles.reviewHeader}>
                  <TouchableOpacity
                    onPress={() => handleCardPress(review.storeId)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.storeName}>{review.storeName}</Text>
                    <Text style={styles.reviewDate}>{dateStr}</Text>
                  </TouchableOpacity>
                  <View style={{ position: 'relative', zIndex: 10 }}>
                    <TouchableOpacity
                      onPress={() => toggleMenu(review.reviewId!)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="ellipsis-vertical" size={rs(16)} color="#BDBDBD" />
                    </TouchableOpacity>
                    {activeMenuId === review.reviewId && (
                      <View style={styles.menuPopup}>
                        {!hasReply && (
                          <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleEditPress(review.reviewId!)}
                          >
                            <Text style={styles.menuText}>수정</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => handleDeletePress(review.reviewId!)}
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
                      color={i < (review.rating ?? 0) ? '#FBBC05' : '#E0E0E0'}
                    />
                  ))}
                </View>

                {/* 리뷰 이미지 */}
                {review.imageUrls && review.imageUrls.length > 0 && (
                  <View style={styles.imageContainer}>
                    {review.imageUrls.map((url, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: url }}
                        style={styles.reviewImage}
                      />
                    ))}
                  </View>
                )}

                <Text style={styles.reviewContent}>{review.content}</Text>

                {hasReply && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.replySection}>
                      <View style={styles.replyHeader}>
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
                      </View>
                    </View>
                  </>
                )}
              </View>
            );
          })}
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
              <View style={styles.popupBtnRow}>
                <AppButton
                  label="아니요"
                  backgroundColor={Gray.gray5}
                  style={styles.popupBtnHalf}
                  onPress={() => setDeletePopupVisible(false)}
                />
                <AppButton
                  label="삭제할게요"
                  backgroundColor={Brand.primaryDarken}
                  style={styles.popupBtnHalf}
                  onPress={confirmDelete}
                />
              </View>
            </View>
          </View>
        </Modal>

        <AppPopup
          visible={deleteSuccessVisible}
          title="리뷰가 삭제되었습니다"
          onClose={() => setDeleteSuccessVisible(false)}
        />

        <ErrorPopup
          visible={networkErrorVisible}
          type="NETWORK"
          onRefresh={() => {
            setNetworkErrorVisible(false);
            confirmDelete();
          }}
          onClose={() => {
            setNetworkErrorVisible(false);
            setSelectedReviewId(null);
          }}
        />

        <AppPopup
          visible={deleteApiErrorVisible}
          title="리뷰 삭제에 실패했어요"
          subtitle="다시 시도해주세요"
          onClose={() => setDeleteApiErrorVisible(false)}
        />
      </View>
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
    backgroundColor: 'rgba(52, 178, 98, 0.08)',
    borderRadius: rs(12),
    paddingVertical: rs(12),
    paddingHorizontal: rs(15),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
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
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(8),
    marginBottom: rs(8),
  },
  reviewImage: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(8),
    backgroundColor: '#E0E0E0',
  },
  reviewContent: {
    fontSize: rs(14),
    color: 'black',
    fontFamily: 'Pretendard',
    lineHeight: rs(20),
    marginBottom: rs(12),
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: rs(12),
    marginHorizontal: -rs(20),
  },
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
    backgroundColor: Gray.popupBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: rs(335),
    backgroundColor: Gray.white,
    borderRadius: rs(10),
    paddingTop: rs(40),
    paddingBottom: rs(25),
    paddingHorizontal: rs(20),
    alignItems: 'center',
    gap: rs(20),
    shadowColor: Gray.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  popupTextContainer: {
    alignItems: 'center',
    gap: rs(8),
  },
  popupTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: TextColor.primary,
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
  popupSubtitle: {
    fontSize: rs(14),
    fontWeight: '500',
    color: TextColor.placeholder,
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
  popupBtnRow: {
    flexDirection: 'row',
    gap: rs(8),
  },
  popupBtnHalf: {
    flex: 1,
  },
  popupBtnFull: {
    width: rs(295),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: rs(80),
  },
  emptyText: {
    fontSize: rs(14),
    fontWeight: '400',
    color: '#828282',
    fontFamily: 'Pretendard',
  },
});
