import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING } from '../../constants/theme';
import ProfileHeader from '../../components/profile/ProfileHeader';
import MenuSection from '../../components/profile/MenuSection';
import MenuItem from '../../components/profile/MenuItem';
import Button from '../../components/common/Button';
import { getCurrentUser, signOut } from '../../services/authService';
import { getClientById } from '../../services/clientService';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    firstName: 'Cargando...',
    lastName: '',
    phone: '',
    email: '',
    avatar: 'avatar1'
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      
      if (currentUser && currentUser.clientId) {
        // Load client data from database
        const clientData = await getClientById(currentUser.clientId);
        
        if (clientData) {
          setProfile({
            firstName: clientData.nombre || 'Usuario',
            lastName: clientData.apellido || 'Charro',
            phone: clientData.telefono || currentUser.phoneNumber || '',
            email: clientData.email || currentUser.email || '',
            avatar: clientData.avatar || currentUser.avatar || 'avatar1'
          });
        } else {
          // Fallback to user data
          setProfile({
            firstName: currentUser.firstName || 'Usuario',
            lastName: currentUser.lastName || 'Charro', 
            phone: currentUser.phoneNumber || '',
            email: currentUser.email || '',
            avatar: currentUser.avatar || 'avatar1'
          });
        }
      }
      
      // TODO: Load loyalty points from database
      setLoyaltyPoints(0);
      
    } catch (error) {
      console.log('Error loading profile:', error);
    } finally {
      setLoading(false);
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
            const result = await signOut();
            if (result.success) {
              await AsyncStorage.removeItem('authCompleted');
              console.log('Sesión cerrada exitosamente');
            }
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
