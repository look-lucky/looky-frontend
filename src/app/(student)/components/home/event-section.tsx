import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Brand, Gray } from '@/src/shared/theme/theme';
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

type EventType = 'FOOD_EVENT' | 'POPUP_STORE' | 'SCHOOL_EVENT' | 'PROMOTION' | 'COMMUNITY';

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

// 이벤트 타입별 아이콘 매핑
const EVENT_TYPE_ICONS: Record<EventType, ImageSourcePropType> = {
  FOOD_EVENT: require('@/assets/images/icons/home/event-burger.png'),
  SCHOOL_EVENT: require('@/assets/images/icons/home/event-alarm.png'),
  POPUP_STORE: require('@/assets/images/icons/home/event-alarm.png'),
  PROMOTION: require('@/assets/images/icons/home/event-alarm.png'),
  COMMUNITY: require('@/assets/images/icons/home/event-alarm.png'),
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
    router.push('/map?category=EVENT' as any);
  };

  const handleEventPress = (_eventId: number) => {
    router.push(`/map?category=EVENT` as any);
  };

  const getDDayInfo = (event: EventItem) => {
    const start = new Date(event.startDateTime);
    const today = new Date();
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (event.status === 'LIVE' || diffDays <= 0) {
      return { text: 'D-DAY', style: DDAY_STYLES.TODAY };
    }
    if (diffDays === 1) {
      return { text: 'D-1', style: DDAY_STYLES.ONE };
    }
    return { text: `D-${diffDays}`, style: DDAY_STYLES.FUTURE };
  };

  const getEventIcon = (event: EventItem): ImageSourcePropType => {
    const primaryType = event.eventTypes?.[0];
    return EVENT_TYPE_ICONS[primaryType] ?? EVENT_TYPE_ICONS.SCHOOL_EVENT;
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

  // 종료일이 지난 이벤트는 제외
  const now = new Date();
  const activeEvents = events
    .filter((event) => new Date(event.endDateTime) > now)
    .sort((a, b) => new Date(a.endDateTime).getTime() - new Date(b.endDateTime).getTime());

  if (activeEvents.length === 0) {
    return null;
  }

  const renderEventCard = ({ item }: { item: EventItem }) => {
    const { text: ddayText, style: ddayStyle } = getDDayInfo(item);
    const icon = getEventIcon(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleEventPress(item.id)}
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
        icon="🎉"
        title="지금 바로 진행중인 이벤트!"
        onMorePress={handleMorePress}
      />
      <FlatList
        ref={flatListRef}
        data={activeEvents.slice(0, 10)}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
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
    gap: rs(8),
  },
  listContent: {
    gap: rs(12),
  },
  card: {
    width: rs(168),
    borderRadius: rs(8),
    overflow: 'hidden',
  },
  cardTop: {
    padding: rs(12),
    gap: rs(4),
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
