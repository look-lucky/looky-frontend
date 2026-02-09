import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useGetStoreNewsList } from '@/src/api/store-news';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';

export default function StoreNewsScreen({ navigation, route }) {
    const { storeId } = route.params || {};

    // API Query
    const { data: newsResponse, isLoading, refetch } = useGetStoreNewsList(storeId, {
        pageable: { page: 0, size: 20, sort: ['createdAt,desc'] }
    }, {
        enabled: !!storeId
    });

    const newsList = newsResponse?.data?.data?.content || [];

    const handleAddNews = () => {
        navigation.navigate('StoreNewsWrite', { storeId });
    };

    useFocusEffect(
        useCallback(() => {
            if (storeId) {
                refetch();
            }
        }, [storeId, refetch])
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#F7F7F7' }} />

            {/* 1. 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* 2. 타이틀 영역 */}
                <View style={styles.titleArea}>
                    <View style={styles.titleTextGroup}>
                        <Text style={styles.pageTitle}>매장 소식</Text>
                        <Text style={styles.pageSubtitle}>손님에게 전할 매장의 소식을 작성해주세요</Text>
                    </View>

                    {/* 소식 추가하기 버튼 (우측 상단) */}
                    <TouchableOpacity style={styles.addBtn} onPress={handleAddNews} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="add" size={rs(14)} color="#34B262" />
                        <Text style={styles.addBtnText}>소식 추가하기</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. 소식 리스트 */}
                <View style={styles.listContainer}>
                    {isLoading ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#888' }}>로딩중...</Text>
                        </View>
                    ) : newsList.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#888' }}>등록된 소식이 없습니다.</Text>
                        </View>
                    ) : (
                        newsList.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.newsCard}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('StoreNewsDetail', { newsItem: item, storeId })}
                            >
                                {/* 카드 헤더 (아이콘/라벨 + 날짜) */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.labelRow}>
                                        <Ionicons name="megaphone" size={rs(16)} color="#309821" />
                                        <Text style={styles.labelText}>소식</Text>
                                    </View>
                                    <Text style={styles.dateText}>{item.createdAt ? item.createdAt.substring(0, 10) : ''}</Text>
                                </View>

                                {/* 카드 내용 (제목) */}
                                <View style={styles.cardBody}>
                                    <Text style={styles.newsTitle}>{item.title}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7' },

    header: {
        paddingHorizontal: rs(20),
        paddingVertical: rs(10),
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#F7F7F7',
    },

    content: {
        paddingHorizontal: rs(20),
        paddingTop: rs(10),
        paddingBottom: rs(50)
    },

    // 타이틀 영역
    titleArea: {
        marginBottom: rs(30),
        position: 'relative',
        height: rs(60), // 높이 확보
        justifyContent: 'center'
    },
    titleTextGroup: {
        gap: rs(5),
    },
    pageTitle: {
        fontSize: rs(20),
        fontWeight: '600',
        color: 'black',
        fontFamily: 'Pretendard',
        lineHeight: rs(24),
    },
    pageSubtitle: {
        fontSize: rs(14),
        fontWeight: '600',
        color: '#A6A6A6',
        fontFamily: 'Pretendard',
        lineHeight: rs(19.6),
    },

    // 소식 추가하기 버튼
    addBtn: {
        position: 'absolute',
        top: rs(5),
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(2),
    },
    addBtnText: {
        fontSize: rs(12),
        fontWeight: '500',
        color: '#34B262',
        fontFamily: 'Pretendard',
        lineHeight: rs(12),
    },

    // 리스트 컨테이너
    listContainer: {
        gap: rs(9),
    },

    // 뉴스 카드
    newsCard: {
        backgroundColor: '#FBFBFB',
        borderRadius: rs(15),
        paddingHorizontal: rs(10),
        paddingVertical: rs(15),
        // 그림자 설정 (HTML: box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.25))
        shadowColor: "rgba(0, 0, 0, 0.25)",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
        gap: rs(5),
    },

    // 카드 헤더
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: rs(3),
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(5),
    },
    labelText: {
        fontSize: rs(14),
        fontWeight: '700',
        color: '#309821',
        fontFamily: 'Pretendard',
        lineHeight: rs(19.6),
    },
    dateText: {
        fontSize: rs(12),
        fontWeight: '400',
        color: '#828282',
        fontFamily: 'Pretendard',
        lineHeight: rs(16.8),
        width: rs(74),
        textAlign: 'right',
    },

    // 카드 내용
    cardBody: {
        // alignSelf: 'stretch',
    },
    newsTitle: {
        fontSize: rs(16),
        fontWeight: '600',
        color: 'black',
        fontFamily: 'Pretendard',
        lineHeight: rs(22.4),
    },
});