import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { getUserLevel } from '../../services/loyaltyService';

const ProfileHeader = ({ profile, loyaltyPoints, onEditPress }) => {
  const level = getUserLevel(loyaltyPoints);

  return (
    <LinearGradient
      colors={[COLORS.background.secondary, COLORS.background.primary]}
      style={styles.container}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>💀</Text>
        </View>
        <TouchableOpacity style={styles.editAvatarButton} onPress={onEditPress}>
          <Ionicons name="camera" size={16} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.name}>
        {profile.firstName} {profile.lastName}
      </Text>

      <View style={styles.levelBadge}>
        <Text style={styles.levelEmoji}>{level.emoji}</Text>
        <Text style={styles.levelText}>{level.name}</Text>
      </View>

      <View style={styles.pointsContainer}>
        <Ionicons name="star" size={16} color={COLORS.accent.gold} />
        <Text style={styles.pointsText}>
          {loyaltyPoints.toLocaleString()} puntos
        </Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
        <Ionicons name="create-outline" size={18} color={COLORS.accent.gold} />
        <Text style={styles.editButtonText}>Editar Perfil</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.tertiary,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.accent.gold,
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.background.tertiary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 100,
    marginBottom: SPACING.sm,
  },
  levelEmoji: {
    fontSize: 16,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.accent.gold,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent.gold,
  },
});

export default ProfileHeader;
