import { AppButton } from '@/src/shared/common/app-button';
import { rs } from '@/src/shared/theme/scale';
import { Brand, Gray, Text as TextColor } from '@/src/shared/theme/theme';
import React from 'react';
import { type ColorValue, Modal, Platform, StyleSheet, Text, View } from 'react-native';

export interface AppPopupButton {
  label: string;
  onPress: () => void;
  backgroundColor?: ColorValue;
}

interface AppPopupProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  buttons?: AppPopupButton[];
  onClose: () => void;
}

export function AppPopup({ visible, title, subtitle, buttons, onClose }: AppPopupProps) {
  const popupButtons = buttons ?? [
    { label: '확인', onPress: onClose, backgroundColor: Brand.primaryDarken },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.btnRow}>
            {popupButtons.map((btn, idx) => (
              <AppButton
                key={idx}
                label={btn.label}
                backgroundColor={btn.backgroundColor ?? Brand.primaryDarken}
                style={popupButtons.length === 1 ? styles.btnFull : styles.btnHalf}
                onPress={btn.onPress}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Gray.popupBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: rs(335),
    backgroundColor: Gray.white,
    borderRadius: rs(10),
    paddingTop: rs(40),
    paddingBottom: rs(25),
    paddingHorizontal: rs(20),
    alignItems: 'center',
    gap: rs(20),
    ...Platform.select({
      ios: {
        shadowColor: Gray.black,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  textContainer: {
    alignItems: 'center',
    gap: rs(8),
  },
  title: {
    fontSize: rs(20),
    fontWeight: '700',
    color: TextColor.primary,
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: rs(14),
    fontWeight: '500',
    color: TextColor.placeholder,
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: rs(8),
  },
  btnHalf: {
    flex: 1,
  },
  btnFull: {
    width: rs(295),
  },
});
