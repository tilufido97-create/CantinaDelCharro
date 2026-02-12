import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AvatarSelector from '../../components/common/AvatarSelector';
import Button from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { AVATARS } from '../../constants/mockData';
import { getCurrentUser } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CompleteProfileScreen({ navigation, route }) {
  const { phone } = route.params;
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = () => {
    return firstName.length >= 2 && lastName.length >= 2 && selectedAvatar;
  };

  const handleSave = async () => {
    if (!isValid()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      // Get current user data
      const currentUser = await getCurrentUser();
      
      const profileData = {
        firstName,
        lastName,
        email: email.trim() || null,
        phoneNumber: phone,
        avatar: selectedAvatar
      };

      // Update user data in AsyncStorage with profile info
      const updatedUser = {
        ...currentUser,
        firstName,
        lastName,
        email: email.trim() || null,
        avatar: selectedAvatar,
        profileCompleted: true
      };
      
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      Alert.alert(
        '✅ Perfil Guardado', 
        'Ahora necesitamos verificar tu edad', 
        [{
          text: 'Continuar',
          onPress: () => navigation.navigate('AgeVerification', { 
            user: updatedUser,
            profileData 
          })
        }]
      );
    } catch (error) {
      console.error('Error guardando perfil:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.bg.primary, COLORS.bg.secondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>🍺 Completa tu Perfil</Text>
          <Text style={styles.subtitle}>Información básica</Text>

          <AvatarSelector
            avatars={AVATARS}
            selectedAvatar={selectedAvatar}
            onSelect={setSelectedAvatar}
          />

          <View style={styles.inputSection}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Juan"
              placeholderTextColor={COLORS.text.tertiary}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Apellido *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Pérez"
              placeholderTextColor={COLORS.text.tertiary}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Email (opcional)</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="juan@email.com"
              placeholderTextColor={COLORS.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>

          <Button
            title="Continuar"
            onPress={handleSave}
            disabled={!isValid()}
            loading={loading}
            fullWidth
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontStyle: 'italic',
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.bg.tertiary,
    paddingHorizontal: SPACING.md,
    height: 56,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
  },
});
