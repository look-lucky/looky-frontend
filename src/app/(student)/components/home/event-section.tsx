import { ThemedText } from '@/src/shared/common/themed-text';
import { logHomeEventCardClick } from '@/src/shared/lib/analytics';
import { rs } from '@/src/shared/theme/scale';
import { Brand, Gray } from '@/src/shared/theme/theme';
import type { EventType } from '@/src/shared/types/event';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  type ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { SectionHeader } from './section-header';

interface EventItem {
  id: number;
  title: string;
  description: string;
  eventTypes: EventType[];
  startDateTime: string;
  endDateTime: string;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  imageUrls: string[];
}

interface EventSectionProps {
  events: EventItem[];
}

// 이벤트 타입별 아이콘 매핑 (event/index.tsx와 동일한 소스)
const EVENT_TYPE_ICONS: Record<EventType, ImageSourcePropType> = {
  FOOD_EVENT: require('@/assets/images/icons/map/event-food.png'),
  SCHOOL_EVENT: require('@/assets/images/icons/map/event-college.png'),
  POPUP_STORE: require('@/assets/images/icons/map/event-brand.png'),
  FLEA_MARKET: require('@/assets/images/icons/map/event-market.png'),
  PERFORMANCE: require('@/assets/images/icons/map/event-busking.png'),
  STUDENT_EVENT: require('@/assets/images/icons/map/event-student.png'),
};

// D-day 값 기준 스타일 (D-DAY=파란, D-1=분홍, D-N=노란)
const DDAY_STYLES = {
  TODAY: {
    background: '#EFF9FE',
    badge: '#61ADE3',
    highlight: '#2086BA',
  },
  ONE: {
    background: '#FEF1F0',
    badge: '#FA726B',
    highlight: '#FA5F54',
  },
  FUTURE: {
    background: '#FFF8EC',
    badge: '#F5A623',
    highlight: '#D4890B',
  },
};

export function EventSection({ events }: EventSectionProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleMorePress = () => {
    router.push('/event' as any);
  };

  const handleEventPress = (eventId: number, eventTitle: string) => {
    logHomeEventCardClick({ eventId, eventTitle });
    router.push(`/(student)/(tabs)/map?eventId=${eventId}` as any);
  };

  const getDDayInfo = (event: EventItem) => {
    const now = new Date();

    if (event.status === 'LIVE') {
      // 진행중 이벤트는 종료일까지 카운트다운
      const end = new Date(event.endDateTime);
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return { text: 'D-DAY', style: DDAY_STYLES.TODAY };
      if (diffDays === 1) return { text: 'D-1', style: DDAY_STYLES.ONE };
      return { text: `D-${diffDays}`, style: DDAY_STYLES.FUTURE };
    }

    // UPCOMING 이벤트는 시작일까지 카운트다운
    const start = new Date(event.startDateTime);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { text: 'D-DAY', style: DDAY_STYLES.TODAY };
    if (diffDays === 1) return { text: 'D-1', style: DDAY_STYLES.ONE };
    return { text: `D-${diffDays}`, style: DDAY_STYLES.FUTURE };
  };

  const getEventIcon = (event: EventItem): ImageSourcePropType => {
    const primaryType = event.eventTypes?.[0];
    return EVENT_TYPE_ICONS[primaryType] ?? EVENT_TYPE_ICONS.STUDENT_EVENT;
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // 표시 가능한 이벤트들 (부모에서 이미 isEventVisible로 필터링되어 넘어옴)
  // LIVE: 종료일 오름차순(곧 끝나는 것 먼저), UPCOMING: 시작일 오름차순, LIVE가 UPCOMING보다 앞
  const activeEvents = [...events].sort((a, b) => {
    const statusOrder = { LIVE: 0, UPCOMING: 1, ENDED: 2 };
    if (a.status !== b.status) return statusOrder[a.status] - statusOrder[b.status];
    if (a.status === 'LIVE') {
      return new Date(a.endDateTime).getTime() - new Date(b.endDateTime).getTime();
    }
    return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
  });

  if (activeEvents.length === 0) {
    return null;
  }

  const renderEventCard = ({ item }: { item: EventItem }) => {
    const { text: ddayText, style: ddayStyle } = getDDayInfo(item);
    const icon = getEventIcon(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleEventPress(item.id, item.title)}
        activeOpacity={0.8}
      >
        {/* 상단 컬러 영역 */}
        <View style={[styles.cardTop, { backgroundColor: ddayStyle.background }]}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTopLeft}>
              <View style={[styles.ddayBadge, { backgroundColor: ddayStyle.badge }]}>
                <ThemedText type="captionSemiBold" lightColor="#FFFFFF">{ddayText}</ThemedText>
              </View>
              <ThemedText type="captionSemiBold" style={styles.eventTitle} numberOfLines={2}>
                {item.title}
              </ThemedText>
            </View>
            <Image source={icon} style={styles.eventIcon} resizeMode="contain" />
          </View>
          <ThemedText type="small" style={styles.eventDescription} numberOfLines={1}>
            참여하고{' '}
            <ThemedText type="small" style={[styles.eventHighlight, { color: ddayStyle.highlight }]}>
              {item.description}
            </ThemedText>
          </ThemedText>
        </View>
        {/* 하단 흰색 영역 */}
        <View style={styles.cardBottom}>
          <ThemedText style={styles.eventDate}>
            {formatEventDate(item.startDateTime, item.endDateTime)}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title="  지금 바로 진행중인 이벤트!"
        onMorePress={handleMorePress}
      />
      <FlatList
        ref={flatListRef}
        data={activeEvents.slice(0, 10)}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View style={styles.indicatorContainer}>
        {activeEvents.slice(0, 3).map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === activeIndex && styles.indicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function formatEventDate(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours <= 12 ? hours : hours - 12;
    return `${period} ${displayHours}시${minutes > 0 ? ` ${minutes}분` : ''}`;
  };

  const year = startDate.getFullYear();
  const month = String(startDate.getMonth() + 1).padStart(2, '0');
  const day = String(startDate.getDate()).padStart(2, '0');

  return `${year}.${month}.${day} ${formatTime(startDate)} ~ ${formatTime(endDate)}`;
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
    overflow: 'visible',
  },
  list: {
    marginTop: -rs(3),
    overflow: 'visible',
  },
  listContent: {
    gap: rs(12),
    paddingVertical: rs(5), // Enough for 4px shadow to show clearly
    paddingHorizontal: rs(5),
  },
  card: {
    width: rs(168),
    borderRadius: rs(8),
    backgroundColor: Gray.white,
    // Shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTop: {
    padding: rs(12),
    gap: rs(4),
    borderTopLeftRadius: rs(8),
    borderTopRightRadius: rs(8),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTopLeft: {
    flex: 1,
    gap: rs(4),
  },
  ddayBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: rs(8),
    paddingVertical: rs(2),
    borderRadius: rs(12),
  },
  ddayText: {
    fontSize: rs(10),
    fontWeight: '700',
    color: Gray.white,
  },
  eventTitle: {
    fontWeight: '600',
    color: Gray.black,
    height: rs(32),
  },
  eventDescription: {
    marginTop: rs(4),
    color: Gray.black,
  },
  eventHighlight: {
    fontWeight: '700',
  },
  eventIcon: {
    width: rs(48),
    height: rs(48),
  },
  cardBottom: {
    height: rs(24),
    backgroundColor: Gray.white,
    justifyContent: 'center',
    paddingHorizontal: rs(12),
    borderBottomLeftRadius: rs(8),
    borderBottomRightRadius: rs(8),
  },
  eventDate: {
    fontSize: rs(9),
    color: Gray.gray6,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rs(4),
    paddingTop: rs(8),
  },
  indicator: {
    width: rs(4),
    height: rs(4),
    borderRadius: rs(2),
    backgroundColor: Gray.gray4,
  },
  indicatorActive: {
    width: rs(12),
    backgroundColor: Brand.primary,
  },
});
