import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/src/shared/hooks/use-theme-color';
import { Fonts } from '@/src/shared/theme/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 25,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  

  
  link: {
    fontFamily: Fonts.regular,
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
