import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { hasPermission } from '../utils/permissions';

const MENU_ITEMS = [
  { id: 'dashboard', icon: 'stats-chart', label: 'Dashboard', permission: '*' },
  { id: 'products', icon: 'cube', label: 'Productos', permission: 'manage_products' },
  { id: 'orders', icon: 'receipt', label: 'Pedidos', permission: 'manage_orders' },
  { id: 'financial', icon: 'wallet', label: 'Finanzas', permission: 'manage_orders' },
  { id: 'users', icon: 'people', label: 'Usuarios', permission: 'manage_users' },
  { id: 'deliveries', icon: 'bicycle', label: 'Deliverys', permission: 'approve_deliveries' },
  { id: 'fleet', icon: 'car-sport', label: 'Gestión de Flota', permission: 'approve_deliveries' },
  { id: 'calculator', icon: 'calculator', label: 'Calculadora Delivery', permission: 'approve_deliveries' },
  { id: 'promotions', icon: 'gift', label: 'Promociones', permission: 'manage_promos' },
  { id: 'analytics', icon: 'bar-chart', label: 'Analytics', permission: 'view_analytics' },
  { id: 'ai-config', icon: 'sparkles', label: 'Configurar IA', permission: '*' },
  { id: 'admins', icon: 'shield-checkmark', label: 'Administradores', permission: 'super_only' },
];

export default function AdminSidebar({ user, activeScreen, onNavigate, onClose }) {
  const getScreenId = (screenName) => {
    const screenMap = {
      'AdminDashboard': 'dashboard',
      'Products': 'products',
      'Orders': 'orders',
      'Financial': 'financial',
      'Users': 'users',
      'Deliveries': 'deliveries',
      'Fleet': 'fleet',
      'OperatingCosts': 'fleet',
      'DeliveryCalculator': 'calculator',
      'Promotions': 'promotions',
      'Analytics': 'analytics',
      'AIConfig': 'ai-config',
      'Admins': 'admins'
    };
    return screenMap[screenName] || 'dashboard';
  };
  
  const currentScreenId = getScreenId(activeScreen);
  
  const visibleItems = MENU_ITEMS.filter(item => {
    // SUPER_ADMIN ve todo
    if (user?.permissions?.includes('*')) return true;
    
    // Dashboard es visible para todos
    if (item.permission === '*') return true;
    
    // Administradores solo para SUPER_ADMIN
    if (item.permission === 'super_only') return false;
    
    // Verificar permiso específico
    return hasPermission(user, item.permission);
  });

  return (
    <View style={styles.sidebar}>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
      )}
      
      <View style={styles.header}>
        <Text style={styles.logo}>🤠</Text>
        <Text style={styles.title}>EL CHARRO</Text>
        <Text style={styles.subtitle}>Admin Panel</Text>
      </View>

      <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
        {visibleItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              currentScreenId === item.id && styles.menuItemActive
            ]}
            onPress={() => onNavigate?.(item.id)}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={currentScreenId === item.id ? '#FFB800' : '#8E8E93'}
            />
            <Text
              style={[
                styles.menuLabel,
                currentScreenId === item.id && styles.menuLabelActive
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
            <Text style={styles.userRole}>{user?.role || 'ADMIN'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: COLORS.background.secondary,
    borderRightWidth: 1,
    borderRightColor: COLORS.background.tertiary,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
    cursor: 'pointer',
  },
  header: {
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.tertiary,
  },
  logo: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
  menu: {
    flex: 1,
    paddingVertical: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    cursor: 'pointer',
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent.gold,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginLeft: SPACING.md,
  },
  menuLabelActive: {
    color: COLORS.accent.gold,
    fontWeight: '600',
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.background.tertiary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 20,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
});
