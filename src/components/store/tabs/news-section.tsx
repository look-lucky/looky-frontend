import { ThemedText } from '@/src/components/common/themed-text';
import { rs } from '@/src/theme/scale';
import type { NewsItem } from '@/src/types/store';
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
              <ThemedText style={styles.typeIcon}>📢</ThemedText>
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
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1d1b20',
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
    gap: rs(4),
  },
  typeIcon: {
    fontSize: rs(12),
  },
  typeText: {
    fontSize: rs(12),
    color: '#34b262',
    fontWeight: '500',
  },
  newsDate: {
    fontSize: rs(12),
    color: '#999',
  },
  newsTitle: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#1d1b20',
  },
  newsContent: {
    fontSize: rs(12),
    color: '#666',
    lineHeight: rs(18),
  },
});
