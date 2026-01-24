import { ThemedText } from '@/src/components/common/themed-text';
import { rs } from '@/src/theme/scale';
import type { Announcement } from '@/src/types/store';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - rs(32);

interface AnnouncementCarouselProps {
  announcements: Announcement[];
}

export function AnnouncementCarousel({ announcements }: AnnouncementCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / CARD_WIDTH);
    setActiveIndex(index);
  };

  if (announcements.length === 0) return null;

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselScrollContent}
      >
        {announcements.map((announcement) => (
          <View key={announcement.id} style={[styles.carouselCard, { width: CARD_WIDTH }]}>
            <ThemedText style={styles.carouselTitle}>{announcement.title}</ThemedText>
            <ThemedText style={styles.carouselContent}>{announcement.content}</ThemedText>
          </View>
        ))}
      </ScrollView>

      {announcements.length > 1 && (
        <View style={styles.indicators}>
          {announcements.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                activeIndex === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    gap: rs(12),
  },
  carouselScrollContent: {
    gap: rs(12),
  },
  carouselCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: rs(16),
    gap: rs(8),
  },
  carouselTitle: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#1d1b20',
  },
  carouselContent: {
    fontSize: rs(12),
    color: '#666',
    lineHeight: rs(18),
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rs(6),
  },
  indicator: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: '#ddd',
  },
  indicatorActive: {
    backgroundColor: '#1d1b20',
  },
});
