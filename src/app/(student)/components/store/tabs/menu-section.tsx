import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import {
  Fonts,
} from '@/src/shared/theme/theme';
import type { MenuCategory, MenuItem } from '@/src/shared/types/store';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Re-export types for convenience
export type { MenuCategory, MenuItem };

interface MenuSectionProps {
  categories: MenuCategory[];
  scrollViewRef?: React.RefObject<ScrollView | null>;
  scrollOffsetY?: React.RefObject<number>;
}

// ============================================
// CategoryHeader
// ============================================

function CategoryHeader({ name }: { name: string }) {
  return (
    <ThemedText style={styles.categoryHeader} lightColor="#000000" darkColor="#000000">{name}</ThemedText>
  );
}

// ============================================
// Badge
// ============================================

type BadgeVariant = 'BEST' | 'HOT' | 'VEGAN' | 'NEW';

const badgeColors: Record<string, string> = {
  BEST: '#000000',
  HOT: '#FF2727',
  VEGAN: '#309821',
  NEW: '#FFD013',
};

function Badge({ label }: { label: string }) {
  const variant = label.toUpperCase() as BadgeVariant;
  const bgColor = badgeColors[variant] || '#000000';

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <ThemedText style={styles.badgeText} lightColor="#ffffff" darkColor="#ffffff">{label.toUpperCase()}</ThemedText>
    </View>
  );
}

// ============================================
// SoldOutLabel
// ============================================

function SoldOutLabel() {
  return (
    <ThemedText style={styles.soldOutLabel} lightColor="#FF2727" darkColor="#FF2727">⊘ 품절됐어요</ThemedText>
  );
}

// ============================================
// MenuItemCard
// ============================================

function MenuItemCard({ item }: { item: MenuItem }) {
  const formattedPrice = item.price.toLocaleString() + '원';

  // Use the badge field from the item, or fallback to flags if necessary
  const badgeLabel = item.badge || (item.isBest ? 'BEST' : item.isHot ? 'HOT' : null);

  return (
    <View style={styles.menuCard}>
      <View style={styles.menuContent}>
        <View style={styles.menuInfo}>
          <View style={styles.menuInfoTopGroup}>
            {badgeLabel && (
              <View style={styles.badgeRow}>
                <Badge label={badgeLabel} />
              </View>
            )}
            <View style={styles.menuInfoTop}>
              <ThemedText style={styles.menuName} lightColor="#000000" darkColor="#000000">{item.name}</ThemedText>
              {item.description && (
                <ThemedText style={styles.menuDescription} numberOfLines={2} lightColor="#828282" darkColor="#828282">
                  {item.description}
                </ThemedText>
              )}
            </View>
          </View>

          <View style={styles.menuInfoBottom}>
            <ThemedText
              style={[
                styles.menuPrice,
                item.isSoldOut && styles.menuPriceSoldOut
              ]}
              lightColor={item.isSoldOut ? '#D5D5D5' : '#000000'}
              darkColor={item.isSoldOut ? '#D5D5D5' : '#000000'}
            >
              {formattedPrice}
            </ThemedText>
            {item.isSoldOut && (
              <View style={styles.soldOutContainer}>
                <ThemedText style={styles.soldOutIcon} lightColor="#FF0000" darkColor="#FF0000">⊘</ThemedText>
                <ThemedText style={styles.soldOutLabel} lightColor="#FF0000" darkColor="#FF0000">품절됐어요</ThemedText>
              </View>
            )}
          </View>
        </View>

        {item.image && (
          <Image source={{ uri: item.image }} style={styles.menuImage} />
        )}
      </View>
    </View>
  );
}

// ============================================
// CategorySelector
// ============================================

interface CategorySelectorProps {
  categories: { id: string, name: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}

function CategorySelector({ categories, activeId, onSelect }: CategorySelectorProps) {
  return (
    <View style={styles.selectorWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorContainer}
      >
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                isActive ? styles.categoryChipActive : styles.categoryChipInactive
              ]}
              onPress={() => onSelect(cat.id)}
            >
              <ThemedText style={[
                styles.categoryChipText,
                isActive ? styles.categoryChipTextActive : styles.categoryChipTextInactive
              ]}>
                {cat.name}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ============================================
// MenuSection (Export)
// ============================================

export function MenuSection({ categories, scrollViewRef }: MenuSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = React.useState(categories[0]?.id || '');
  const categoryPositions = React.useRef<Record<string, number>>({});
  const containerRef = React.useRef<View>(null);

  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText} lightColor="#999" darkColor="#999">
          등록된 메뉴가 없습니다.
        </ThemedText>
      </View>
    );
  }

  const selectorCategories = categories.map(c => ({ id: c.id, name: c.name }));

  const handleCategorySelect = (id: string) => {
    setActiveCategoryId(id);

    const yPos = categoryPositions.current[id];
    if (yPos !== undefined && scrollViewRef?.current) {
      // MenuSection의 시작 위치를 알아내기 위해 measureLayout 사용하거나,
      // 부모로부터 전달받은 contentYRef(가게 정보 아래)를 활용할 수 있음.
      // 여기서는 containerRef를 통해 ScrollView 내에서의 상대 위치를 계산합니다.
      containerRef.current?.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          // 카테고리 선택기(selectorWrapper)의 높이만큼 더 내려가야함
          // selectorWrapper height (paddingVertical rs(10) * 2 + categoryChip rs(25))
          const selectorHeight = rs(45);
          scrollViewRef.current?.scrollTo({
            y: y + selectorHeight + yPos,
            animated: true,
          });
        },
        () => { }
      );
    }
  };

  return (
    <View ref={containerRef} style={styles.container}>
      <CategorySelector
        categories={selectorCategories}
        activeId={activeCategoryId}
        onSelect={handleCategorySelect}
      />
      <View style={styles.listContent}>
        {categories.map((category, catIndex) => (
          <View
            key={category.id}
            style={styles.categoryContainer}
            onLayout={(event) => {
              categoryPositions.current[category.id] = event.nativeEvent.layout.y;
            }}
          >
            {catIndex > 0 && <View style={styles.sectionDivider} />}
            <CategoryHeader name={category.name} />
            <View style={styles.menuList}>
              {category.items.map((item) => (
                <React.Fragment key={item.id}>
                  <MenuItemCard item={item} />
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    gap: 0,
    marginHorizontal: -rs(20), // Compensate for parent padding to make scroll full width if needed
  },
  selectorWrapper: {
    backgroundColor: '#fff',
    paddingTop: rs(5),
    paddingBottom: rs(10),
  },
  selectorContainer: {
    paddingHorizontal: rs(20),
    gap: rs(5),
    alignItems: 'center',
  },
  categoryChip: {
    height: rs(25),
    paddingHorizontal: rs(10),
    borderRadius: rs(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#309821',
  },
  categoryChipInactive: {
    backgroundColor: '#D5D5D5',
  },
  categoryChipText: {
    fontSize: rs(12),
    lineHeight: rs(16.8),
    includeFontPadding: false,
  },
  categoryChipTextActive: {
    color: 'white',
    fontFamily: Fonts.bold, // 700
  },
  categoryChipTextInactive: {
    color: 'white',
    fontFamily: Fonts.medium, // 500 or 600
  },
  listContent: {
    paddingHorizontal: rs(20),
    gap: rs(12),
  },
  emptyContainer: {
    paddingVertical: rs(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: rs(14),
    color: '#999',
  },
  categoryContainer: {
    gap: rs(3),
    paddingTop: rs(8),
  },
  categoryHeader: {
    fontFamily: Fonts.semiBold,
    fontSize: rs(20),
    lineHeight: rs(28),
    color: '#000000',
    paddingVertical: rs(2),
  },
  menuList: {
    gap: rs(12),
  },

  // MenuItemCard
  menuCard: {
    paddingVertical: rs(10),
    minHeight: rs(120),
    justifyContent: 'center',
  },

  badgeRow: {
    flexDirection: 'row',
    marginBottom: rs(2),
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(11),
  },
  menuImage: {
    width: rs(95),
    height: rs(95),
    borderRadius: rs(10),
    backgroundColor: '#f0f0f0',
  },
  menuInfo: {
    flex: 1,
    height: rs(95),
    justifyContent: 'space-between',
    paddingBottom: rs(2),
  },
  menuInfoTopGroup: {
    gap: rs(2),
    paddingTop: 0,
  },
  menuInfoTop: {
    gap: rs(2),
  },
  menuInfoBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  menuName: {
    fontFamily: Fonts.medium,
    fontSize: rs(16),
    lineHeight: rs(22.4),
    color: '#000000',
  },
  menuDescription: {
    fontFamily: Fonts.regular,
    fontSize: rs(12),
    lineHeight: rs(16.8),
    color: '#828282',
  },
  menuPrice: {
    fontFamily: Fonts.medium,
    fontSize: rs(16),
    lineHeight: rs(22.4),
    color: '#000000',
  },
  menuPriceSoldOut: {
    color: '#D5D5D5',
  },

  // Badge
  badge: {
    height: rs(16),
    paddingHorizontal: rs(5),
    borderRadius: rs(5),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: rs(10),
    lineHeight: rs(11),
    color: '#ffffff',
    includeFontPadding: false,
  },

  // SoldOut
  soldOutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(1),
  },
  soldOutIcon: {
    fontFamily: Fonts.medium,
    fontSize: rs(20),
    lineHeight: rs(18),
    color: '#FF0000',
    marginTop: rs(3),
  },
  soldOutLabel: {
    fontFamily: Fonts.medium,
    fontSize: rs(12),
    lineHeight: rs(16.8),
    color: '#FF0000',
  },

  // Dividers
  itemDivider: {
    height: 1,
    backgroundColor: '#F0F0F0', // Subtle light divider between items
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginBottom: rs(5),
  },
});
