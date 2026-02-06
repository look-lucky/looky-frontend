import { ArrowLeft } from '@/src/shared/common/arrow-left';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Brand, Gray, Notify, Text as TextColor } from '@/src/shared/theme/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationType = 'COMMENT' | 'COUPON' | 'REVIEW';

interface NotificationItem {
  id: number;
  type: NotificationType;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// Mock 데이터
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: 'COMMENT',
    message: "사장님의 답글이 달렸습니다: '감사합니다!'",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 2,
    type: 'COUPON',
    message: '10% 할인 쿠폰이 만료되었습니다.',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 3,
    type: 'COMMENT',
    message: "사장님이 답글을 남겼어요: '또 방문해주세요!!😍'",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
];

export default function NotificationScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const filteredNotifications =
    activeTab === 'all'
      ? MOCK_NOTIFICATIONS
      : MOCK_NOTIFICATIONS.filter((n) => !n.isRead);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    }
    return `${diffHours}시간 전`;
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'COMMENT':
        return '💬';
      case 'COUPON':
        return '🎫';
      case 'REVIEW':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const getNotificationBgColor = (type: NotificationType) => {
    switch (type) {
      case 'COMMENT':
        return Notify.bgReview;
      case 'COUPON':
        return Notify.bgCoupon;
      case 'REVIEW':
        return Notify.bgInfo;
      default:
        return Gray.gray2;
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity style={styles.notificationItem} activeOpacity={0.7}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getNotificationBgColor(item.type) },
        ]}
      >
        <ThemedText style={styles.icon}>
          {getNotificationIcon(item.type)}
        </ThemedText>
      </View>
      <View style={styles.contentContainer}>
        <ThemedText style={styles.message} numberOfLines={2}>
          {item.message}
        </ThemedText>
        <ThemedText style={styles.time}>{getTimeAgo(item.createdAt)}</ThemedText>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={rs(24)} color={Gray.black} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>전체알림</ThemedText>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'all' && styles.tabTextActive,
              ]}
            >
              전체
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'unread' && styles.tabActive]}
            onPress={() => setActiveTab('unread')}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'unread' && styles.tabTextActive,
              ]}
            >
              미확인
            </ThemedText>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.totalCount}>
          총 {filteredNotifications.length}개
        </ThemedText>
      </View>

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>알림이 없습니다</ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderBottomWidth: 1,
    borderBottomColor: Gray.gray3,
  },
  backButton: {
    padding: rs(4),
  },
  headerTitle: {
    fontSize: rs(18),
    fontWeight: '700',
    color: TextColor.primary,
  },
  headerRight: {
    width: rs(32),
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
  },
  tabWrapper: {
    flexDirection: 'row',
    gap: rs(8),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(16),
    paddingVertical: rs(8),
    borderRadius: rs(20),
    backgroundColor: Gray.gray2,
    gap: rs(4),
  },
  tabActive: {
    backgroundColor: Brand.primary,
  },
  tabText: {
    fontSize: rs(14),
    fontWeight: '500',
    color: TextColor.secondary,
  },
  tabTextActive: {
    color: Gray.white,
  },
  badge: {
    backgroundColor: Notify.importHeart,
    borderRadius: rs(10),
    minWidth: rs(20),
    height: rs(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(6),
  },
  badgeText: {
    fontSize: rs(11),
    fontWeight: '700',
    color: Gray.white,
  },
  totalCount: {
    fontSize: rs(12),
    color: TextColor.tertiary,
  },
  listContent: {
    paddingHorizontal: rs(16),
    paddingBottom: rs(20),
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    borderRadius: rs(12),
    padding: rs(16),
    marginBottom: rs(12),
    gap: rs(12),
  },
  iconContainer: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: rs(20),
  },
  contentContainer: {
    flex: 1,
    gap: rs(4),
  },
  message: {
    fontSize: rs(14),
    fontWeight: '500',
    color: TextColor.primary,
    lineHeight: rs(20),
  },
  time: {
    fontSize: rs(12),
    color: TextColor.tertiary,
  },
  unreadDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: '#3B82F6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rs(60),
  },
  emptyText: {
    fontSize: rs(14),
    color: TextColor.tertiary,
  },
});
