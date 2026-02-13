import ClockIcon from '@/assets/images/icons/event/clock.svg';
import LocationIcon from '@/assets/images/icons/event/location.svg';
import ConfettiGrayIcon from '@/assets/images/icons/map/confetti-gray.svg';
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
  onViewDetail?: () => void;
}

export function SelectedEventDetail({
  event,
  onViewDetail,
}: SelectedEventDetailProps) {
  const dDay = getDDay(event);
  const isLive = event.status === 'live';
  const isEnded = event.status === 'ended';

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
        <View style={styles.imageWrapper}>
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

          {/* D-day 뱃지 - 이미지 오른쪽 하단 */}
          <View
            style={[
              styles.dDayBadge,
              isLive && styles.dDayBadgeLive,
              isEnded && styles.dDayBadgeEnded,
            ]}
          >
            <ThemedText
              type="captionSemiBold"
              lightColor={isLive ? Gray.white : Text.primary}
            >
              {isEnded ? '종료' : dDay ?? '진행중'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.info}>
          {/* 제목 */}
          <ThemedText type="subtitle" lightColor={Text.primary} numberOfLines={2}>
            {event.title}
          </ThemedText>

          {/* 위치 + 이벤트 타입 태그 (같은 줄) */}
          <View style={styles.locationRow}>
            {event.place && (
              <View style={styles.detail}>
                <LocationIcon width={rs(16)} height={rs(16)} />
                <ThemedText type="default" lightColor={Text.secondary} numberOfLines={1} style={styles.placeText}>
                  {event.place}
                </ThemedText>
              </View>
            )}
            <View style={styles.typeContainer}>
              {event.eventTypes.slice(0, 2).map((type) => (
                <View key={type} style={styles.typeTag}>
                  <ConfettiGrayIcon width={rs(12)} height={rs(12)} />
                  <ThemedText type="default" lightColor={Text.tertiary}>
                    {EVENT_TYPE_LABELS[type]}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* 시간 (진행 중이면 앞에 표시) */}
          <View style={styles.detail}>
            <ClockIcon width={rs(16)} height={rs(16)} />
            {isLive && (
              <>
                <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                <ThemedText type="defaultSemiBold" lightColor={statusInfo.color}>
                  {statusInfo.text}
                </ThemedText>
              </>
            )}
            <ThemedText type="default" lightColor={Text.secondary}>
              {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: rs(16),
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: rs(16),
  },
  image: {
    width: '100%',
    height: rs(150),
    borderRadius: rs(12),
    backgroundColor: Gray.gray2,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // D-day 뱃지
  dDayBadge: {
    position: 'absolute',
    bottom: rs(10),
    right: rs(10),
    backgroundColor: Gray.white,
    paddingHorizontal: rs(10),
    paddingVertical: rs(3),
    borderRadius: rs(12),
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
  // 정보
  info: {
    gap: rs(10),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    flexWrap: 'wrap',
  },
  placeText: {
    flexShrink: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: rs(6),
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  statusDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
  },
});
