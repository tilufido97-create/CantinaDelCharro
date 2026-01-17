import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

export default function OTPInput({ length = 6, onComplete }) {
  const [code, setCode] = useState(Array(length).fill(''));
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus siguiente input
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Llamar onComplete si se llenaron todos
    if (newCode.every(digit => digit !== '') && onComplete) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array(length).fill(0).map((_, index) => (
        <TextInput
          key={index}
          ref={ref => inputs.current[index] = ref}
          style={[
            styles.input,
            code[index] && styles.inputFilled
          ]}
          value={code[index]}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  input: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.bg.tertiary,
    borderRadius: BORDER_RADIUS.md,
    textAlign: 'center',
    fontSize: 24,
    color: COLORS.text.primary,
    backgroundColor: COLORS.bg.secondary,
  },
  inputFilled: {
    borderColor: COLORS.accent.gold,
  },
});
