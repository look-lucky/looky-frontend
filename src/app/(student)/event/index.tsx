import { customFetch } from '@/src/api/mutator';
import { ArrowLeft } from '@/src/shared/common/arrow-left';
import { ThemedText } from '@/src/shared/common/themed-text';
import { useMapNavigationStore } from '@/src/shared/stores/map-navigation-store';
import { rs } from '@/src/shared/theme/scale';
import { Fonts, Gray, Primary } from '@/src/shared/theme/theme';
import type { Event, EventType } from '@/src/shared/types/event';
import { EVENT_TYPE_LABELS, getDDay, getEventStatus, isEventVisible } from '@/src/shared/types/event';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    type ImageSourcePropType,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EVENT_TYPE_IMAGES: Record<EventType, ImageSourcePropType> = {
    FOOD_EVENT: require('@/assets/images/icons/map/event-food.png'),
    POPUP_STORE: require('@/assets/images/icons/map/event-brand.png'),
    SCHOOL_EVENT: require('@/assets/images/icons/map/event-college.png'),
    FLEA_MARKET: require('@/assets/images/icons/map/event-market.png'),
    PERFORMANCE: require('@/assets/images/icons/map/event-busking.png'),
    STUDENT_EVENT: require('@/assets/images/icons/map/event-student.png'),
};

const getEventTheme = (dDay: string | null, isLive?: boolean) => {
    if (isLive) return { badge: '🔥 진행중', color: '#FF6B35', gradient: ['#FFF0EB', '#FFF5F2'] as [string, string] };
    if (dDay === 'D-DAY') return { badge: 'D-DAY', color: '#61ADE3', gradient: ['#E3EFF9', '#EFF9FE'] as [string, string] };
    if (dDay !== null) {
        const num = parseInt(dDay.replace('D-', ''), 10);
        if (num <= 1) return { badge: dDay, color: '#FA726B', gradient: ['#FAECED', '#FEF1F0'] as [string, string] };
        if (num <= 3) return { badge: dDay, color: '#FBBC05', gradient: ['#FEF4C7', '#FFF4E6'] as [string, string] };
        return { badge: dDay, color: '#F5A623', gradient: ['#FFF8EC', '#FFF4E0'] as [string, string] };
    }
    return { badge: 'D-DAY', color: '#61ADE3', gradient: ['#E3EFF9', '#EFF9FE'] as [string, string] };
};

const formatDate = (date: Date) =>
    `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;

/**
 * 서버가 timezone 없는 LocalDateTime 문자열(예: "2026-04-16T22:00:00")을 반환하므로
 * KST(UTC+9) 기준으로 명시적으로 파싱한다.
 */
function parseKSTDateTime(dateTimeStr: string): Date {
    if (dateTimeStr.includes('Z') || dateTimeStr.includes('+') || dateTimeStr.lastIndexOf('-') > 7) {
        return new Date(dateTimeStr);
    }
    return new Date(`${dateTimeStr}+09:00`);
}


const EventCard = ({ event }: { event: Event }) => {
    const router = useRouter();
    const setPendingEventId = useMapNavigationStore((s) => s.setPendingEventId);
    const isLive = event.status === 'live';
    const dDay = isLive ? null : getDDay(event);
    const theme = getEventTheme(dDay, isLive);
    const primaryType = event.eventTypes[0];
    const icon = EVENT_TYPE_IMAGES[primaryType] ?? EVENT_TYPE_IMAGES.STUDENT_EVENT;

    const handlePress = () => {
        router.push(`/(student)/(tabs)/map?eventId=${event.id}&lat=${event.lat}&lng=${event.lng}` as any);
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cardContainer}
            onPress={handlePress}
        >
            <LinearGradient
                colors={theme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
            >
                <View style={styles.cardContent}>
                    <View style={styles.textSection}>
                        <View style={styles.badgeRow}>
                            <View style={[styles.badge, { backgroundColor: theme.color }]}>
                                <ThemedText type="captionSemiBold" lightColor={Gray.white}>
                                    {theme.badge}
                                </ThemedText>
                            </View>
                            {event.eventTypes.map((type) => (
                                <View key={type} style={[styles.badge, styles.typeBadge]}>
                                    <ThemedText type="captionSemiBold" style={styles.typeBadgeText}>
                                        {EVENT_TYPE_LABELS[type] ?? type}
                                    </ThemedText>
                                </View>
                            ))}
                        </View>
                        <ThemedText style={styles.eventTitle} numberOfLines={1}>
                            {event.title}
                        </ThemedText>
                        <ThemedText type="caption" lightColor={Gray.gray9} numberOfLines={1}>
                            {event.description}
                        </ThemedText>
                    </View>
                    <View style={styles.imageSection}>
                        <Image source={icon} style={styles.eventImage} resizeMode="contain" />
                    </View>
                </View>
            </LinearGradient>
            <View style={styles.periodSection}>
                <ThemedText type="small" lightColor={Gray.gray9}>
                    {formatDate(event.startDateTime)} ~ {formatDate(event.endDateTime)}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );
};

export default function EventListScreen() {
    const router = useRouter();
    const { data: rawData, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: () =>
            customFetch<{ data: { data: { content: any[] } }; status: number; headers: Headers }>(
                '/api/events?status=UPCOMING&status=LIVE&size=100',
                { method: 'GET' },
            ),
        staleTime: 3 * 60 * 1000,
    });
    const events: Event[] = (rawData?.data?.data?.content ?? [])
        .map((r: any) => ({
            id: String(r.id),
            title: r.title,
            description: r.description,
            eventTypes: r.eventTypes as EventType[],
            lat: r.latitude,
            lng: r.longitude,
            startDateTime: parseKSTDateTime(r.startDateTime),
            endDateTime: parseKSTDateTime(r.endDateTime),
            status: getEventStatus({ startDateTime: parseKSTDateTime(r.startDateTime), endDateTime: parseKSTDateTime(r.endDateTime) } as Event),
            bannerImageUrl: r.bannerImageUrl,
            imageUrls: r.imageUrls ?? [],
            place: r.place,
            createdAt: parseKSTDateTime(r.createdAt),
        }))
        .filter(isEventVisible)
        .sort((a, b) => {
            const statusOrder = { live: 0, upcoming: 1, ended: 2 };
            if (a.status !== b.status) return statusOrder[a.status] - statusOrder[b.status];
            if (a.status === 'live') {
                return a.endDateTime.getTime() - b.endDateTime.getTime();
            }
            return a.startDateTime.getTime() - b.startDateTime.getTime();
        });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <ArrowLeft onPress={() => router.back()} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.titleContainer}>
                    <ThemedText style={styles.pageTitle}>진행중인 이벤트!</ThemedText>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color={Primary[500]} style={styles.loader} />
                ) : (
                    <View style={styles.eventList}>
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </View>
                )}
            </ScrollView>

            <View style={styles.bottomSpace} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Primary.textBg,
    },
    header: {
        paddingHorizontal: rs(12),
        paddingTop: Platform.OS === 'android' ? rs(10) : 0,
        height: rs(50),
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    scrollContent: {
        paddingHorizontal: rs(20),
        paddingBottom: rs(40),
    },
    titleContainer: {
        marginTop: rs(16),
        marginBottom: rs(24),
    },
    pageTitle: {
        fontSize: rs(20),
        fontFamily: Fonts.semiBold,
        color: Gray.black,
    },
    loader: {
        marginTop: rs(40),
    },
    eventList: {
        gap: rs(16),
    },
    cardContainer: {
        width: '100%',
        height: rs(110),
        borderRadius: rs(8),
        backgroundColor: Gray.white,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0, 0, 0, 0.05)',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cardGradient: {
        height: rs(86),
        paddingHorizontal: rs(20),
        paddingTop: rs(16),
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    textSection: {
        flex: 1,
        paddingRight: rs(8),
        gap: rs(6),
    },
    badgeRow: {
        flexDirection: 'row',
        gap: rs(6),
        alignItems: 'center',
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: rs(8),
        paddingVertical: rs(2),
        borderRadius: rs(20),
    },
    typeBadge: {
        backgroundColor: '#383838',
    },
    typeBadgeText: {
        color: '#FFFFFF',
    },
    eventTitle: {
        fontSize: rs(14),
        fontFamily: Fonts.semiBold,
        color: Gray.black,
    },
    imageSection: {
        width: rs(80),
        height: rs(65),
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventImage: {
        width: '100%',
        height: '100%',
    },
    periodSection: {
        height: rs(24),
        paddingHorizontal: rs(20),
        justifyContent: 'center',
        backgroundColor: Gray.white,
    },
    bottomSpace: {
        height: rs(34),
    },
});
