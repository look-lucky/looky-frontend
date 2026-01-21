import { ThemedText } from '@/src/components/themed-text';
import { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

// // 가입 유형
// <SignupTypeSelector type="signup-type" onSelect={handleSignupType} />

// // 성별
// <SignupTypeSelector type="gender" onSelect={handleGender} />

// // 커스텀
// <SignupTypeSelector 
//   type="gender" 
//   title="성별 선택"
//   options={[...]}
//   onSelect={handleSelect}
// />

const buttonOffIcon = require('@/assets/images/버튼꺼짐.svg');
const buttonOnIcon = require('@/assets/images/버튼켜짐.svg');

export type SelectorOption = {
  id: string;
  label: string;
};

export type SelectorType = 'signup-type' | 'gender';

const DEFAULT_OPTIONS: Record<SelectorType, SelectorOption[]> = {
  'signup-type': [
    { id: 'student', label: '대학생' },
    { id: 'owner', label: '점주' },
  ],
  'gender': [
    { id: 'male', label: '남자' },
    { id: 'female', label: '여자' },
  ],
};

const DEFAULT_TITLES: Record<SelectorType, string> = {
  'signup-type': '가입 유형',
  'gender': '성별',
};

export type SignupTypeSelectorProps = {
  type?: SelectorType;
  title?: string;
  options?: SelectorOption[];
  onSelect?: (id: string) => void;
  selectedValue?: string | null;
};

export function SignupTypeSelector({
  type = 'signup-type',
  title,
  options,
  onSelect,
  selectedValue,
}: SignupTypeSelectorProps) {
  const finalTitle = title || DEFAULT_TITLES[type];
  const finalOptions = options || DEFAULT_OPTIONS[type];
  const [selected, setSelected] = useState<string | null>(selectedValue || null);

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {finalTitle}
      </ThemedText>
      
      <View style={styles.optionsContainer}>
        {finalOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.option}
            onPress={() => handleSelect(option.id)}
            activeOpacity={0.7}
          >
            <Image
              source={selected === option.id ? buttonOnIcon : buttonOffIcon}
              style={styles.icon}
            />
            <ThemedText style={styles.optionText}>{option.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#272828',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 168,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  optionText: {
    fontSize: 14,
    color: '#272828',
  },
});
