import { AppButton } from '@/src/components/common/app-button';
import { ThemedText } from '@/src/components/common/themed-text';
import { rs } from '@/src/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomFixedBarProps {
  likeCount: number;
  isLiked: boolean;
  onLikePress: () => void;
  onCouponPress: () => void;
}

export function BottomFixedBar({
  likeCount,
  isLiked,
  onLikePress,
  onCouponPress,
}: BottomFixedBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || rs(16) }]}>
      <TouchableOpacity style={styles.likeButton} onPress={onLikePress}>
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={rs(24)}
          color={isLiked ? '#ff4d4d' : '#1d1b20'}
        />
        <ThemedText style={styles.likeCount}>{likeCount}</ThemedText>
      </TouchableOpacity>

      <AppButton
        label="쿠폰 받기"
        backgroundColor="#40CE2B"
        onPress={onCouponPress}
        style={styles.couponButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: rs(16),
    paddingTop: rs(12),
    gap: rs(12),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  likeButton: {
    alignItems: 'center',
    gap: rs(2),
  },
  likeCount: {
    fontSize: rs(12),
    color: '#666',
  },
  couponButton: {
    flex: 1,
  },
});
