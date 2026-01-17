import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/customer/HomeScreen';
import CatalogScreen from '../screens/customer/CatalogScreen';
import MixologyAssistantScreen from '../screens/customer/MixologyAssistantScreen';
import GamesScreen from '../screens/customer/GamesScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import AddressScreen from '../screens/customer/AddressScreen';
import PaymentMethodScreen from '../screens/customer/PaymentMethodScreen';
import OrderConfirmationScreen from '../screens/customer/OrderConfirmationScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bg.secondary,
          borderTopColor: COLORS.bg.tertiary,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.accent.gold,
        tabBarInactiveTintColor: COLORS.text.tertiary,
      }}
    >
      <Tab.Screen 
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="CatalogTab"
        component={CatalogScreen}
        options={{
          tabBarLabel: 'Catálogo',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="MixologyTab"
        component={MixologyAssistantScreen}
        options={{
          tabBarLabel: 'El Charro',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>🤠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="GamesTab"
        component={GamesScreen}
        options={{
          tabBarLabel: 'Juegos',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>🎮</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.bg.primary },
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
}
