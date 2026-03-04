import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
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
      <View style={styles.fullWidthDivider} />
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.tabActive]}
          onPress={() => onTabChange(tab.id)}
        >
          <ThemedText
            style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
            lightColor={activeTab === tab.id ? '#1d1b20' : '#999'}
            darkColor={activeTab === tab.id ? '#1d1b20' : '#999'}
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
    position: 'relative',
  },
  fullWidthDivider: {
    position: 'absolute',
    bottom: 0,
    left: -rs(20),
    right: -rs(20),
    height: 2,
    backgroundColor: '#F5F5F5',
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
