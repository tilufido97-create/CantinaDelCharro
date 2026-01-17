import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';

export default function AvatarSelector({ avatars, selectedAvatar, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Elige tu avatar</Text>
      <View style={styles.grid}>
        {avatars.map((avatar) => (
          <TouchableOpacity
            key={avatar.id}
            style={[
              styles.avatarItem,
              selectedAvatar?.id === avatar.id && styles.avatarSelected,
            ]}
            onPress={() => onSelect(avatar)}
          >
            <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  avatarItem: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.bg.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bg.tertiary,
  },
  avatarSelected: {
    borderColor: COLORS.accent.gold,
    backgroundColor: COLORS.bg.tertiary,
  },
  avatarEmoji: {
    fontSize: 36,
  },
});
