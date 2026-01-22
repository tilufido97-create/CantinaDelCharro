import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/customer/HomeScreen';
import CatalogScreen from '../screens/customer/CatalogScreen';
import MixologyAssistantScreen from '../screens/customer/MixologyAssistantScreen';
import GamesScreen from '../screens/customer/GamesScreen';
import RuletaRusaScreen from '../screens/customer/RuletaRusaScreen';
import CulturaChupisticaScreen from '../screens/customer/CulturaChupisticaScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import AddressScreen from '../screens/customer/AddressScreen';
import PaymentMethodScreen from '../screens/customer/PaymentMethodScreen';
import OrderConfirmationScreen from '../screens/customer/OrderConfirmationScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';
import PokerScreen from '../screens/games/PokerScreen';
import BlackjackScreen from '../screens/games/BlackjackScreen';
import MixologyMasterScreen from '../screens/games/MixologyMasterScreen';
import ShotChallengeScreen from '../screens/games/ShotChallengeScreen';
import ImpostorGameScreen from '../screens/games/ImpostorGameScreen';
import TodisScreen from '../screens/games/TodisScreen';
import LoyaltyScreen from '../screens/customer/LoyaltyScreen';
import RewardsScreen from '../screens/customer/RewardsScreen';
import ReferralScreen from '../screens/customer/ReferralScreen';
import PointsHistoryScreen from '../screens/customer/PointsHistoryScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';
import MyOrdersScreen from '../screens/customer/MyOrdersScreen';
import OrderDetailScreen from '../screens/customer/OrderDetailScreen';
import AddressesScreen from '../screens/customer/AddressesScreen';
import AddEditAddressScreen from '../screens/customer/AddEditAddressScreen';
import PaymentMethodsScreen from '../screens/customer/PaymentMethodsScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';
import HelpScreen from '../screens/customer/HelpScreen';
import LegalScreen from '../screens/customer/LegalScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import DeliveryApplicationScreen from '../screens/delivery/DeliveryApplicationScreen';
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
      <Stack.Screen name="RuletaRusa" component={RuletaRusaScreen} />
      <Stack.Screen name="CulturaChupistica" component={CulturaChupisticaScreen} />
      <Stack.Screen name="Poker" component={PokerScreen} />
      <Stack.Screen name="Blackjack" component={BlackjackScreen} />
      <Stack.Screen name="MixologyMaster" component={MixologyMasterScreen} />
      <Stack.Screen name="ShotChallenge" component={ShotChallengeScreen} />
      <Stack.Screen name="ImpostorGame" component={ImpostorGameScreen} />
      <Stack.Screen name="Todis" component={TodisScreen} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="PointsHistory" component={PointsHistoryScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Legal" component={LegalScreen} />
      <Stack.Screen name="DeliveryApplication" component={DeliveryApplicationScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
}
