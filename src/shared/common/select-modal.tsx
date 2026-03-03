import { ThemedText } from '@/src/shared/common/themed-text';
import { Fonts, Gray } from '@/src/shared/theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { rs } from '../theme/scale';

export interface SelectOption {
  id: string | number;
  label: string;
}

interface SelectModalProps {
  visible: boolean;
  options: SelectOption[];
  selectedId: string | number;
  onSelect: (id: string | number) => void;
  onClose: () => void;
  title?: string;
  highlightedIds?: (string | number)[];
}

export function SelectModal({
  visible,
  options,
  selectedId,
  onSelect,
  onClose,
  title,
  highlightedIds = [],
}: SelectModalProps) {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const modalHeight = rs(350) + bottomInset + rs(20);
  const translateY = useSharedValue(modalHeight);
  const buttonScale = useSharedValue(1);

  // 드래그 제스처 설정
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > -10) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  React.useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else {
      translateY.value = modalHeight;
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.overlayBackground} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.modalContentWrapper, animatedContentStyle]}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFFFF', '#EDEDED']}
            locations={[0, 0.48, 1]}
            style={[styles.modalContent, { paddingBottom: rs(20) + bottomInset }]}
          >
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleBarContainer}>
                <View style={styles.handleBar} />
              </View>
            </GestureDetector>

            {title && (
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>{title}</ThemedText>
              </View>
            )}

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.optionsContainer}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => {
                const isSelected = selectedId === option.id;
                const isHighlighted = highlightedIds.includes(option.id);

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.modalOption}
                    onPress={() => {
                      onSelect(option.id);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.modalOptionText,
                        isHighlighted && styles.modalOptionTextHighlighted,
                        isSelected && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={1}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
            >
              <Animated.View style={[styles.modalCloseButton, animatedButtonStyle]}>
                <ThemedText style={styles.modalCloseText}>닫기</ThemedText>
              </Animated.View>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentWrapper: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: Gray.white,
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
    width: '100%',
    height: rs(350),
  },
  handleBarContainer: {
    width: '100%',
    height: rs(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleBar: {
    width: rs(48),
    height: rs(4),
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    borderRadius: rs(100),
  },
  modalHeader: {
    paddingBottom: rs(12),
    alignItems: 'center',
    paddingHorizontal: rs(20),
  },
  modalTitle: {
    fontSize: rs(16),
    fontFamily: 'Inter',
    fontWeight: '600',
    color: Gray.black,
    lineHeight: rs(22),
    textAlign: 'center',
  },
  scrollView: {
    flex: 1, // 남은 공간을 ScrollView가 차지하도록
  },
  optionsContainer: {
    gap: rs(16),
    paddingVertical: rs(10),
  },
  modalOption: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: rs(4),
  },
  modalOptionText: {
    fontSize: rs(14),
    fontFamily: Fonts.regular,
    color: Gray.black,
    textAlign: 'center',
  },
  modalOptionTextHighlighted: {
    color: '#309821',
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  modalOptionTextSelected: {},
  modalCloseButton: {
    marginHorizontal: rs(25),
    marginTop: rs(10),
    height: rs(40),
    backgroundColor: Gray.white,
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: rs(14),
    fontFamily: Fonts.medium,
    fontWeight: '500',
    color: Gray.black,
    lineHeight: rs(19.6),
  },
});
