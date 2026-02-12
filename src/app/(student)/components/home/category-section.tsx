import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Text as TextColor } from '@/src/shared/theme/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

// SVG 아이콘 import
import CategoryBeer from '@/assets/images/icons/home/category-beer.svg';
import CategoryCafe from '@/assets/images/icons/home/category-cafe.svg';
import CategoryEvent from '@/assets/images/icons/home/category-event.svg';
import CategoryHealth from '@/assets/images/icons/home/category-health.svg';
import CategoryPlay from '@/assets/images/icons/home/category-play.svg';
import CategoryRestaurant from '@/assets/images/icons/home/category-resturant.svg';
import CategoryTotal from '@/assets/images/icons/home/category-total.svg';

type SvgComponent = React.FC<SvgProps>;

interface CategoryItem {
  id: string;
  label: string;
  Icon: SvgComponent | null;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'ALL', label: '전체', Icon: CategoryTotal, color: '#6B7280' },
  { id: 'RESTAURANT', label: '식당', Icon: CategoryRestaurant, color: '#EF6939' },
  { id: 'BAR', label: '주점', Icon: CategoryBeer, color: '#D98026' },
  { id: 'CAFE', label: '카페', Icon: CategoryCafe, color: '#19A2E6' },
  { id: 'ENTERTAINMENT', label: '놀거리', Icon: CategoryPlay, color: '#7547D1' },
  { id: 'BEAUTY_HEALTH', label: '뷰티•헬스', Icon: CategoryHealth, color: '#DD3C71' },
  { id: 'EVENT', label: '이벤트', Icon: CategoryEvent, color: '#FF6B6B' },
  { id: 'ETC', label: 'ETC', Icon: null, color: '#F59E0B' },
];

export function CategorySection() {
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    if (categoryId === 'ALL') {
      router.push('/map');
    } else {
      router.push(`/map?category=${categoryId}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              {category.Icon ? (
                <category.Icon width={rs(44)} height={rs(36)} />
              ) : (
                <ThemedText style={styles.iconText}>···</ThemedText>
              )}
              <ThemedText style={styles.label}>{category.label}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: rs(8),
  },
  scrollContent: {
    gap: rs(10),
    paddingHorizontal: rs(4),
  },
  categoryItem: {
    alignItems: 'center',
  },
  iconCircle: {
    width: rs(64),
    height: rs(76),
    borderRadius: rs(20),
    backgroundColor: Gray.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Gray.gray4,
    borderWidth: 2,
    gap: rs(4),
  },
  iconText: {
    fontSize: rs(20),
    color: TextColor.tertiary,
  },
  label: {
    fontSize: rs(12),
    fontWeight: '500',
    color: TextColor.primary,
  },
});
