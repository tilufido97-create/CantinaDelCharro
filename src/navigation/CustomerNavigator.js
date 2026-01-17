import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/customer/HomeScreen';
import CatalogScreen from '../screens/customer/CatalogScreen';
import MixologyAssistantScreen from '../screens/customer/MixologyAssistantScreen';
import CartScreen from '../screens/customer/CartScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function CustomerNavigator() {
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
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'Carrito',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>🛒</Text>
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
