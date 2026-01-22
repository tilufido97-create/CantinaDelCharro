import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

export default function ProgressBar({ progress, height = 12, showPercentage = true }) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.fill, { width }]}>
        <LinearGradient
          colors={[COLORS.accent.gold, COLORS.accent.amber]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
      {showPercentage && (
        <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', backgroundColor: COLORS.bg.tertiary, borderRadius: 6, overflow: 'hidden', position: 'relative' },
  fill: { height: '100%', borderRadius: 6, overflow: 'hidden' },
  gradient: { flex: 1 },
  percentage: { position: 'absolute', alignSelf: 'center', top: '50%', transform: [{ translateY: -8 }], fontSize: 10, fontWeight: 'bold', color: COLORS.text.primary },
});
