import { useState } from 'react';
import { StoreIcons } from "@/assets/images/icons/store";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { Divider } from "@/src/shared/common/divider";
import { ThemedText } from '@/src/shared/common/themed-text';
import {
    useGetStoreNews,
    useGetComments,
    useCreateComment,
    useDeleteComment,
    useToggleLike,
    getGetStoreNewsQueryKey,
    getGetCommentsQueryKey,
} from "@/src/api/store-news";
import { useGetStore } from "@/src/api/store";
import { rs } from "@/src/shared/theme/scale";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from '@tanstack/react-query';
import type { StoreNewsResponse, StoreResponse } from "@/src/api/generated.schemas";

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export default function NewsDetailScreen() {
    const { id: storeId, newsId } = useLocalSearchParams<{ id: string; newsId: string }>();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');

    const newsIdNum = Number(newsId);
    const storeIdNum = Number(storeId);

    const { data: newsRes } = useGetStoreNews(newsIdNum);
    const news = (newsRes as any)?.data?.data as StoreNewsResponse | undefined;

    const { data: storeRes } = useGetStore(storeIdNum);
    const store = (storeRes as any)?.data?.data as StoreResponse | undefined;

    const { data: commentsRes } = useGetComments(newsIdNum, { page: 0, size: 50 } as any);
    const comments = ((commentsRes as any)?.data?.data?.content ?? []) as Array<{
        id?: number;
        content?: string;
        mine?: boolean;
    }>;

    const { mutate: toggleLike } = useToggleLike();
    const { mutate: createComment } = useCreateComment();
    const { mutate: deleteComment } = useDeleteComment();

    const handleLike = () => {
        toggleLike({ newsId: newsIdNum }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getGetStoreNewsQueryKey(newsIdNum) });
            },
        });
    };

    const handleCreateComment = () => {
        if (!commentText.trim()) return;
        createComment({ newsId: newsIdNum, data: { content: commentText } }, {
            onSuccess: () => {
                setCommentText('');
                queryClient.invalidateQueries({ queryKey: getGetCommentsQueryKey(newsIdNum) });
                queryClient.invalidateQueries({ queryKey: getGetStoreNewsQueryKey(newsIdNum) });
            },
        });
    };

    const handleDeleteComment = (commentId: number) => {
        Alert.alert('댓글 삭제', '댓글을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제', style: 'destructive', onPress: () => {
                    deleteComment({ newsId: newsIdNum, commentId }, {
                        onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: getGetCommentsQueryKey(newsIdNum) });
                            queryClient.invalidateQueries({ queryKey: getGetStoreNewsQueryKey(newsIdNum) });
                        },
                    });
                },
            },
        ]);
    };

    if (!news) {
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
                    <View style={styles.header}>
                        <ArrowLeft onPress={() => router.back()} />
                    </View>

                    <ThemedText type="subtitle" lightColor="#000000">{store?.name ?? ''}</ThemedText>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <StoreIcons.notice width={24} height={24} />
                            <ThemedText type="default" lightColor="#309821">소식</ThemedText>
                        </View>
                        <ThemedText type="default" lightColor="#999">{formatDate(news.createdAt)}</ThemedText>
                    </View>

                    <ThemedText type="subtitle" lightColor="#000000">{news.title}</ThemedText>

                    <ThemedText lightColor="#828282">{news.content}</ThemedText>

                    {news.imageUrls && news.imageUrls.length > 0 && (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={news.imageUrls}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            contentContainerStyle={{ gap: 8 }}
                            renderItem={({ item }) => (
                                <Image source={{ uri: item }} style={{ width: 120, height: 120, borderRadius: 8 }} />
                            )}
                        />
                    )}

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'flex-end' }}>
                        <TouchableOpacity onPress={handleLike} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <StoreIcons.favorite width={20} height={20} />
                            <ThemedText lightColor="#000000">{news.likeCount ?? 0}</ThemedText>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <StoreIcons.speechBubble width={20} height={20} />
                            <ThemedText lightColor="#000000">{news.commentCount ?? 0}</ThemedText>
                        </View>
                    </View>

                    <Divider />

                    {comments.map((comment) => (
                        <View key={comment.id} style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E5E5' }} />
                            <View style={{ flex: 1 }}>
                                <ThemedText lightColor="#333">{comment.content}</ThemedText>
                            </View>
                            {comment.mine && (
                                <TouchableOpacity onPress={() => handleDeleteComment(comment.id!)}>
                                    <ThemedText lightColor="#999">⋯</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.commentInput}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E5E5' }} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="댓글 쓰기"
                        placeholderTextColor="#999"
                        value={commentText}
                        onChangeText={setCommentText}
                    />
                    <TouchableOpacity onPress={handleCreateComment}>
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
