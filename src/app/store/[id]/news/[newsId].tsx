import { StoreIcons } from "@/assets/images/icons/store";
import { ArrowLeft } from "@/src/components/button/arrow-left";
import { Divider } from "@/src/components/common/divider";
import { ThemedText } from "@/src/components/themed-text";
import { DUMMY_STORE_DETAILS } from "@/src/data/mock/store";
import { rs } from "@/src/theme/scale";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 임시 댓글 데이터
const DUMMY_COMMENTS = [
    { id: '1', nickname: '나어딜화이팅', content: '저요 저 할래요 저 아니면 안돼요 제발 저요', color: '#FF6B6B' },
    { id: '2', nickname: '배고프당', content: '사장님 ~ 테스터 참여해보고 싶습니다!', color: '#4ECDC4' },
    { id: '3', nickname: '두쫀쿠에게로간다', content: '두푼쿠케이크도 만들어주시면 안될까요? ㅠㅠ', color: '#45B7D1' },
];

export default function NewsDetailScreen() {
    const { id: storeId, newsId } = useLocalSearchParams();

    // TODO: API 연동 시 fetch로 교체
    const store = DUMMY_STORE_DETAILS.find((s) => s.id === storeId);
    const news = store?.news.find((n) => n.id === newsId);

    if (!store || !news) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <ArrowLeft onPress={() => router.back()} />
                </View>
                <ThemedText lightColor="#1d1b20">소식을 찾을 수 없습니다.</ThemedText>
            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: rs(20) }}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <ArrowLeft onPress={() => router.back()} />
                    </View>

                    {/* 가게 이름 */}
                    <ThemedText type="subtitle" lightColor="#000000">{store.name}</ThemedText>

                    {/* 소식 + 날짜 */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <StoreIcons.notice width={24} height={24} />
                            <ThemedText type="default" lightColor="#309821">{news.type}</ThemedText>
                        </View>
                        <ThemedText type="default" lightColor="#999">{news.date}</ThemedText>
                    </View>

                    {/* 제목 */}
                    <ThemedText type="subtitle" lightColor="#000000">{news.title}</ThemedText>

                    {/* 본문 */}
                    <ThemedText lightColor="#828282">{news.content}</ThemedText>

                    {/* 이미지 슬라이더 */}
                    <FlatList
                        horizontal
                        scrollEnabled={false}
                        showsHorizontalScrollIndicator={false}
                        data={[1, 2, 3, 4]}
                        keyExtractor={(item) => item.toString()}
                        contentContainerStyle={{ gap: 8 }}
                        renderItem={() => (
                            <View style={{ width: 120, height: 120, backgroundColor: '#E5E5E5', borderRadius: 8 }} />
                        )}
                    />

                    {/* 좋아요/댓글 카운트 */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'flex-end' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <StoreIcons.favorite width={20} height={20} />
                            <ThemedText lightColor="#000000">5</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <StoreIcons.speechBubble width={20} height={20} />
                            <ThemedText lightColor="#000000">1</ThemedText>
                        </View>
                    </View>

                    <Divider />

                    {/* 댓글 목록 */}
                    {DUMMY_COMMENTS.map((comment) => (
                        <View key={comment.id} style={{ flexDirection: 'row', gap: 12 }}>
                            {/* 프로필 */}
                            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: comment.color }} />
                            {/* 내용 */}
                            <View style={{ flex: 1 }}>
                                <ThemedText lightColor="#1d1b20" style={{ fontWeight: '600' }}>{comment.nickname}</ThemedText>
                                <ThemedText lightColor="#333">{comment.content}</ThemedText>
                            </View>
                            {/* 더보기 */}
                            <TouchableOpacity onPress={() => Alert.alert(
                                '댓글 관리',
                                '',
                                [
                                    { text: '수정', onPress: () => Alert.alert('수정 클릭') },
                                    { text: '삭제', onPress: () => Alert.alert('삭제 클릭'), style: 'destructive' },
                                    { text: '취소', style: 'cancel' },
                                ]
                            )}>
                                <ThemedText lightColor="#999">⋯</ThemedText>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                {/* 댓글 입력창 (하단 고정) */}
                <View style={styles.commentInput}>
                    {/* 프로필 */}
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF6B6B' }} />
                    {/* 입력창 */}
                    <TextInput
                        style={styles.textInput}
                        placeholder="댓글 쓰기"
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity onPress={() => Alert.alert('알림', '댓글이 등록되었습니다.')}>
                        <StoreIcons.paperPlane width={rs(24)} height={rs(24)} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
    },
    header: {
        paddingVertical: 12,
        alignItems: "flex-start",
    },
    commentInput: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
    },
    textInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 16,
        color: '#111111',
    },
});
