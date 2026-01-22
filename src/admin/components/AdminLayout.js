import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

export default function AdminLayout({ children, title, user, showBackButton = false }) {
  const navigation = useNavigation();
  const route = useRoute();
  
  if (Platform.OS !== 'web') {
    return children;
  }
  
  const currentScreen = route.name;
  
  const handleNavigate = (screenId) => {
    const screenMap = {
      dashboard: 'AdminDashboard',
      products: 'Products',
      orders: 'Orders',
      users: 'Users',
      deliveries: 'Deliveries',
      promotions: 'Promotions',
      analytics: 'Analytics',
      admins: 'Admins'
    };
    
    const screenName = screenMap[screenId];
    if (screenName) {
      navigation.navigate(screenName);
    }
  };
  
  return (
    <View style={styles.container}>
      <AdminSidebar user={user} activeScreen={currentScreen} onNavigate={handleNavigate} />
      
      <View style={styles.mainContent}>
        <AdminTopBar title={title} user={user} />
        
        <View style={styles.content}>
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
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    overflowY: 'scroll',
    overflowX: 'hidden',
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
