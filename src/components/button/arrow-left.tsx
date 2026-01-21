import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type ArrowLeftProps = PressableProps & {
  onPress?: () => void;
  size?: number;
};

export function ArrowLeft({ onPress, size = 24, style, ...otherProps }: ArrowLeftProps) {
  return (
    <Pressable
      style={[styles.container, style]}
      onPress={onPress}
      hitSlop={8}
      {...otherProps}
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
