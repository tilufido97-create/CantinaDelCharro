import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ProductsManagementScreen from '../screens/ProductsManagementScreen';
import OrdersManagementScreen from '../screens/OrdersManagementScreen';
import UsersManagementScreen from '../screens/UsersManagementScreen';
import DeliveryApplicationsScreen from '../screens/DeliveryApplicationsScreen';
import PromotionsScreen from '../screens/PromotionsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AdminsManagementScreen from '../screens/AdminsManagementScreen';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0A0A0A' }
      }}
    >
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="Products" component={ProductsManagementScreen} />
      <Stack.Screen name="Orders" component={OrdersManagementScreen} />
      <Stack.Screen name="Users" component={UsersManagementScreen} />
      <Stack.Screen name="Deliveries" component={DeliveryApplicationsScreen} />
      <Stack.Screen name="Promotions" component={PromotionsScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Admins" component={AdminsManagementScreen} />
    </Stack.Navigator>
  );
}
