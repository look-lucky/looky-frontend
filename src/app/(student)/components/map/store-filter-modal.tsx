import { AppButton } from '@/src/shared/common/app-button';
import { ThemedText } from '@/src/shared/common/themed-text';
import { ThemedView } from '@/src/shared/common/themed-view';
import {
  EVENT_OPTIONS,
  MOOD_OPTIONS,
  STORE_TYPE_OPTIONS,
} from '@/src/shared/constants/map';
import { rs } from '@/src/shared/theme/scale';
import { Brand, Gray, Text } from '@/src/shared/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type FilterTab = 'storeType' | 'event';

interface StoreFilterModalProps {
  visible: boolean;
  activeTab: FilterTab;
  selectedStoreTypes: string[];
  selectedMoods: string[];
  selectedEvents: string[];
  onTabChange: (tab: FilterTab) => void;
  onReset: () => void;
  onClose: () => void;
  onApply: (storeTypes: string[], moods: string[], events: string[]) => void;
}

export function StoreFilterModal({
  visible,
  activeTab,
  selectedStoreTypes,
  selectedMoods,
  selectedEvents,
  onTabChange,
  onReset,
  onClose,
  onApply,
}: StoreFilterModalProps) {
  const insets = useSafeAreaInsets();

  const [draftStoreTypes, setDraftStoreTypes] = useState<string[]>(selectedStoreTypes);
  const [draftMoods, setDraftMoods] = useState<string[]>(selectedMoods);
  const [draftEvents, setDraftEvents] = useState<string[]>(selectedEvents);

  // 모달이 열릴 때 현재 적용된 값으로 draft 초기화
  useEffect(() => {
    if (visible) {
      setDraftStoreTypes(selectedStoreTypes);
      setDraftMoods(selectedMoods);
      setDraftEvents(selectedEvents);
    }
  }, [visible]);

  const handleStoreTypeToggle = (id: string) => {
    setDraftStoreTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleMoodToggle = (id: string) => {
    setDraftMoods((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleEventToggle = (id: string) => {
    setDraftEvents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleReset = () => {
    setDraftStoreTypes([]);
    setDraftMoods([]);
    setDraftEvents([]);
    onReset();
  };

  const handleApply = () => {
    onApply(draftStoreTypes, draftMoods, draftEvents);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.container, { paddingBottom: rs(20) + insets.bottom }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 탭 헤더 */}
          <View style={styles.tabHeader}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => onTabChange('storeType')}
              >
                <ThemedText
                  type="subtitle"
                  lightColor={activeTab === 'storeType' ? Text.primary : Text.tertiary}
                >
                  가게 종류
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => onTabChange('event')}
              >
                <ThemedText
                  type="subtitle"
                  lightColor={activeTab === 'event' ? Text.primary : Text.tertiary}
                >
                  이벤트
                </ThemedText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleReset}>
              <ThemedText style={styles.resetText}>초기화</ThemedText>
            </TouchableOpacity>
          </View>

          {/* 콘텐츠 영역 */}
          <ThemedView style={styles.content}>
            {activeTab === 'storeType' ? (
              <>
                {/* 가게 종류 섹션 */}
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  가게 종류
                </ThemedText>
                <View style={styles.chipGroup}>
                  {STORE_TYPE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.chip,
                        draftStoreTypes.includes(option.id) && styles.chipSelected,
                      ]}
                      onPress={() => handleStoreTypeToggle(option.id)}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          draftStoreTypes.includes(option.id) && styles.chipTextSelected,
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 분위기 섹션 */}
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  분위기
                </ThemedText>
                <View style={styles.chipGroup}>
                  {MOOD_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.chip,
                        draftMoods.includes(option.id) && styles.chipSelected,
                      ]}
                      onPress={() => handleMoodToggle(option.id)}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          draftMoods.includes(option.id) && styles.chipTextSelected,
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                {/* 이벤트 섹션 */}
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  이벤트
                </ThemedText>
                <View style={styles.chipGroup}>
                  {EVENT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.chip,
                        draftEvents.includes(option.id) && styles.chipSelected,
                      ]}
                      onPress={() => handleEventToggle(option.id)}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          draftEvents.includes(option.id) && styles.chipTextSelected,
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ThemedView>

          {/* 버튼 영역 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ThemedText style={styles.closeButtonText}>닫기</ThemedText>
            </TouchableOpacity>
            <AppButton
              label="적용하기"
              backgroundColor={Brand.primary}
              style={styles.applyButton}
              onPress={handleApply}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Gray.popupBg,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Gray.white,
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    padding: rs(20),
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(20),
  },
  tabRow: {
    flexDirection: 'row',
    gap: rs(16),
  },
  resetText: {
    fontSize: 14,
    color: Text.tertiary,
  },
  tab: {
    paddingVertical: rs(4),
  },
  content: {
    backgroundColor: Gray.white,
  },
  sectionTitle: {
    marginBottom: rs(12),
    marginTop: rs(16),
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(8),
  },
  chip: {
    paddingHorizontal: rs(16),
    paddingVertical: rs(8),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Gray.gray4,
    backgroundColor: Gray.white,
  },
  chipSelected: {
    borderColor: Brand.primary,
    backgroundColor: Gray.white,
  },
  chipText: {
    fontSize: 14,
    color: Text.primary,
  },
  chipTextSelected: {
    color: Brand.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: rs(12),
    marginTop: rs(24),
  },
  closeButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Gray.gray4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rs(12),
  },
  closeButtonText: {
    fontSize: 14,
    color: Text.primary,
  },
  applyButton: {
    flex: 2,
  },
});
