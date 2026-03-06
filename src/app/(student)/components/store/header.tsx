import type { StorePartnershipResponse, StoreResponseCloverGrade } from '@/src/api/generated.schemas';
import { SelectModal } from '@/src/shared/common/select-modal';
import { ThemedText } from '@/src/shared/common/themed-text';
import { ThemedView } from '@/src/shared/common/themed-view';
import { useAuth } from '@/src/shared/lib/auth';
import { rs } from '@/src/shared/theme/scale';
import { Brand, Gray, System, Text } from '@/src/shared/theme/theme';
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
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CLOVER_IMAGES: Record<string, ImageSourcePropType> = {
  SEED: require('@/assets/images/icons/store/clover-one.png'),
  SPROUT: require('@/assets/images/icons/store/clover-two.png'),
  THREE_LEAF: require('@/assets/images/icons/store/clover-three.png'),
};

const DEFAULT_BANNER = require('../../../../../assets/images/store/default-banner.png');

// Android LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================
// Types
// ============================================

interface StoreHeaderProps {
  image?: string | null;
  cloverGrade?: StoreResponseCloverGrade;
  isLiked: boolean;
  name: string;
  rating: number;
  category: string;
  reviewCount: number;
  address: string;
  openHours: string;
  closedDays: string;
  university: string;
  isPartner: boolean;
  partnerships: StorePartnershipResponse[];
  onBack: () => void;
  onLike: () => void;
  onReviewPress?: () => void;
  onUniversityChange?: (orgName: string) => void;
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
  image?: string | null;
  cloverGrade?: StoreResponseCloverGrade;
  isLiked: boolean;
  onBack: () => void;
  onLike: () => void;
}) {
  const insets = useSafeAreaInsets();
  const cloverImage = cloverGrade ? CLOVER_IMAGES[cloverGrade] : null;

  const [hasError, setHasError] = useState(false);
  const imageSource = (image && image.trim().length > 0 && !hasError) ? { uri: image } : DEFAULT_BANNER;

  return (
    <ThemedView style={styles.imageContainer}>
      <Image
        source={imageSource}
        style={styles.image}
        onError={() => setHasError(true)}
      />

      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + rs(8) }]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={rs(20)} color="#1B1D1F" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.likeButton, { top: insets.top + rs(8) }]}
        onPress={onLike}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isLiked ? 'bookmark' : 'bookmark-outline'}
          size={rs(18)}
          color={isLiked ? Brand.primary : '#1B1D1F'}
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
  closedDays,
  onReviewPress,
}: {
  name: string;
  rating: number;
  category: string;
  reviewCount: number;
  address: string;
  openHours: string;
  closedDays: string;
  onReviewPress?: () => void;
}) {
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);

  const allHours = parseAllOperatingHours(openHours);

  const getTodayHoursDisplay = () => {
    if (!openHours) return '정보없음';
    const hours = formatOperatingHours(openHours);
    if (hours === '휴무') return '휴무';

    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
    const todayIndex = (new Date().getDay() + 6) % 7;
    const todayLabel = dayLabels[todayIndex];

    return `${todayLabel} ${hours}`;
  };

  const todayHoursDisplay = getTodayHoursDisplay();

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

      <View style={styles.categoryRow}>
        <ThemedText style={styles.category}>{category}</ThemedText>
        <ThemedText style={styles.divider}>|</ThemedText>
        <TouchableOpacity
          style={styles.reviewCountRow}
          onPress={onReviewPress}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.reviewCount}>리뷰 {reviewCount}개</ThemedText>
          <Ionicons name="chevron-forward" size={rs(12)} color={Text.tertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.horizontalDivider} />

      <ThemedView style={styles.infoRow}>
        <Ionicons name="location-outline" size={rs(14)} color={Text.secondary} />
        <ThemedText style={styles.infoText}>{address}</ThemedText>
      </ThemedView>

      <TouchableOpacity style={styles.infoRow} onPress={handleToggleHours}>
        <Ionicons name="time-outline" size={rs(14)} color={Text.secondary} />
        <ThemedText style={styles.infoText}>
          영업시간 {todayHoursDisplay}
        </ThemedText>
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

      <ThemedView style={[styles.infoRow, { marginTop: rs(2) }]}>
        <Ionicons name="time-outline" size={rs(14)} color={Text.secondary} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(5) }}>
          <ThemedText style={styles.infoText}>
            휴무일 <ThemedText style={[styles.infoText, { color: closedDays ? '#FF6200' : '#1B1D1F' }]}>
              {closedDays ? closedDays : '없음'}
            </ThemedText>
          </ThemedText>
        </View>
      </ThemedView>

      <View style={styles.horizontalDivider} />
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
        <View style={styles.universityIconBox}>
          <Ionicons name="school" size={rs(12)} color={Gray.white} />
        </View>
        <ThemedText style={styles.universityText}>{university}</ThemedText>
        <Ionicons name="chevron-down" size={rs(14)} color="#828282" />
      </TouchableOpacity>

      <ThemedView style={[styles.partnerBadge, !isPartner && styles.noPartnerBadge]}>
        <ThemedText style={styles.partnerText}>내 제휴</ThemedText>
      </ThemedView>
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
  closedDays,
  university,
  isPartner,
  partnerships,
  onBack,
  onLike,
  onReviewPress,
  onUniversityChange,
}: StoreHeaderProps) {
  const { collegeName } = useAuth();
  const [showUniversityModal, setShowUniversityModal] = useState(false);

  // partnership 목록 → SelectModal 옵션 (organizationName을 id/label로 사용)
  const partnershipOptions = React.useMemo(() =>
    partnerships
      .filter((p) => p.organizationName)
      .map((p) => ({ id: p.organizationName!, label: p.organizationName! })),
    [partnerships],
  );

  // 정렬 로직 및 하이라이트 id 추출
  const sortedOptions = React.useMemo(() => {
    return [...partnershipOptions].sort((a, b) => {
      // 1순위: 사용자 소속 단과대
      const isAUserCollege = a.label === collegeName;
      const isBUserCollege = b.label === collegeName;
      if (isAUserCollege && !isBUserCollege) return -1;
      if (!isAUserCollege && isBUserCollege) return 1;

      // 2순위: 총학생회 (키워드 포함)
      const isAStudentUnion = a.label.includes('총학생회');
      const isBStudentUnion = b.label.includes('총학생회');
      if (isAStudentUnion && !isBStudentUnion) return -1;
      if (!isAStudentUnion && isBStudentUnion) return 1;

      // 3순위: 총동아리연합회 (키워드 포함)
      const isAAlumni = a.label.includes('총동아리연합회') || a.label.includes('총동연');
      const isBAlumni = b.label.includes('총동아리연합회') || b.label.includes('총동연');
      if (isAAlumni && !isBAlumni) return -1;
      if (!isAAlumni && isBAlumni) return 1;

      // 4순위: 가나다순
      return a.label.localeCompare(b.label, 'ko');
    });
  }, [partnershipOptions, collegeName]);

  const highlightedIds = React.useMemo(() => {
    return sortedOptions.slice(0, 3).map((opt) => opt.id);
  }, [sortedOptions]);

  const handleUniversitySelect = (id: string | number) => {
    const orgName = String(id);
    if (onUniversityChange) {
      onUniversityChange(orgName);
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
          closedDays={closedDays}
          onReviewPress={onReviewPress}
        />
        <TagSection
          university={university}
          isPartner={isPartner}
          onUniversityPress={() => setShowUniversityModal(true)}
        />
      </ThemedView>

      <SelectModal
        visible={showUniversityModal}
        options={sortedOptions}
        selectedId={university}
        onSelect={handleUniversitySelect}
        onClose={() => setShowUniversityModal(false)}
        title="다른 제휴혜택 보기"
        highlightedIds={highlightedIds}
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
    width: rs(35),
    height: rs(35),
    borderRadius: rs(9999),
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    position: 'absolute',
    right: rs(16),
    width: rs(35),
    height: rs(35),
    borderRadius: rs(9999),
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloverBadge: {
    position: 'absolute',
    right: rs(16),
    bottom: rs(16),
    paddingHorizontal: rs(8),
    paddingVertical: rs(2),
    backgroundColor: Gray.white,
    borderRadius: rs(20),
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: rs(4),
    // shadow for Android
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
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
    fontSize: rs(14),
    color: Text.placeholder,
  },
  divider: {
    fontSize: rs(14),
    color: "#E6E6E6",
  },
  reviewCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  reviewCount: {
    fontSize: rs(14),
    color: Text.placeholder,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: rs(2),
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
    gap: rs(8),
  },
  universityIconBox: {
    width: rs(24),
    height: rs(24),
    backgroundColor: '#309821',
    borderRadius: rs(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  universityText: {
    fontSize: rs(14),
    color: '#000000',
    fontWeight: '700',
    fontFamily: 'Pretendard',
  },
  partnerBadge: {
    backgroundColor: '#309821',
    borderRadius: 20,
    paddingHorizontal: rs(10),
    height: rs(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPartnerBadge: {
    backgroundColor: '#D5D5D5',
  },
  partnerText: {
    fontSize: rs(11),
    color: Gray.white,
    fontWeight: '700',
    fontFamily: 'Pretendard',
    lineHeight: 16.8,
  },
},);
