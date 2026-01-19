import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

export default function AdminLayout({ children, title, user }) {
  const navigation = useNavigation();
  
  if (Platform.OS !== 'web') {
    return children;
  }
  
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
      <AdminSidebar user={user} onNavigate={handleNavigate} />
      
      <View style={styles.mainContent}>
        <AdminTopBar title={title} user={user} />
        
        <View style={styles.content}>
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
  },
  mainContent: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    overflow: 'auto',
  }
});
