import { ArrowLeft } from '@/src/shared/common/arrow-left';
import { ThemedText } from '@/src/shared/common/themed-text';
import { ThemedView } from '@/src/shared/common/themed-view';
import { rs } from '@/src/shared/theme/scale';
import { Brand, Gray, Text } from '@/src/shared/theme/theme';
import type { Event, EventType } from '@/src/shared/types/event';
import { EVENT_TYPE_LABELS, getDDay, getEventStatus } from '@/src/shared/types/event';
import LocationIcon from '@/assets/images/icons/event/location.svg';
import CalendarIcon from '@/assets/images/icons/event/calendar.svg';
import ClockIcon from '@/assets/images/icons/event/clock.svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { customFetch } from '@/src/api/mutator';

interface EventResponse {
  id: number;
  title: string;
  description: string;
  eventTypes: EventType[];
  latitude: number;
  longitude: number;
  startDateTime: string;
  endDateTime: string;
  place?: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  imageUrls: string[];
  createdAt: string;
}

interface CommonResponseEventResponse {
  isSuccess: boolean;
  data: EventResponse;
}

async function fetchEvent(eventId: number) {
  return customFetch<{
    data: CommonResponseEventResponse;
    status: number;
    headers: Headers;
  }>(`/api/events/${eventId}`, { method: 'GET' });
}

function transformEventResponse(response: EventResponse): Event {
  const startDateTime = new Date(response.startDateTime);
  const endDateTime = new Date(response.endDateTime);

  return {
    id: String(response.id),
    title: response.title,
    description: response.description,
    eventTypes: response.eventTypes,
    lat: response.latitude,
    lng: response.longitude,
    startDateTime,
    endDateTime,
    place: response.place,
    status: getEventStatus({ startDateTime, endDateTime } as Event),
    imageUrls: response.imageUrls ?? [],
    createdAt: new Date(response.createdAt),
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const eventId = Number(id);

  const { data: eventRes, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId),
    staleTime: 5 * 60 * 1000,
    enabled: !!eventId,
  });

  const event = eventRes?.data?.data
    ? transformEventResponse(eventRes.data.data)
    : null;

  const handleViewOnMap = () => {
    router.push(`/map?category=EVENT&eventId=${id}` as any);
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Brand.primary} />
      </ThemedView>
    );
  }

  if (isError || !event) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ThemedText style={styles.errorText}>이벤트 정보를 불러오지 못했습니다.</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
          <ThemedText style={styles.errorButtonText}>돌아가기</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const dDay = getDDay(event);
  const isLive = event.status === 'live';
  const isEnded = event.status === 'ended';

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + rs(100) }}
        showsVerticalScrollIndicator={false}
      >
        {/* 배너 이미지 */}
        <View style={styles.bannerContainer}>
          {event.imageUrls.length > 0 ? (
            <Image source={{ uri: event.imageUrls[0] }} style={styles.bannerImage} />
          ) : (
            <View style={[styles.bannerImage, styles.bannerPlaceholder]} />
          )}
          {/* 뒤로가기 */}
          <View style={[styles.backButton, { top: insets.top + rs(8) }]}>
            <ArrowLeft onPress={() => router.back()} />
          </View>
        </View>

        {/* 본문 */}
        <View style={styles.content}>
          {/* 제목 + D-day 뱃지 */}
          <View style={styles.titleRow}>
            <ThemedText style={styles.title} numberOfLines={3}>{event.title}</ThemedText>
            {!isEnded && (
              <View style={[styles.dDayBadge, isLive && styles.dDayLive]}>
                <ThemedText style={[styles.dDayText, isLive && styles.dDayTextLive]}>
                  {isLive ? '진행중' : dDay}
                </ThemedText>
              </View>
            )}
          </View>

          {/* 카테고리 태그 */}
          <View style={styles.tagRow}>
            {event.eventTypes.map((type) => (
              <View key={type} style={styles.tag}>
                <ThemedText type="captionSemiBold" style={styles.tagText}>{EVENT_TYPE_LABELS[type]}</ThemedText>
              </View>
            ))}
          </View>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 정보 */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <LocationIcon width={rs(18)} height={rs(18)} />
              <ThemedText style={styles.infoValue} numberOfLines={2}>
                {event.place || '위치 정보 없음'}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <CalendarIcon width={rs(18)} height={rs(18)} />
              <ThemedText style={styles.infoValue}>
                {formatDate(event.startDateTime)}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ClockIcon width={rs(18)} height={rs(18)} />
              <ThemedText style={styles.infoValue}>
                {formatTime(event.startDateTime)} ~ {formatTime(event.endDateTime)}
              </ThemedText>
            </View>
          </View>

          {/* 갤러리 (첫 번째 이미지 제외) */}
          {event.imageUrls.length > 1 && (
            <View style={styles.galleryRow}>
              {event.imageUrls.slice(1).map((url, index) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 본문 설명 */}
          <ThemedText style={styles.description}>{event.description}</ThemedText>
        </View>
      </ScrollView>

      {/* 하단 바 */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + rs(16) }]}>
        <TouchableOpacity style={styles.btnLocation} onPress={handleViewOnMap}>
          <ThemedText style={styles.btnLocationText}>위치 보기</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // 배너
  bannerContainer: {
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: rs(220),
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    backgroundColor: Gray.gray3,
  },
  backButton: {
    position: 'absolute',
    left: rs(16),
    backgroundColor: Gray.white,
    borderRadius: rs(20),
    padding: rs(4),
  },
  // 본문
  content: {
    padding: rs(20),
    gap: rs(12),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  title: {
    flex: 1,
    fontSize: rs(22),
    fontWeight: '700',
    color: Text.primary,
    lineHeight: rs(30),
  },
  // D-day
  dDayBadge: {
    backgroundColor: Gray.gray2,
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
    borderRadius: rs(6),
  },
  dDayLive: {
    backgroundColor: Brand.primary,
  },
  dDayText: {
    fontSize: rs(12),
    fontWeight: '700',
    color: Text.primary,
  },
  dDayTextLive: {
    color: Gray.white,
  },
  // 태그
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(8),
  },
  tag: {
    backgroundColor: Brand.primary + '20',
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
  },
  tagText: {
    color: Brand.primaryDarken,
  },
  divider: {
    height: 1,
    backgroundColor: Gray.gray3,
  },
  // 정보
  infoSection: {
    gap: rs(12),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rs(8),
  },
  infoValue: {
    flex: 1,
    fontSize: rs(14),
    color: Text.primary,
    lineHeight: rs(20),
  },
  // 갤러리
  galleryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(8),
  },
  galleryImage: {
    width: rs(100),
    height: rs(100),
    borderRadius: rs(8),
    backgroundColor: Gray.gray3,
  },
  // 본문
  description: {
    fontSize: rs(15),
    color: Text.primary,
    lineHeight: rs(24),
  },
  // 하단 바
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: rs(20),
    paddingTop: rs(16),
    backgroundColor: Gray.white,
    borderTopWidth: 1,
    borderTopColor: Gray.gray3,
  },
  btnLocation: {
    backgroundColor: Brand.primary,
    paddingVertical: rs(16),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLocationText: {
    fontSize: rs(16),
    fontWeight: '700',
    color: Gray.white,
  },
  // 에러
  errorText: {
    fontSize: rs(16),
    color: Text.secondary,
    marginBottom: rs(16),
  },
  errorButton: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
    backgroundColor: Brand.primary,
    borderRadius: rs(8),
  },
  errorButtonText: {
    color: Gray.white,
    fontSize: rs(14),
    fontWeight: '600',
  },
});
