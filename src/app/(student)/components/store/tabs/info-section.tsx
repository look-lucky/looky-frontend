import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Gray, System, Text as TextColors } from '@/src/shared/theme/theme';
import React, { useCallback, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

export interface StoreInfo {
  introduction: string;
  operatingHours: string;
  roadAddress: string;
  jibunAddress: string;
  phone: string;
  category: string;
  moods: string;
}

interface InfoSectionProps extends StoreInfo {
  scrollViewRef?: React.RefObject<ScrollView | null>;
  scrollOffsetY?: React.RefObject<number>;
}

const ANCHORS = [
  { id: 'intro', label: '매장소개' },
  { id: 'location', label: '위치' },
  { id: 'detail', label: '상세정보' },
] as const;

type AnchorId = (typeof ANCHORS)[number]['id'];

export function InfoSection({
  introduction,
  operatingHours,
  roadAddress,
  phone,
  scrollViewRef,
  scrollOffsetY,
}: InfoSectionProps) {
  const [activeAnchor, setActiveAnchor] = useState<AnchorId>('intro');

  // 각 섹션의 Y 좌표 (InfoSection container 기준)
  const sectionY = useRef<Record<AnchorId, number>>({
    intro: 0,
    location: 0,
    detail: 0,
  });

  // InfoSection container의 Y (ScrollView content 기준으로 measure)
  const containerRef = useRef<View>(null);

  const handleSectionLayout = useCallback(
    (id: AnchorId) => (e: LayoutChangeEvent) => {
      sectionY.current[id] = e.nativeEvent.layout.y;
    },
    [],
  );

  const handleAnchorPress = (anchorId: AnchorId) => {
    setActiveAnchor(anchorId);
    if (!containerRef.current || !scrollViewRef?.current) return;

    // container의 절대 screen 좌표와 scrollView의 절대 screen 좌표를 측정해서
    // container의 ScrollView content 내 offset을 구한 뒤 섹션 Y를 더함
    containerRef.current.measure((_x, _y, _w, _h, _pageX, containerPageY) => {
      const currentOffset = scrollOffsetY?.current ?? 0;
      // container가 현재 화면에서 containerPageY에 위치
      // scrollView 상단이 화면에서 svPageY에 위치한다고 하면
      // containerContentY = currentOffset + (containerPageY - svPageY)
      // svPageY를 모르므로 scrollView도 measure
      (scrollViewRef.current as any)?.measure?.(
        (_sx: number, _sy: number, _sw: number, _sh: number, _spx: number, svPageY: number) => {
          const containerContentY = currentOffset + (containerPageY - svPageY);
          const targetY = containerContentY + sectionY.current[anchorId];
          scrollViewRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
        },
      );
    });
  };

  const handlePhonePress = () => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  return (
    <View ref={containerRef} style={styles.container}>
      {/* 앵커 칩 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.anchorRow}
      >
        {ANCHORS.map((anchor) => (
          <Pressable
            key={anchor.id}
            style={[
              styles.anchorChip,
              activeAnchor === anchor.id && styles.anchorChipActive,
            ]}
            onPress={() => handleAnchorPress(anchor.id)}
          >
            <ThemedText
              style={[
                styles.anchorText,
                activeAnchor === anchor.id && styles.anchorTextActive,
              ]}
            >
              {anchor.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* 매장소개 */}
      <View onLayout={handleSectionLayout('intro')} style={styles.section}>
        <ThemedText type="defaultSemiBold">매장소개</ThemedText>
        <ThemedText style={styles.body}>
          {introduction || '소개 정보가 없습니다.'}
        </ThemedText>
      </View>

      {/* 위치 */}
      <View onLayout={handleSectionLayout('location')} style={styles.section}>
        <ThemedText type="defaultSemiBold">위치</ThemedText>
        <View style={styles.mapPlaceholder} />
        <ThemedText style={styles.address}>{roadAddress || '-'}</ThemedText>
      </View>

      {/* 상세 정보 */}
      <View onLayout={handleSectionLayout('detail')} style={styles.section}>
        <ThemedText type="defaultSemiBold">상세 정보</ThemedText>

        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>전화번호</ThemedText>
          <Pressable onPress={handlePhonePress}>
            <ThemedText style={styles.phone}>{phone || '-'}</ThemedText>
          </Pressable>
        </View>

        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>영업시간</ThemedText>
          <ThemedText style={styles.body}>{operatingHours || '-'}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: rs(24),
  },
  anchorRow: {
    flexDirection: 'row',
    gap: rs(8),
  },
  anchorChip: {
    paddingVertical: rs(8),
    paddingHorizontal: rs(16),
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: Gray.gray4,
  },
  anchorChipActive: {
    backgroundColor: Gray.black,
    borderColor: Gray.black,
  },
  anchorText: {
    fontSize: rs(12),
    color: TextColors.tertiary,
  },
  anchorTextActive: {
    color: Gray.white,
  },
  section: {
    gap: rs(12),
  },
  body: {
    color: TextColors.secondary,
  },
  mapPlaceholder: {
    height: rs(160),
    backgroundColor: Gray.gray2,
    borderRadius: rs(12),
  },
  address: {
    color: TextColors.secondary,
    fontSize: rs(12),
  },
  detailItem: {
    gap: rs(4),
  },
  detailLabel: {
    color: TextColors.primary,
    fontWeight: '600',
  },
  phone: {
    color: System.phoneNumber,
  },
});
