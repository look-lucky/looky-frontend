import { ArrowLeft } from '@/src/shared/common/arrow-left';
import { ThemedText } from '@/src/shared/common/themed-text';
import { ThemedView } from '@/src/shared/common/themed-view';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Owner, Text } from '@/src/shared/theme/theme';
import type { Event, EventType } from '@/src/shared/types/event';
import { EVENT_TYPE_LABELS, getDDay, getEventStatus } from '@/src/shared/types/event';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { customFetch } from '@/src/api/mutator';

// API Response 타입
interface EventResponse {
  id: number;
  title: string;
  description: string;
  eventTypes: EventType[];
  latitude: number;
  longitude: number;
  startDateTime: string;
  endDateTime: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  imageUrls: string[];
  createdAt: string;
}

interface CommonResponseEventResponse {
  isSuccess: boolean;
  data: EventResponse;
}

// API 호출 함수
async function fetchEvent(eventId: number) {
  return customFetch<{
    data: CommonResponseEventResponse;
    status: number;
    headers: Headers;
  }>(`/api/events/${eventId}`, { method: 'GET' });
}

// Response → Event 변환
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
    status: getEventStatus({ startDateTime, endDateTime } as Event),
    imageUrls: response.imageUrls ?? [],
    createdAt: new Date(response.createdAt),
  };
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const eventId = Number(id);

  // API 호출
  const { data: eventRes, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId),
    staleTime: 5 * 60 * 1000,
    enabled: !!eventId,
  });

  const event = eventRes?.data?.data
    ? transformEventResponse(eventRes.data.data)
    : null;

  // 날짜 포맷
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // 시간 포맷
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // 핸들러
  const handleBack = () => router.back();

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `${event.title}\n\n${event.description}`,
      });
    } catch {
      // 공유 취소
    }
  };

  const handleNavigate = () => {
    if (!event) return;
    // 네이버 지도 앱으로 길찾기
    const url = `nmap://route/walk?dlat=${event.lat}&dlng=${event.lng}&dname=${encodeURIComponent(event.title)}&appname=com.yourapp`;
    Linking.openURL(url).catch(() => {
      // 네이버 지도 앱이 없으면 웹으로
      Linking.openURL(
        `https://map.naver.com/v5/directions/-/-/-/walk?c=${event.lng},${event.lat},15,0,0,0,dh`
      );
    });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Owner.primary} />
      </ThemedView>
    );
  }

  // 에러 상태
  if (isError || !event) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText}>
          이벤트 정보를 불러오지 못했습니다.
        </ThemedText>
        <TouchableOpacity onPress={handleBack} style={styles.errorButton}>
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
        {/* 헤더 이미지 */}
        <View style={styles.headerContainer}>
          {event.imageUrls.length > 0 ? (
            <Image source={{ uri: event.imageUrls[0] }} style={styles.headerImage} />
          ) : (
            <View style={[styles.headerImage, styles.headerPlaceholder]}>
              <Ionicons name="calendar" size={60} color={Gray.gray4} />
            </View>
          )}

          {/* 뒤로가기 버튼 */}
          <View style={[styles.backButton, { top: insets.top + rs(12) }]}>
            <ArrowLeft onPress={handleBack} />
          </View>
        </View>

        {/* 콘텐츠 */}
        <View style={styles.content}>
          {/* 이벤트 타입 & 날짜 */}
          <View style={styles.metaRow}>
            <View style={styles.typeContainer}>
              {event.eventTypes.map((type) => (
                <View key={type} style={styles.typeTag}>
                  <ThemedText style={styles.typeText}>
                    {EVENT_TYPE_LABELS[type]}
                  </ThemedText>
                </View>
              ))}
            </View>
            <ThemedText style={styles.dateText}>
              {formatDate(event.createdAt)}
            </ThemedText>
          </View>

          {/* 제목 */}
          <ThemedText style={styles.title}>{event.title}</ThemedText>

          {/* D-day 뱃지 */}
          <View
            style={[
              styles.dDayBadge,
              isLive && styles.dDayBadgeLive,
              isEnded && styles.dDayBadgeEnded,
            ]}
          >
            <ThemedText style={[styles.dDayText, isLive && styles.dDayTextLive]}>
              {isEnded ? '종료' : isLive ? '진행중' : dDay}
            </ThemedText>
          </View>

          {/* 설명 */}
          <View style={styles.descriptionBox}>
            <ThemedText style={styles.description}>{event.description}</ThemedText>
          </View>

          {/* 일시 정보 */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={Owner.primary} />
              <ThemedText style={styles.infoLabel}>장소</ThemedText>
              <ThemedText style={styles.infoValue}>
                {event.description.split('\n')[0] || '위치 정보 없음'}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={Owner.primary} />
              <ThemedText style={styles.infoLabel}>일시</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(event.startDateTime)}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={Owner.primary} />
              <ThemedText style={styles.infoLabel}>시간</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatTime(event.startDateTime)} ~ {formatTime(event.endDateTime)}
              </ThemedText>
            </View>
          </View>

          {/* 이미지 갤러리 */}
          {event.imageUrls.length > 1 && (
            <View style={styles.gallery}>
              <ThemedText style={styles.galleryTitle}>이미지</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.galleryRow}>
                  {event.imageUrls.slice(1).map((url, index) => (
                    <Image
                      key={index}
                      source={{ uri: url }}
                      style={styles.galleryImage}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + rs(16) }]}>
        <TouchableOpacity style={styles.bottomButton} onPress={handleNavigate}>
          <Ionicons name="navigate" size={20} color={Gray.white} />
          <ThemedText style={styles.bottomButtonText}>길찾기</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, styles.bottomButtonSecondary]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color={Owner.primary} />
          <ThemedText style={styles.bottomButtonTextSecondary}>공유</ThemedText>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // 헤더
  headerContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: rs(250),
    resizeMode: 'cover',
  },
  headerPlaceholder: {
    backgroundColor: Gray.gray2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: rs(16),
  },
  // 콘텐츠
  content: {
    padding: rs(20),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(12),
  },
  typeContainer: {
    flexDirection: 'row',
    gap: rs(8),
  },
  typeTag: {
    backgroundColor: Owner.primary + '15',
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
    borderRadius: rs(4),
  },
  typeText: {
    fontSize: rs(12),
    color: Owner.primary,
    fontWeight: '600',
  },
  dateText: {
    fontSize: rs(13),
    color: Text.secondary,
  },
  title: {
    fontSize: rs(24),
    fontWeight: '700',
    color: Text.primary,
    lineHeight: rs(32),
    marginBottom: rs(12),
  },
  // D-day 뱃지
  dDayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Gray.gray2,
    paddingHorizontal: rs(14),
    paddingVertical: rs(6),
    borderRadius: rs(6),
    marginBottom: rs(20),
  },
  dDayBadgeLive: {
    backgroundColor: Owner.primary,
  },
  dDayBadgeEnded: {
    backgroundColor: Gray.gray4,
  },
  dDayText: {
    fontSize: rs(14),
    fontWeight: '700',
    color: Text.primary,
  },
  dDayTextLive: {
    color: Gray.white,
  },
  // 설명
  descriptionBox: {
    backgroundColor: Gray.gray1,
    padding: rs(16),
    borderRadius: rs(12),
    marginBottom: rs(24),
  },
  description: {
    fontSize: rs(15),
    color: Text.primary,
    lineHeight: rs(24),
  },
  // 정보 섹션
  infoSection: {
    gap: rs(16),
    marginBottom: rs(24),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  infoLabel: {
    fontSize: rs(14),
    color: Text.secondary,
    width: rs(40),
  },
  infoValue: {
    flex: 1,
    fontSize: rs(14),
    color: Text.primary,
  },
  // 갤러리
  gallery: {
    marginTop: rs(8),
  },
  galleryTitle: {
    fontSize: rs(16),
    fontWeight: '600',
    color: Text.primary,
    marginBottom: rs(12),
  },
  galleryRow: {
    flexDirection: 'row',
    gap: rs(12),
  },
  galleryImage: {
    width: rs(120),
    height: rs(120),
    borderRadius: rs(8),
    backgroundColor: Gray.gray2,
  },
  // 하단 바
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: rs(12),
    paddingHorizontal: rs(20),
    paddingTop: rs(16),
    backgroundColor: Gray.white,
    borderTopWidth: 1,
    borderTopColor: Gray.gray2,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
    backgroundColor: Owner.primary,
    paddingVertical: rs(14),
    borderRadius: rs(12),
  },
  bottomButtonSecondary: {
    backgroundColor: Gray.white,
    borderWidth: 1,
    borderColor: Owner.primary,
  },
  bottomButtonText: {
    fontSize: rs(16),
    fontWeight: '600',
    color: Gray.white,
  },
  bottomButtonTextSecondary: {
    fontSize: rs(16),
    fontWeight: '600',
    color: Owner.primary,
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
    backgroundColor: Owner.primary,
    borderRadius: rs(8),
  },
  errorButtonText: {
    color: Gray.white,
    fontSize: rs(14),
    fontWeight: '600',
  },
});
