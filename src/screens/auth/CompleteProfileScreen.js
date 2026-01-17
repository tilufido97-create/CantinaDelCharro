import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import KeyboardScrollWrapper from '../../components/common/KeyboardScrollWrapper';
import AvatarSelector from '../../components/common/AvatarSelector';
import Button from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { AVATARS } from '../../constants/mockData';
import { saveUserProfile } from '../../services/authService';

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
      const profile = {
        phone,
        firstName,
        lastName,
        email,
        avatar: selectedAvatar,
        createdAt: new Date().toISOString(),
      };

      await saveUserProfile(profile);
      navigation.navigate('AgeVerification');
    } catch (error) {
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
      <KeyboardScrollWrapper>
        <Text style={styles.title}>Completa tu perfil</Text>

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
          />
        </View>

        <View style={{ paddingHorizontal: SPACING.xl }}>
          <Button
            title="Guardar Perfil"
            onPress={handleSave}
            disabled={!isValid()}
            loading={loading}
            fullWidth
          />
        </View>

        <View style={{ height: 100 }} />
      </KeyboardScrollWrapper>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  inputSection: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
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
