import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING } from '../../constants/theme';
import ProfileHeader from '../../components/profile/ProfileHeader';
import MenuSection from '../../components/profile/MenuSection';
import MenuItem from '../../components/profile/MenuItem';
import Button from '../../components/common/Button';
import { loadProfileData } from '../../services/profileService';
import { loadLoyaltyData } from '../../services/loyaltyService';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    firstName: 'Usuario',
    lastName: 'Charro',
    phone: '+591 70123456',
    avatar: 'avatar1'
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const profileData = await loadProfileData();
      const loyaltyData = await loadLoyaltyData();
      
      if (profileData) {
        setProfile(profileData);
      }
      
      if (loyaltyData) {
        setLoyaltyPoints(loyaltyData.points);
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('authCompleted');
            await AsyncStorage.removeItem('userProfile');
            console.log('Sesión cerrada');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ProfileHeader
          profile={profile}
          loyaltyPoints={loyaltyPoints}
          onEditPress={() => navigation.navigate('EditProfile')}
        />

        <View style={styles.content}>
          <MenuSection title="MI CUENTA">
            <MenuItem
              icon="person-outline"
              iconColor={COLORS.semantic.info}
              iconBgColor={COLORS.semantic.info + '20'}
              label="Editar Perfil"
              onPress={() => navigation.navigate('EditProfile')}
            />
          </MenuSection>

          <MenuSection title="MIS PEDIDOS">
            <MenuItem
              icon="receipt-outline"
              iconColor={COLORS.accent.amber}
              iconBgColor={COLORS.accent.amber + '20'}
              label="Historial de Pedidos"
              onPress={() => navigation.navigate('MyOrders')}
            />
            <MenuItem
              icon="location-outline"
              iconColor={COLORS.semantic.success}
              iconBgColor={COLORS.semantic.success + '20'}
              label="Mis Direcciones"
              onPress={() => navigation.navigate('Addresses')}
            />
            <MenuItem
              icon="card-outline"
              iconColor={COLORS.semantic.info}
              iconBgColor={COLORS.semantic.info + '20'}
              label="Métodos de Pago"
              onPress={() => navigation.navigate('PaymentMethods')}
            />
          </MenuSection>

          <MenuSection title="RECOMPENSAS">
            <MenuItem
              icon="trophy"
              iconColor={COLORS.accent.gold}
              iconBgColor={COLORS.accent.gold + '20'}
              label="Mis Recompensas"
              badge={loyaltyPoints > 0 ? loyaltyPoints.toLocaleString() : null}
              onPress={() => navigation.navigate('Loyalty')}
            />
          </MenuSection>

          <MenuSection title="AJUSTES">
            <MenuItem
              icon="settings-outline"
              iconColor={COLORS.text.secondary}
              iconBgColor={COLORS.background.tertiary}
              label="Configuración"
              onPress={() => navigation.navigate('Settings')}
            />
            <MenuItem
              icon="help-circle-outline"
              iconColor={COLORS.text.secondary}
              iconBgColor={COLORS.background.tertiary}
              label="Ayuda y Soporte"
              onPress={() => navigation.navigate('Help')}
            />
            <MenuItem
              icon="document-text-outline"
              iconColor={COLORS.text.secondary}
              iconBgColor={COLORS.background.tertiary}
              label="Términos y Privacidad"
              onPress={() => navigation.navigate('Legal')}
            />
          </MenuSection>

          <Button
            title="Cerrar Sesión"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
          />

          <View style={styles.version}>
            <Text style={styles.versionText}>Versión 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    padding: SPACING.md,
  },
  logoutButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  version: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
});
