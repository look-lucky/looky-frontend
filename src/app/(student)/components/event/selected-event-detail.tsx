import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Owner, Text } from '@/src/shared/theme/theme';
import type { Event } from '@/src/shared/types/event';
import { EVENT_TYPE_LABELS, getDDay } from '@/src/shared/types/event';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SelectedEventDetailProps {
  event: Event;
  onNavigate?: () => void;
  onShare?: () => void;
  onViewDetail?: () => void;
}

export function SelectedEventDetail({
  event,
  onNavigate,
  onShare,
  onViewDetail,
}: SelectedEventDetailProps) {
  const dDay = getDDay(event);
  const isLive = event.status === 'live';
  const isEnded = event.status === 'ended';

  // 날짜 포맷
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
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
      hour12: false,
    });
  };

  // 상태 텍스트 & 색상
  const getStatusInfo = () => {
    if (isLive) return { text: '진행중', color: Owner.primary };
    if (isEnded) return { text: '종료', color: Gray.gray5 };
    return { text: '예정', color: Text.secondary };
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onViewDetail} activeOpacity={0.8}>
        {/* 배너 이미지 */}
        {event.imageUrls.length > 0 ? (
          <Image
            source={{ uri: event.imageUrls[0] }}
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="calendar" size={40} color={Gray.gray4} />
          </View>
        )}

        {/* D-day 뱃지 */}
        <View
          style={[
            styles.dDayBadge,
            isLive && styles.dDayBadgeLive,
            isEnded && styles.dDayBadgeEnded,
          ]}
        >
          <ThemedText style={[styles.dDayText, isLive && styles.dDayTextLive]}>
            {isEnded ? '종료' : dDay ?? '진행중'}
          </ThemedText>
        </View>

        <View style={styles.info}>
          {/* 이벤트 타입 태그 */}
          <View style={styles.typeContainer}>
            {event.eventTypes.slice(0, 2).map((type) => (
              <View key={type} style={styles.typeTag}>
                <ThemedText style={styles.typeText}>
                  {EVENT_TYPE_LABELS[type]}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* 제목 */}
          <ThemedText style={styles.title} numberOfLines={2}>
            {event.title}
          </ThemedText>

          {/* 거리 */}
          {event.distance && (
            <View style={styles.detail}>
              <Ionicons name="location-outline" size={16} color={Text.secondary} />
              <ThemedText style={styles.distanceText}>
                내 위치에서 {event.distance}
              </ThemedText>
            </View>
          )}

          {/* 일시 */}
          <View style={styles.detail}>
            <Ionicons name="calendar-outline" size={16} color={Text.secondary} />
            <ThemedText style={styles.detailText}>
              {formatDate(event.startDateTime)}
            </ThemedText>
          </View>

          <View style={styles.detail}>
            <Ionicons name="time-outline" size={16} color={Text.secondary} />
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </ThemedText>
            <ThemedText style={styles.detailText}>
              {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}
            </ThemedText>
          </View>

          {/* 설명 미리보기 */}
          {event.description && (
            <View style={styles.descriptionBox}>
              <ThemedText style={styles.descriptionText} numberOfLines={2}>
                {event.description}
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* 액션 버튼 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onNavigate}>
          <Ionicons name="navigate-outline" size={20} color={Owner.primary} />
          <ThemedText style={styles.actionButtonText}>길찾기</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color={Owner.primary} />
          <ThemedText style={styles.actionButtonText}>공유</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onViewDetail}>
          <Ionicons name="document-text-outline" size={20} color={Owner.primary} />
          <ThemedText style={styles.actionButtonText}>상세보기</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: rs(16),
  },
  image: {
    width: '100%',
    height: rs(150),
    borderRadius: rs(12),
    backgroundColor: Gray.gray2,
    marginBottom: rs(16),
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // D-day 뱃지
  dDayBadge: {
    position: 'absolute',
    top: rs(12),
    right: rs(12),
    backgroundColor: Gray.white,
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(4),
    borderWidth: 1,
    borderColor: Gray.gray3,
  },
  dDayBadgeLive: {
    backgroundColor: Owner.primary,
    borderColor: Owner.primary,
  },
  dDayBadgeEnded: {
    backgroundColor: Gray.gray4,
    borderColor: Gray.gray4,
  },
  dDayText: {
    fontSize: rs(13),
    fontWeight: '700',
    color: Text.primary,
  },
  dDayTextLive: {
    color: Gray.white,
  },
  // 정보
  info: {
    gap: rs(10),
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
  title: {
    fontSize: rs(20),
    fontWeight: '700',
    color: Text.primary,
    lineHeight: rs(28),
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  detailText: {
    fontSize: rs(14),
    color: Text.secondary,
  },
  distanceText: {
    fontSize: rs(14),
    color: Owner.primary,
    fontWeight: '500',
  },
  statusDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
  },
  statusText: {
    fontSize: rs(14),
    fontWeight: '600',
  },
  descriptionBox: {
    backgroundColor: Gray.gray2,
    padding: rs(12),
    borderRadius: rs(8),
    marginTop: rs(4),
  },
  descriptionText: {
    fontSize: rs(13),
    color: Text.secondary,
    lineHeight: rs(20),
  },
  // 액션 버튼
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: rs(8),
    paddingTop: rs(16),
    borderTopWidth: 1,
    borderTopColor: Gray.gray3,
  },
  actionButton: {
    alignItems: 'center',
    gap: rs(4),
    paddingVertical: rs(8),
    paddingHorizontal: rs(20),
  },
  actionButtonText: {
    fontSize: rs(13),
    color: Owner.primary,
    fontWeight: '500',
  },
});
