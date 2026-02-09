import { useDeleteStoreNews } from '@/src/api/store-news';
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

// [더미 데이터] 댓글 예시
const COMMENTS = [
    { id: 1, user: '니어딜화이팅', content: '저요 저 할래요 저 아니면 안돼요 제발 저요', color: '#FF437C' },
    { id: 2, user: '배고프당', content: '사장님 ~ 테스터로 참여해보고 싶습니다!', color: '#5F6AA9' },
    { id: 3, user: '두쫀쿠에게로간다', content: '두쫀쿠케이크도 만들어주시면 안될까요? ㅠㅠ', color: '#5E8B58' },
];

export default function StoreNewsDetailScreen({ navigation, route }) {

    const { newsItem, storeId } = route.params || {};
    const [deleteModalVisible, setDeleteModalVisible] = useState(false); // 삭제 팝업 상태

    const queryClient = useQueryClient();

    // 삭제 Mutation
    const deleteMutation = useDeleteStoreNews({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/news`] });
                Alert.alert("완료", "소식이 삭제되었습니다.", [
                    { text: "확인", onPress: () => navigation.goBack() }
                ]);
            },
            onError: (error) => {
                console.error(error);
                Alert.alert("오류", "소식 삭제 중 문제가 발생했습니다.");
            }
        }
    });

    // 수정 버튼 핸들러
    const handleEdit = () => {
        // 쓰기 페이지로 이동하되, 현재 데이터를 넘겨줌 (수정 모드)
        navigation.navigate('StoreNewsWrite', {
            newsItem: newsItem,
            isEdit: true,
            storeId: storeId
        });
    };

    // 삭제 확인 핸들러
    const confirmDelete = () => {
        setDeleteModalVisible(false);
        if (newsItem?.id) {
            deleteMutation.mutate({ newsId: newsItem.id });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

            {/* 1. 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* 2. 가게 이름 및 날짜 */}
                <View style={styles.topSection}>
                    <Text style={styles.storeName}>평화와 평화 구내매점</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.tagBox}>
                            <Ionicons name="megaphone" size={rs(16)} color="#309821" />
                            <Text style={styles.tagText}>소식</Text>
                        </View>
                        <Text style={styles.dateText}>{newsItem?.createdAt ? newsItem.createdAt.substring(0, 10) : ""}</Text>
                    </View>
                </View>

                {/* 3. 본문 내용 */}
                <View style={styles.bodySection}>
                    <View style={styles.titleRow}>
                        <Text style={styles.newsTitle}>{newsItem?.title || ""}</Text>
                        <View style={styles.editDeleteBox}>
                            <TouchableOpacity onPress={handleEdit}><Text style={styles.actionText}>수정</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setDeleteModalVisible(true)}><Text style={styles.actionText}>삭제</Text></TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.newsContent}>
                        {newsItem?.content || ""}
                    </Text>

                    {/* 이미지 영역 (3개) */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
                        <View style={styles.imageBox} />
                        <View style={styles.imageBox} />
                        <View style={styles.imageBox} />
                    </ScrollView>
                </View>

                {/* 4. 통계 및 구분선 */}
                <View style={styles.statsSection}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="heart-outline" size={rs(18)} color="black" />
                            <Text style={styles.statText}>5</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="chatbubble-outline" size={rs(18)} color="black" />
                            <Text style={styles.statText}>1</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                </View>

                {/* 5. 댓글 리스트 */}
                <View style={styles.commentList}>
                    {COMMENTS.map((comment) => (
                        <View key={comment.id} style={styles.commentItem}>
                            <View style={[styles.avatar, { backgroundColor: comment.color }]} />
                            <View style={styles.commentTextBox}>
                                <Text style={styles.commentUser}>{comment.user}</Text>
                                <Text style={styles.commentContent}>{comment.content}</Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* ==================== 삭제 커스텀 팝업 ==================== */}
            <Modal transparent visible={deleteModalVisible} animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDeleteModalVisible(false)}>
                    <TouchableWithoutFeedback>
                        <View style={styles.popupContainer}>
                            <View style={styles.popupTextGroup}>
                                <Text style={styles.popupTitle}>소식을 삭제하시겠어요?</Text>
                                <Text style={styles.popupDesc}>
                                    소식 삭제 시 해당 소식 정보는 복구가 불가능합니다.{'\n'}
                                    정말로 삭제하시겠어요?
                                </Text>
                            </View>
                            <View style={styles.popupBtnGroup}>
                                <TouchableOpacity style={styles.popupCancelBtn} onPress={() => setDeleteModalVisible(false)}>
                                    <Text style={styles.popupCancelText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.popupDeleteBtn} onPress={confirmDelete}>
                                    <Text style={styles.popupDeleteText}>삭제하기</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },

    header: {
        paddingHorizontal: rs(20),
        paddingVertical: rs(10),
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: 'white',
    },

    content: {
        paddingHorizontal: rs(20),
        paddingBottom: rs(50)
    },

    // 상단 스타일
    topSection: { marginTop: rs(10), gap: rs(10) },
    storeName: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', lineHeight: rs(30) },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: rs(10) },
    tagBox: { flexDirection: 'row', alignItems: 'center', gap: rs(5) },
    tagText: { fontSize: rs(14), fontWeight: '700', color: '#309821', fontFamily: 'Pretendard' },
    dateText: { fontSize: rs(12), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard' },

    // 본문 스타일
    bodySection: { gap: rs(20), marginTop: rs(10) },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    newsTitle: { fontSize: rs(18), fontWeight: '600', color: 'black', fontFamily: 'Inter' },
    editDeleteBox: { flexDirection: 'row', gap: rs(10) },
    actionText: { fontSize: rs(12), fontWeight: '600', color: '#828282', fontFamily: 'Pretendard' },
    newsContent: { fontSize: rs(14), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard', lineHeight: rs(19.6) },
    imageScroll: { flexDirection: 'row', gap: rs(5) },
    imageBox: { width: rs(150), height: rs(150), backgroundColor: '#D9D9D9', marginRight: rs(5) },

    // 통계 및 댓글
    statsSection: { marginTop: rs(20), gap: rs(10), alignItems: 'flex-end' },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: rs(15) },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: rs(5) },
    statText: { fontSize: rs(12), fontWeight: '500', color: 'black', fontFamily: 'Pretendard' },
    divider: { width: '100%', height: 1, backgroundColor: '#E6E6E6' },
    commentList: { marginTop: rs(15), gap: rs(15) },
    commentItem: { flexDirection: 'row', alignItems: 'center', gap: rs(10) },
    avatar: { width: rs(33), height: rs(33), borderRadius: rs(16.5) },
    commentTextBox: { gap: rs(3) },
    commentUser: { fontSize: rs(10), fontWeight: '700', color: 'black', fontFamily: 'Pretendard' },
    commentContent: { fontSize: rs(10), fontWeight: '400', color: 'black', fontFamily: 'Pretendard' },

    // [팝업 스타일]
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    popupContainer: { width: rs(335), backgroundColor: 'white', borderRadius: rs(10), paddingVertical: rs(26), paddingHorizontal: rs(14), alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
    popupTextGroup: { marginBottom: rs(25), alignItems: 'center', gap: rs(10) },
    popupTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', textAlign: 'center' },
    popupDesc: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', textAlign: 'center', lineHeight: rs(20) },
    popupBtnGroup: { flexDirection: 'row', gap: rs(7), width: '100%' },
    popupCancelBtn: { flex: 1, height: rs(40), backgroundColor: '#D5D5D5', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
    popupCancelText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
    popupDeleteBtn: { flex: 1, height: rs(40), backgroundColor: '#FF6200', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
    popupDeleteText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
});