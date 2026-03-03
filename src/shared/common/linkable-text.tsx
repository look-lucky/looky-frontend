import { rs } from '@/src/shared/theme/scale';
import { System, Text as TextColor } from '@/src/shared/theme/theme';
import React from 'react';
import { Linking, StyleProp, Text, TextStyle } from 'react-native';

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

interface LinkableTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
}

export function LinkableText({ children, style }: LinkableTextProps) {
  const parts = children.split(URL_REGEX);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (URL_REGEX.test(part)) {
          return (
            <Text
              key={index}
              style={{ color: System.phoneNumber, textDecorationLine: 'underline' }}
              onPress={() => Linking.openURL(part)}
            >
              {part}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
}
