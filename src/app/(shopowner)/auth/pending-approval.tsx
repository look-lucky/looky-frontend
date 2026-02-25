import { useLogout } from "@/src/api/auth";
import { getGetMyStoreClaimsQueryKey } from "@/src/api/store-claim";
import { AppButton } from "@/src/shared/common/app-button";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useAuth } from "@/src/shared/lib/auth";
import { rs } from "@/src/shared/theme/scale";
import { Gray, Owner, Text as TextColors } from "@/src/shared/theme/theme";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

// 대기 중 아이콘
function PendingIcon() {
  return (
    <Svg width={rs(80)} height={rs(80)} viewBox="0 0 80 80" fill="none">
      <Circle cx="40" cy="40" r="38" stroke={Owner.primary} strokeWidth="4" />
      <Path
        d="M40 20v20l14 14"
        stroke={Owner.primary}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function PendingApprovalScreen() {
  const { handleLogout } = useAuth();
  const queryClient = useQueryClient();

  const [isChecking, setIsChecking] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logoutMutation = useLogout();

  // 상태 새로고침 → _layout의 useGetMyStoreClaims 쿼리를 invalidate
  const handleRefreshStatus = async () => {
    setIsChecking(true);
    try {
      const result = await queryClient.fetchQuery({
        queryKey: getGetMyStoreClaimsQueryKey(),
      });

      const claims = (result as any)?.data?.data;
      if (!claims || claims.length === 0) {
        Alert.alert('알림', '승인 요청 정보를 찾을 수 없습니다.');
        return;
      }

      const status = claims[0].status;

      if (status === 'APPROVED') {
        // _layout에서 자동으로 ShopOwnerApp으로 전환됨
        await queryClient.invalidateQueries({
          queryKey: getGetMyStoreClaimsQueryKey(),
        });
      } else if (status === 'REJECTED') {
        Alert.alert(
          '승인 거부',
          '승인이 거부되었습니다. 고객센터로 문의해주세요.',
        );
      } else {
        Alert.alert('알림', '아직 승인 대기 중입니다.');
      }
    } catch (error) {
      console.error('상태 확인 실패:', error);
      Alert.alert('오류', '상태 확인 중 오류가 발생했습니다.');
    } finally {
      setIsChecking(false);
    }
  };

  // 로그아웃
  const handleLogoutPress = async () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logoutMutation.mutateAsync();
              await handleLogout();
            } catch (error) {
              console.error('로그아웃 실패:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* 아이콘 */}
      <View style={styles.iconContainer}>
        <PendingIcon />
      </View>

      {/* 메시지 */}
      <View style={styles.messageContainer}>
        <ThemedText type="subtitle" style={styles.title}>
          승인 대기 중입니다
        </ThemedText>
        <ThemedText style={styles.description}>
          관리자 승인 후 서비스를 이용하실 수 있습니다.
        </ThemedText>
        <ThemedText style={styles.description}>
          일반적으로 1-2 영업일이 소요됩니다.
        </ThemedText>
      </View>

      {/* 안내 카드 */}
      <View style={styles.infoCard}>
        <ThemedText style={styles.infoTitle}>📌 안내사항</ThemedText>
        <ThemedText style={styles.infoText}>
          • 승인 완료 시 알림을 보내드립니다
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • 문의사항은 고객센터로 연락해주세요
        </ThemedText>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomContent}>
        <AppButton
          label={isChecking ? "확인 중..." : "상태 새로고침"}
          backgroundColor={Owner.primary}
          onPress={handleRefreshStatus}
          disabled={isChecking}
        />
        <AppButton
          label={isLoggingOut ? "처리 중..." : "로그아웃"}
          backgroundColor={Gray.gray4}
          onPress={handleLogoutPress}
          disabled={isLoggingOut}
          style={{ marginTop: rs(12) }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
    padding: rs(20),
  },
  iconContainer: {
    alignItems: "center",
    marginTop: rs(60),
    marginBottom: rs(32),
  },
  messageContainer: {
    gap: rs(12),
    alignItems: "center",
    marginBottom: rs(40),
  },
  title: {
    fontSize: rs(24),
    fontWeight: "800",
    color: TextColors.primary,
    textAlign: "center",
    paddingTop: rs(4),
    lineHeight: rs(32),
  },
  description: {
    fontSize: rs(14),
    color: TextColors.secondary,
    textAlign: "center",
    lineHeight: rs(20),
  },
  infoCard: {
    backgroundColor: Gray.gray1,
    borderRadius: rs(12),
    padding: rs(20),
    gap: rs(8),
    marginBottom: rs(32),
  },
  infoTitle: {
    fontSize: rs(14),
    fontWeight: "700",
    color: TextColors.primary,
    marginBottom: rs(4),
  },
  infoText: {
    fontSize: rs(13),
    color: TextColors.secondary,
    lineHeight: rs(18),
  },
  bottomContent: {
    marginTop: "auto",
  },
});
