import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Owner, Text } from '@/src/shared/theme/theme';
import type { Event } from '@/src/shared/types/event';
import { EVENT_TYPE_LABELS, getDDay } from '@/src/shared/types/event';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export type { Event };

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const dDay = getDDay(event);
  const isLive = event.status === 'live';
  const isEnded = event.status === 'ended';
  const isUpcoming = event.status === 'upcoming';

  // 시간 포맷
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // 상태 텍스트
  const getStatusText = () => {
    if (isLive) return '진행중';
    if (isEnded) return '종료';
    return '예정';
  };

  // 상태 색상
  const getStatusColor = () => {
    if (isLive) return Owner.primary;
    if (isEnded) return Gray.gray5;
    return Text.secondary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isLive && styles.containerLive,
        isEnded && styles.containerEnded,
        isUpcoming && styles.containerUpcoming,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 배너 이미지 */}
      <View style={styles.bannerContainer}>
        {event.imageUrls.length > 0 ? (
          <Image
            source={{ uri: event.imageUrls[0] }}
            style={[styles.banner, (isEnded || isUpcoming) && styles.bannerFaded]}
          />
        ) : (
          <View style={[styles.bannerPlaceholder, (isEnded || isUpcoming) && styles.bannerFaded]}>
            <Ionicons name="calendar" size={32} color={Gray.gray4} />
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
      </View>

      {/* 콘텐츠 */}
      <View style={styles.content}>
        {/* 제목 */}
        <ThemedText
          style={[styles.title, (isEnded || isUpcoming) && styles.textFaded]}
          numberOfLines={2}
        >
          {event.title}
        </ThemedText>

        {/* 위치 & 거리 */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={Text.secondary} />
          <ThemedText style={styles.infoText} numberOfLines={1}>
            {event.description.split('\n')[0] || '위치 정보 없음'}
          </ThemedText>
          {event.distance && (
            <>
              <View style={styles.dot} />
              <ThemedText style={styles.distanceText}>
                내 위치에서 {event.distance}
              </ThemedText>
            </>
          )}
        </View>

        {/* 상태 & 시간 */}
        <View style={styles.infoRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </ThemedText>
          <ThemedText style={styles.timeText}>
            {' '}• {formatTime(event.startDateTime)}-{formatTime(event.endDateTime)}
          </ThemedText>
        </View>

        {/* 이벤트 타입 태그 */}
        <View style={styles.tagContainer}>
          {event.eventTypes.slice(0, 2).map((type) => (
            <View key={type} style={styles.tag}>
              <Ionicons name="pricetag" size={12} color={Owner.primary} />
              <ThemedText style={styles.tagText}>{EVENT_TYPE_LABELS[type]}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Gray.white,
    borderRadius: rs(12),
    marginBottom: rs(12),
    borderWidth: 1,
    borderColor: Gray.gray3,
    overflow: 'hidden',
  },
  containerLive: {
    borderColor: Owner.primary,
    borderWidth: 2,
  },
  containerEnded: {
    backgroundColor: Gray.gray2,
    opacity: 0.7,
  },
  containerUpcoming: {
    opacity: 0.7,
  },
  // 배너
  bannerContainer: {
    position: 'relative',
    height: rs(120),
  },
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerFaded: {
    opacity: 0.6,
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Gray.gray2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // D-day 뱃지
  dDayBadge: {
    position: 'absolute',
    top: rs(8),
    right: rs(8),
    backgroundColor: Gray.white,
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
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
    fontSize: rs(12),
    fontWeight: '700',
    color: Text.primary,
  },
  dDayTextLive: {
    color: Gray.white,
  },
  // 콘텐츠
  content: {
    padding: rs(12),
  },
  title: {
    fontSize: rs(16),
    fontWeight: '600',
    color: Text.primary,
    marginBottom: rs(8),
    lineHeight: rs(22),
  },
  textFaded: {
    color: Text.secondary,
  },
  // 정보 행
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rs(6),
  },
  infoText: {
    fontSize: rs(13),
    color: Text.secondary,
    marginLeft: rs(4),
    flex: 1,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Gray.gray4,
    marginHorizontal: rs(6),
  },
  distanceText: {
    fontSize: rs(13),
    color: Owner.primary,
    fontWeight: '500',
  },
  // 상태
  statusDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    marginRight: rs(6),
  },
  statusText: {
    fontSize: rs(13),
    fontWeight: '500',
  },
  timeText: {
    fontSize: rs(13),
    color: Text.secondary,
  },
  // 태그
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(6),
    marginTop: rs(4),
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Owner.primary + '15',
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(4),
    gap: rs(4),
  },
  tagText: {
    fontSize: rs(12),
    color: Owner.primary,
    fontWeight: '500',
  },
});
