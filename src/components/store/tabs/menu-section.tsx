import { ThemedText } from '@/src/components/common/themed-text';
import { rs } from '@/src/theme/scale';
import type { MenuCategory, MenuItem } from '@/src/types/store';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Re-export types for convenience
export type { MenuCategory, MenuItem };

interface MenuSectionProps {
  categories: MenuCategory[];
}

// ============================================
// CategoryHeader
// ============================================

function CategoryHeader({ name }: { name: string }) {
  return (
    <ThemedText style={styles.categoryHeader}>{name}</ThemedText>
  );
}

// ============================================
// Badge
// ============================================

type BadgeVariant = 'best' | 'hot';

const badgeColors: Record<BadgeVariant, string> = {
  best: '#000000',
  hot: '#FF2727',
};

function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <View style={[styles.badge, { backgroundColor: badgeColors[variant] }]}>
      <ThemedText style={styles.badgeText}>{variant.toUpperCase()}</ThemedText>
    </View>
  );
}

// ============================================
// SoldOutLabel
// ============================================

function SoldOutLabel() {
  return (
    <ThemedText style={styles.soldOutLabel}>⊘ 품절됐어요</ThemedText>
  );
}

// ============================================
// MenuItemCard
// ============================================

function MenuItemCard({ item }: { item: MenuItem }) {
  const formattedPrice = item.price.toLocaleString() + '원';
  const hasBadge = item.isBest || item.isHot;

  return (
    <View style={styles.menuCard}>
      <View style={styles.menuContent}>
        <View style={styles.menuInfo}>
          {hasBadge && (
            <View style={styles.badgeRow}>
              {item.isBest && <Badge variant="best" />}
              {item.isHot && <Badge variant="hot" />}
            </View>
          )}
          <View style={styles.menuInfoTop}>
            <ThemedText style={styles.menuName}>{item.name}</ThemedText>
            {item.description && (
              <ThemedText style={styles.menuDescription} numberOfLines={1}>
                {item.description}
              </ThemedText>
            )}
          </View>

          <View style={styles.menuInfoBottom}>
            <ThemedText style={styles.menuPrice}>{formattedPrice}</ThemedText>
            {item.isSoldOut && <SoldOutLabel />}
          </View>
        </View>

        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.menuImage} />
        ) : (
          <View style={[styles.menuImage, styles.menuImagePlaceholder]} />
        )}
      </View>
    </View>
  );
}

// ============================================
// MenuSection (Export)
// ============================================

export function MenuSection({ categories }: MenuSectionProps) {
  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <View key={category.id} style={styles.categoryContainer}>
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
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    gap: rs(12),
  },
  categoryContainer: {
    gap: rs(12),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: rs(12),
  },
  categoryHeader: {
    fontSize: rs(20),
    fontWeight: '500',
    color: '#000000',
    paddingVertical: rs(4),
  },
  menuList: {
    gap: rs(12),
  },

  // MenuItemCard
  menuCard: {
    paddingVertical: rs(12),
  },

  badgeRow: {
    flexDirection: 'row',
    gap: rs(4),
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  menuImage: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(8),
    backgroundColor: '#f0f0f0',
  },
  menuImagePlaceholder: {
    backgroundColor: '#e0e0e0',
  },
  menuInfo: {
    flex: 1,
    height: rs(80),
    justifyContent: 'space-between',
  },
  menuInfoTop: {
    gap: rs(0),
  },
  menuInfoBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  menuName: {
    fontSize: rs(16),
    fontWeight: '500',
    color: '#000000',
  },
  menuDescription: {
    fontSize: rs(12),
    fontWeight: '400',
    color: '#828282',
  },
  menuPrice: {
    fontSize: rs(16),
    fontWeight: '500',
    color: '#000000',
  },

  // Badge
  badge: {
    borderRadius: rs(4),
    paddingHorizontal: rs(6),
  },
  badgeText: {
    fontSize: rs(8),
    fontWeight: '700',
    color: '#ffffff',
  },

  // SoldOutLabel
  soldOutLabel: {
    fontSize: rs(12),
    fontWeight: '500',
    color: '#FF2727',
  },
});
