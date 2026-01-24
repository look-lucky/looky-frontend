import { ThemedText } from '@/src/components/common/themed-text';
import { rs } from '@/src/theme/scale';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const TABS = [
  { id: 'news', label: '소식' },
  { id: 'menu', label: '메뉴' },
  { id: 'review', label: '리뷰' },
  { id: 'info', label: '매장정보' },
];

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <View style={styles.tabContainer}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.tabActive]}
          onPress={() => onTabChange(tab.id)}
        >
          <ThemedText
            style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
          >
            {tab.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: rs(12),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1d1b20',
  },
  tabText: {
    fontSize: rs(16),
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1d1b20',
    fontWeight: '600',
  },
});
