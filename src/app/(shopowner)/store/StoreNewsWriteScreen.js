import { getToken } from '@/src/shared/lib/auth/token';
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
    Alert,
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

export default function StoreNewsWriteScreen({ navigation, route }) {

    // 파라미터 확인 (수정 모드인지)
    const { isEdit, newsItem, storeId } = route.params || {};

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // 수정 모드라면 기존 데이터 채워넣기
    useEffect(() => {
        if (isEdit && newsItem) {
            setTitle(newsItem.title || '');
            setContent("안녕하세요.\n\n2월에 새로 선보일 케이크 메뉴 테스터 10분을 모집합니다~\n\n정성스러운 평가 남겨주실 분들은 좋아요와 댓글 남겨주세요."); // 예시 내용 (실제론 newsItem.content)
        }
    }, [isEdit, newsItem]);

    const queryClient = useQueryClient();



    // 직접 API 호출을 위한 함수
    const saveStoreNews = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert("알림", "제목과 내용을 모두 입력해주세요.");
            return;
        }

        try {
            // 1. 토큰 확보
            const tokenData = await getToken();
            const token = tokenData?.accessToken;

            // 2. FormData 생성
            const formData = new FormData();

            // 3. JSON 데이터를 문자열로 변환하여 'request' 파트에 담기
            const requestData = {
                title: title,
                content: content
            };

            formData.append("request", {
                string: JSON.stringify(requestData),
                type: "application/json",
                name: "request"
            });

            // 4. (옵션) 이미지 처리 - 현재는 미구현이므로 빈 배열인 경우 생략하거나 빈 리스트 전송?
            // BE가 images 파트를 필수로 요구한다면 빈 파일이라도 보내야 할 수 있음.
            // 일단은 images 파트를 보내지 않음 (Optional 가정)

            const url = isEdit && newsItem?.id
                ? `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/stores/${storeId}/news/${newsItem.id}` // 수정 API 경로 확인 필요
                : `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/stores/${storeId}/news`;

            const method = isEdit ? "PATCH" : "POST";

            console.log(`[StoreNews] ${method} Request to ${url}`);

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    // Content-Type은 설정하지 않음 (FormData가 자동 설정)
                },
                body: formData
            });

            const responseText = await response.text();
            console.log("[StoreNews] Response:", response.status, responseText);

            if (response.ok) {
                queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/news`] });
                Alert.alert("완료", isEdit ? "매장 소식이 수정되었습니다." : "매장 소식이 등록되었습니다.", [
                    { text: "확인", onPress: () => navigation.goBack() }
                ]);
            } else {
                throw new Error(`API Error: ${response.status} ${responseText}`);
            }

        } catch (error) {
            console.error("[StoreNews] Save Error:", error);
            Alert.alert("오류", "소식 저장 중 문제가 발생했습니다.");
        }
    };

    const handleSave = () => {
        saveStoreNews();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#F7F7F7' }} />

            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.titleArea}>
                        <Text style={styles.pageTitle}>매장 소식</Text>
                        <Text style={styles.pageSubtitle}>손님에게 전할 매장의 소식을 작성해주세요</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelText}>제목 </Text>
                                <Text style={styles.requiredStar}>*</Text>
                            </View>
                            <View style={styles.textInputBox}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="제목을 입력해주세요"
                                    placeholderTextColor="#828282"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelText}>내용</Text>
                                <Text style={styles.requiredStar}> *</Text>
                            </View>
                            <View style={styles.textAreaBox}>
                                <TextInput
                                    style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
                                    placeholder="손님에게 전하고 싶은 매장의 소식은 무엇인가요?"
                                    placeholderTextColor="#828282"
                                    multiline
                                    value={content}
                                    onChangeText={setContent}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>이미지</Text>
                            <TouchableOpacity style={styles.fileSelectBox} activeOpacity={0.7}>
                                <Text style={styles.filePlaceholder}>파일을 첨부해주세요</Text>
                                <Ionicons name="attach" size={rs(20)} color="#444444" style={{ transform: [{ rotate: '-45deg' }] }} />
                            </TouchableOpacity>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagePreviewRow}>
                                <View style={styles.previewBox} />
                                <View style={styles.previewBox} />
                                <View style={styles.previewBox} />
                                <View style={styles.previewBox} />
                            </ScrollView>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                        {/* 수정 모드일 때는 '수정하기', 아닐 때는 '매장 소식 저장' */}
                        <Text style={styles.saveBtnText}>{isEdit ? "수정하기" : "매장 소식 저장"}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7' },
    header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#F7F7F7' },
    content: { paddingHorizontal: rs(20), paddingTop: rs(10), paddingBottom: rs(100) },
    titleArea: { marginBottom: rs(20), justifyContent: 'center', paddingVertical: rs(10) },
    pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard', lineHeight: rs(24), marginBottom: rs(5) },
    pageSubtitle: { fontSize: rs(14), fontWeight: '600', color: '#A6A6A6', fontFamily: 'Pretendard', lineHeight: rs(19.6) },
    formContainer: { gap: rs(20), marginBottom: rs(20) },
    inputGroup: { gap: rs(10) },
    labelRow: { flexDirection: 'row', alignItems: 'center' },
    labelText: { fontSize: rs(16), fontWeight: '600', color: 'black', fontFamily: 'Pretendard', lineHeight: rs(22.4) },
    requiredStar: { fontSize: rs(16), fontWeight: '600', color: '#34B262', fontFamily: 'Pretendard', lineHeight: rs(22.4) },
    textInputBox: { height: rs(40), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', justifyContent: 'center', paddingHorizontal: rs(16) },
    textAreaBox: { height: rs(168), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', padding: rs(10) },
    textInput: { fontSize: rs(14), fontFamily: 'Pretendard', color: 'black', padding: 0, fontWeight: '500' },
    fileSelectBox: { height: rs(40), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(16) },
    filePlaceholder: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard' },
    imagePreviewRow: { flexDirection: 'row', gap: rs(5), marginTop: rs(5) },
    previewBox: { width: rs(100), height: rs(100), backgroundColor: '#D9D9D9', borderRadius: rs(4) },
    bottomContainer: { paddingHorizontal: rs(24), paddingBottom: rs(40), backgroundColor: '#F7F7F7' },
    saveBtn: { height: rs(40), backgroundColor: '#34B262', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
});