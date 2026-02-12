import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Text as TextColor } from '@/src/shared/theme/theme';
import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onMorePress?: () => void;
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  onMorePress,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.mainTitle}>
          {typeof icon === 'string' ? (
            <ThemedText style={styles.icon}>{icon}</ThemedText>
          ) : (
            icon
          )}
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
        {subtitle && (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        )}
      </View>
      {onMorePress && (
        <TouchableOpacity style={styles.moreButton} onPress={onMorePress}>
          <ThemedText style={styles.moreText}>더 보기</ThemedText>
          <ThemedText style={styles.moreArrow}>{'>'}</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: rs(12),
  },
  titleContainer: {
    gap: rs(2),
  },
  mainTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  icon: {
    fontSize: rs(18),
  },
  title: {
    fontSize: rs(16),
    fontWeight: '700',
    color: TextColor.primary,
  },
  subtitle: {
    fontSize: rs(12),
    color: TextColor.tertiary,
    marginLeft: rs(22),
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(2),
  },
  moreText: {
    fontSize: rs(12),
    color: TextColor.tertiary,
  },
  moreArrow: {
    fontSize: rs(12),
    color: TextColor.tertiary,
  },
});
