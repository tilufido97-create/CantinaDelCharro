import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const MenuSection = ({ title, children }) => {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.tertiary,
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  content: {
    gap: 0,
  },
});

export default MenuSection;
