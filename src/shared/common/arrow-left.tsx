import { Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type ArrowLeftProps = {
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function ArrowLeft({ onPress, size = 24, style }: ArrowLeftProps) {
  return (
    <Pressable
      style={[styles.container, style as ViewStyle]}
      onPress={onPress}
      hitSlop={8}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M19 12H5M5 12L12 19M5 12L12 5"
          stroke="#1B1D1F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
