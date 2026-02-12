import type { StoreResponseCloverGrade } from '@/src/api/generated.schemas';
import { SelectModal } from '@/src/shared/common/select-modal';
import { ThemedText } from '@/src/shared/common/themed-text';
import { ThemedView } from '@/src/shared/common/themed-view';
import { UNIVERSITY_OPTIONS } from '@/src/shared/constants/store';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Owner, System, Text } from '@/src/shared/theme/theme';
import { formatOperatingHours, parseAllOperatingHours } from '@/src/shared/utils/store-transform';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CLOVER_IMAGES: Record<string, ImageSourcePropType> = {
  SEED: require('@/assets/images/icons/store/clover-one.png'),
  SPROUT: require('@/assets/images/icons/store/clover-two.png'),
  THREE_LEAF: require('@/assets/images/icons/store/clover-three.png'),
};

// Android LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================
// Types
// ============================================

interface StoreHeaderProps {
  image: string;
  cloverGrade?: StoreResponseCloverGrade;
  isLiked: boolean;
  name: string;
  rating: number;
  category: string;
  reviewCount: number;
  address: string;
  openHours: string;
  university: string;
  isPartner: boolean;
  onBack: () => void;
  onLike: () => void;
  onUniversityChange?: (universityId: number) => void;
}

// ============================================
// MainImageSection
// ============================================

function MainImageSection({
  image,
  cloverGrade,
  isLiked,
  onBack,
  onLike,
}: {
  image: string;
  cloverGrade?: StoreResponseCloverGrade;
  isLiked: boolean;
  onBack: () => void;
  onLike: () => void;
}) {
  const insets = useSafeAreaInsets();
  const cloverImage = cloverGrade ? CLOVER_IMAGES[cloverGrade] : null;

  return (
    <ThemedView style={styles.imageContainer}>
      <Image source={{ uri: image }} style={styles.image} />

      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + rs(8) }]}
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={24} color={Gray.white} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.likeButton, { top: insets.top + rs(8) }]}
        onPress={onLike}
      >
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color={isLiked ? System.error : Gray.white}
        />
      </TouchableOpacity>

      {cloverImage && (
        <ThemedView style={styles.cloverBadge}>
          <Image source={cloverImage} style={styles.cloverImage} />
        </ThemedView>
      )}
    </ThemedView>
  );
}

// ============================================
// StoreInfoSection
// ============================================

function StoreInfoSection({
  name,
  rating,
  category,
  reviewCount,
  address,
  openHours,
}: {
  name: string;
  rating: number;
  category: string;
  reviewCount: number;
  address: string;
  openHours: string;
}) {
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);

  const allHours = parseAllOperatingHours(openHours);

  const handleToggleHours = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsHoursExpanded(!isHoursExpanded);
  };

  return (
    <ThemedView style={styles.infoContainer}>
      <ThemedView style={styles.titleRow}>
        <ThemedText type='title' lightColor={Text.primary}>{name}</ThemedText>
        <ThemedView style={styles.ratingContainer}>
          <Ionicons name="star" size={rs(16)} color={System.star} />
          <ThemedText type='defaultSemiBold' lightColor={Text.primary}>{rating.toFixed(1)}</ThemedText>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity style={styles.categoryRow}>
        <ThemedText style={styles.category}>{category}</ThemedText>
        <ThemedText style={styles.divider}>|</ThemedText>
        <ThemedText style={styles.reviewCount}>리뷰 {reviewCount}개</ThemedText>
        <Ionicons name="chevron-forward" size={rs(12)} color={Text.tertiary} />
      </TouchableOpacity>

      <ThemedView style={styles.infoRow}>
        <Ionicons name="location-outline" size={rs(14)} color={Text.secondary} />
        <ThemedText style={styles.infoText}>{address}</ThemedText>
      </ThemedView>

      <TouchableOpacity style={styles.infoRow} onPress={handleToggleHours}>
        <Ionicons name="time-outline" size={rs(14)} color={Text.secondary} />
        <ThemedText style={styles.infoText}>{formatOperatingHours(openHours)}</ThemedText>
        <Ionicons
          name={isHoursExpanded ? "chevron-up" : "chevron-down"}
          size={rs(14)}
          color={Text.secondary}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {isHoursExpanded && allHours.length > 0 && (
        <ThemedView style={styles.expandedHours}>
          {allHours.map(({ day, hours }) => (
            <ThemedView key={day} style={styles.hourRow}>
              <ThemedText style={styles.dayText}>{day}</ThemedText>
              <ThemedText style={styles.hourText}>{hours}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

// ============================================
// TagSection
// ============================================

function TagSection({
  university,
  isPartner,
  onUniversityPress,
}: {
  university: string;
  isPartner: boolean;
  onUniversityPress: () => void;
}) {
  return (
    <ThemedView style={styles.tagContainer}>
      <TouchableOpacity style={styles.universityTag} onPress={onUniversityPress}>
        <Ionicons name="school-outline" size={rs(14)} color={Owner.primary} />
        <ThemedText style={styles.universityText}>{university}</ThemedText>
        <Ionicons name="chevron-down" size={rs(12)} color={Text.secondary} />
      </TouchableOpacity>

      {isPartner && (
        <ThemedView style={styles.partnerBadge}>
          <ThemedText style={styles.partnerText}>내 제휴</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

// ============================================
// StoreHeader (Combined Export)
// ============================================

export function StoreHeader({
  image,
  cloverGrade,
  isLiked,
  name,
  rating,
  category,
  reviewCount,
  address,
  openHours,
  university,
  isPartner,
  onBack,
  onLike,
  onUniversityChange,
}: StoreHeaderProps) {
  const [showUniversityModal, setShowUniversityModal] = useState(false);

  // 현재 선택된 대학의 id 찾기 (label로 매칭)
  const selectedUniversityId =
    UNIVERSITY_OPTIONS.find((opt) => opt.label === university)?.id ?? 0;

  const handleUniversitySelect = (id: string | number) => {
    const numericId = typeof id === 'string' ? Number(id) : id;
    const selected = UNIVERSITY_OPTIONS.find((opt) => opt.id === numericId);
    if (selected && onUniversityChange) {
      onUniversityChange(numericId);
    }
  };

  return (
    <>
      <MainImageSection
        image={image}
        cloverGrade={cloverGrade}
        isLiked={isLiked}
        onBack={onBack}
        onLike={onLike}
      />
      <ThemedView style={styles.headerContent}>
        <StoreInfoSection
          name={name}
          rating={rating}
          category={category}
          reviewCount={reviewCount}
          address={address}
          openHours={openHours}
        />
        <TagSection
          university={university}
          isPartner={isPartner}
          onUniversityPress={() => setShowUniversityModal(true)}
        />
      </ThemedView>

      <SelectModal
        visible={showUniversityModal}
        options={UNIVERSITY_OPTIONS}
        selectedId={selectedUniversityId}
        onSelect={handleUniversitySelect}
        onClose={() => setShowUniversityModal(false)}
        title="다른 제휴혜택 보기"
      />
    </>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  // MainImageSection
  imageContainer: {
    width: '100%',
    height: rs(280),
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  backButton: {
    position: 'absolute',
    left: rs(16),
    width: rs(40),
    height: rs(40),
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    position: 'absolute',
    right: rs(16),
    width: rs(40),
    height: rs(40),
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloverBadge: {
    position: 'absolute',
    right: rs(16),
    bottom: rs(16),
  },
  cloverImage: {
    width: rs(25),
    height: rs(25),
    resizeMode: 'contain',
  },

  // StoreInfoSection
  headerContent: {
    paddingHorizontal: rs(20),
    gap: rs(12),
    paddingTop: rs(16),
  },
  infoContainer: {
    gap: rs(8),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  category: {
    fontSize: rs(12),
    color: Text.primary,
  },
  divider: {
    fontSize: rs(12),
    color: Gray.gray2,
  },
  reviewCount: {
    fontSize: rs(12),
    color: Text.placeholder,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
  },
  infoText: {
    fontSize: rs(12),
    color: Text.primary,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  expandedHours: {
    marginLeft: rs(20),
    paddingLeft: rs(12),
    gap: rs(4),
    borderLeftWidth: 2,
    borderLeftColor: Gray.gray3,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: rs(4),
  },
  dayText: {
    fontSize: rs(12),
    color: Text.secondary,
    width: rs(60),
  },
  hourText: {
    fontSize: rs(12),
    color: Text.primary,
    flex: 1,
  },

  // TagSection
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: rs(8),
  },
  universityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Owner.textBg,
    borderRadius: 16,
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    gap: rs(4),
  },
  universityText: {
    fontSize: rs(12),
    color: Owner.primary,
    fontWeight: '500',
  },
  partnerBadge: {
    backgroundColor: Owner.primary,
    borderRadius: 16,
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
  },
  partnerText: {
    fontSize: rs(12),
    color: Gray.white,
    fontWeight: '600',
  },
});
