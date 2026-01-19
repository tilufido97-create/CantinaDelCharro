import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { logoutAdmin } from '../utils/adminAuth';
import { useNavigation } from '@react-navigation/native';

export default function AdminTopBar({ title, user, notificationCount = 0 }) {
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await logoutAdmin();
            navigation.replace('AdminLogin');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.topBar}>
      <Text style={styles.title}>{title || 'Dashboard'}</Text>

      <View style={styles.rightSection}>
        {notificationCount > 0 && (
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color={COLORS.text.primary} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.semantic.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 72,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.tertiary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.semantic.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  logoutButton: {
    padding: 8,
    cursor: 'pointer',
  },
});
