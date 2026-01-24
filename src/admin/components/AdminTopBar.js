import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { logoutAdmin } from '../utils/adminAuth';
import { useNavigation } from '@react-navigation/native';
import { MOCK_NOTIFICATIONS } from '../constants/mockDataAdmin';
import { logger } from '../../utils/logger';

export default function AdminTopBar({ title, user, showMenuButton = false, onMenuPress }) {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const stored = await AsyncStorage.getItem('admin_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
      await AsyncStorage.setItem('admin_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    console.log("🚑 LOGOUT - Usuario solicitó cerrar sesión");
    logger.info('ADMIN_TOPBAR', 'Usuario solicitó logout', {
      userEmail: user?.email,
      userName: user?.name
    });
    
    Alert.alert(
      '🚑 Cerrar Sesión',
      `Hola ${user?.name || 'Admin'},\n\n¿Estás seguro que deseas cerrar tu sesión en el panel administrativo?\n\nTendrás que volver a iniciar sesión para acceder.`,
      [
        { 
          text: '❌ No, Continuar',
          style: 'cancel',
          onPress: () => {
            console.log("❌ LOGOUT CANCELADO POR USUARIO");
            logger.info('ADMIN_TOPBAR', 'Logout cancelado por usuario');
          }
        },
        {
          text: '✅ Sí, Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            console.log("🚀 ====================================");
            console.log("🚀 EJECUTANDO LOGOUT CONFIRMADO");
            console.log("🚀 ====================================");
            console.log(`👤 Usuario: ${user?.name || 'Admin'}`);
            console.log(`📧 Email: ${user?.email || 'N/A'}`);
            console.log(`🕰 Timestamp: ${new Date().toISOString()}`);
            
            logger.info('ADMIN_TOPBAR', 'Ejecutando logout confirmado', {
              userName: user?.name,
              userEmail: user?.email,
              userRole: user?.role
            });
            
            try {
              await logoutAdmin();
              
              console.log("✅ ====================================");
              console.log("✅ LOGOUT COMPLETADO EXITOSAMENTE");
              console.log("✅ ====================================");
              console.log("🎯 Navegando a pantalla de login...");
              
              logger.success('ADMIN_TOPBAR', 'Logout completado exitosamente');
              
              navigation.replace('AdminLogin');
              
              console.log("✅ NAVEGACIÓN COMPLETADA");
              
            } catch (error) {
              console.error("❌ ====================================");
              console.error("❌ ERROR DURANTE LOGOUT");
              console.error("❌ ====================================");
              console.error(`💥 Error: ${error.message}`);
              console.error(`📍 Stack: ${error.stack}`);
              
              logger.error('ADMIN_TOPBAR', 'Error durante logout', {
                error: error.message,
                stack: error.stack
              });
              
              Alert.alert(
                '❌ Error de Sistema',
                'Hubo un problema al cerrar la sesión. Por favor, intenta nuevamente o recarga la página.',
                [{ text: 'Entendido', style: 'default' }]
              );
            }
          }
        }
      ],
      {
        cancelable: true,
        onDismiss: () => {
          console.log("⚠️ MODAL DE LOGOUT CERRADO SIN ACCIÓN");
          logger.info('ADMIN_TOPBAR', 'Modal de logout cerrado sin acción');
        }
      }
    );
  };

  return (
    <View style={styles.topBar}>
      <View style={styles.leftSection}>
        {showMenuButton && (
          <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
            <Ionicons name="menu" size={28} color={COLORS.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title || 'Dashboard'}</Text>
      </View>

      <View style={styles.rightSection}>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Ionicons name="notifications" size={24} color={COLORS.text.primary} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
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
          <Ionicons name="log-out-outline" size={20} color={COLORS.semantic.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
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
    paddingHorizontal: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuButton: {
    padding: 8,
    cursor: 'pointer',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: COLORS.semantic.error + '40',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.semantic.error,
  },
});
