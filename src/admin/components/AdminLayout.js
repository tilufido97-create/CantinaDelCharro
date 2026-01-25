import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import AdminAIAssistant from './AdminAIAssistant';
import { useResponsive } from '../hooks/useResponsive';

export default function AdminLayout({ children, title, user, showBackButton = false }) {
  const navigation = useNavigation();
  const route = useRoute();
  const responsive = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  if (Platform.OS !== 'web') {
    return children;
  }
  
  const currentScreen = route.name;
  
  const handleNavigate = (screenId) => {
    const screenMap = {
      dashboard: 'AdminDashboard',
      products: 'Products',
      orders: 'Orders',
      financial: 'Financial',
      users: 'Users',
      deliveries: 'Deliveries',
      fleet: 'Fleet',
      calculator: 'DeliveryCalculator',
      promotions: 'Promotions',
      analytics: 'Analytics',
      'ai-config': 'AIConfig',
      admins: 'Admins'
    };
    
    const screenName = screenMap[screenId];
    if (screenName) {
      navigation.navigate(screenName);
      if (!responsive.isDesktop) setSidebarOpen(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Sidebar - Desktop: siempre visible, Mobile/Tablet: overlay */}
      {responsive.isDesktop ? (
        <AdminSidebar user={user} activeScreen={currentScreen} onNavigate={handleNavigate} />
      ) : (
        sidebarOpen && (
          <>
            <TouchableOpacity 
              style={styles.overlay} 
              activeOpacity={1}
              onPress={() => setSidebarOpen(false)}
            />
            <View style={styles.sidebarMobile}>
              <AdminSidebar 
                user={user} 
                activeScreen={currentScreen} 
                onNavigate={handleNavigate}
                onClose={() => setSidebarOpen(false)}
              />
            </View>
          </>
        )
      )}
      
      <View style={styles.mainContent}>
        <AdminTopBar 
          title={title} 
          user={user}
          showMenuButton={!responsive.isDesktop}
          onMenuPress={() => setSidebarOpen(true)}
        />
        
        <View style={[styles.content, { maxWidth: responsive.contentMaxWidth }]}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          )}
          {children}
        </View>
      </View>

      {/* Burbuja flotante de IA */}
      <AdminAIAssistant />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
    height: '100vh',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  sidebarMobile: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 20,
    overflowY: 'scroll',
    overflowX: 'hidden',
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
    cursor: 'pointer',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});
