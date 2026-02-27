import { AppButton } from '@/src/shared/common/app-button';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Fonts } from '@/src/shared/theme/theme';
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
          name={isLiked ? 'bookmark' : 'bookmark-outline'}
          size={rs(22)}
          color={isLiked ? '#40CE2B' : '#000000'}
        />
        <ThemedText style={styles.likeCount} lightColor="#000000" darkColor="#000000">{likeCount}</ThemedText>
      </TouchableOpacity>

      <AppButton
        label="쿠폰 보기"
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
    width: rs(47),
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeCount: {
    fontSize: rs(10),
    fontFamily: Fonts.bold,
    fontWeight: '700',
    lineHeight: rs(14),
    color: '#000000',
    textAlign: 'center',
  },
  couponButton: {
    flex: 1,
  },
});
