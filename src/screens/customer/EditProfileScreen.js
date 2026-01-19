import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { loadProfileData, updateName } from '../../services/profileService';

export default function EditProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await loadProfileData();
    if (data) {
      setProfile(data);
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    const result = await updateName(firstName.trim(), lastName.trim());
    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', 'Perfil actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>💀</Text>
              </View>
              <View style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color={COLORS.text.primary} />
              </View>
            </View>
            <Text style={styles.changeAvatarText}>Toca para cambiar avatar</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nombre"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Tu nombre"
              autoCapitalize="words"
            />

            <Input
              label="Apellido"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Tu apellido"
              autoCapitalize="words"
            />

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.semantic.info} />
              <Text style={styles.infoText}>
                Para cambiar tu número de teléfono, contacta a soporte.
              </Text>
            </View>
          </View>

          <Button
            title="Guardar Cambios"
            variant="primary"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.tertiary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: SPACING.md,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.accent.gold,
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 60,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeAvatarText: {
    fontSize: 14,
    color: COLORS.text.tertiary,
  },
  form: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.semantic.info + '15',
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.semantic.info,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  saveButton: {
    marginBottom: SPACING.xl,
  },
});
