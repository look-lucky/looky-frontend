import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import type { NewsItem } from '@/src/shared/types/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

// Re-export type for convenience
export type { NewsItem };

// ============================================
// NewsSection
// ============================================

export function NewsSection({
  news,
  storeId,
}: {
  news: NewsItem[];
  storeId: string;
}) {

  const router = useRouter();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>소식</ThemedText>

      {news.map((item) => (
        <Pressable
          key={item.id}
          style={styles.newsCard}
          onPress={() => router.push(`/store/${storeId}/news/${item.id}`)}
        >
          <View style={styles.newsHeader}>
            <View style={styles.typeBadge}>
              <View style={styles.iconWrapper}>
                <Ionicons name="megaphone" size={rs(16)} color="#309821" />
              </View>
              <ThemedText style={styles.typeText}>{item.type}</ThemedText>
            </View>
            <ThemedText style={styles.newsDate}>{item.date}</ThemedText>
          </View>
          <ThemedText style={styles.newsTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.newsContent} numberOfLines={3}>
            {item.content}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    gap: rs(12),
  },
  sectionTitle: {
    alignSelf: 'stretch',
    height: rs(28),
    color: '#000000',
    fontSize: rs(20),
    fontFamily: 'Pretendard',
    fontWeight: '700',
    lineHeight: rs(28),
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: rs(16),
    gap: rs(8),
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
  },
  iconWrapper: {
    width: rs(24),
    height: rs(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    color: '#309821',
    fontSize: rs(14),
    fontFamily: 'Pretendard',
    fontWeight: '700',
    lineHeight: rs(19.6),
  },
  newsDate: {
    fontSize: rs(12),
    color: '#999',
  },
  newsTitle: {
    fontSize: rs(16),
    fontFamily: 'Pretendard',
    fontWeight: '700',
    color: '#1d1b20',
  },
  newsContent: {
    fontSize: rs(14),
    color: '#666',
    lineHeight: rs(18),
  },
});
