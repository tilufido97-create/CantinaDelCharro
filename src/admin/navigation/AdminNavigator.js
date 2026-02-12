import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ProductsManagementScreen from '../screens/ProductsManagementScreen';
import OrdersManagementScreen from '../screens/OrdersManagementScreen';
import FinancialManagementScreen from '../screens/FinancialManagementScreenNew';
import UsersManagementScreen from '../screens/UsersManagementScreen';
import DeliveryApplicationsScreen from '../screens/DeliveryApplicationsScreen';
import PromotionsScreen from '../screens/PromotionsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AdminsManagementScreen from '../screens/AdminsManagementScreen';
import FleetManagementScreen from '../screens/FleetManagementScreen';
import OperatingCostsScreen from '../screens/OperatingCostsScreen';
import DeliveryCalculatorScreen from '../screens/DeliveryCalculatorScreen';
import AIConfigScreen from '../screens/AIConfigScreen';
import { getCurrentAdmin } from '../utils/adminAuth';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const admin = await getCurrentAdmin();
    setInitialRoute(admin ? 'AdminDashboard' : 'AdminLogin');
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0A0A0A' }
      }}
    >
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="Products" component={ProductsManagementScreen} />
      <Stack.Screen name="Orders" component={OrdersManagementScreen} />
      <Stack.Screen name="Financial" component={FinancialManagementScreen} />
      <Stack.Screen name="Users" component={UsersManagementScreen} />
      <Stack.Screen name="Deliveries" component={DeliveryApplicationsScreen} />
      <Stack.Screen name="Fleet" component={FleetManagementScreen} />
      <Stack.Screen name="OperatingCosts" component={OperatingCostsScreen} />
      <Stack.Screen name="DeliveryCalculator" component={DeliveryCalculatorScreen} />
      <Stack.Screen name="Promotions" component={PromotionsScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="AIConfig" component={AIConfigScreen} />
      <Stack.Screen name="Admins" component={AdminsManagementScreen} />
    </Stack.Navigator>
  );
}
