import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import notificationService from '../../services/notificationService';
import { scheduleHappyHourReminder, scheduleFreeSpinReminder } from '../../utils/notificationScheduler';

const NotificationOption = ({ icon, title, subtitle, value, onToggle, disabled }) => (
  <View style={styles.optionCard}>
    <View style={styles.optionLeft}>
      <Text style={styles.optionIcon}>{icon}</Text>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: COLORS.text.tertiary, true: COLORS.accent.gold + '60' }}
      thumbColor={value ? COLORS.accent.gold : '#f4f3f4'}
    />
  </View>
);

export default function NotificationSettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [preferences, setPreferences] = useState({
    orders: true,
    promotions: true,
    games: true,
    charro: true,
    dailyReminders: true,
    sound: true,
    vibration: true
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getNotificationPreferences();
      setPreferences(prefs);
      const { granted } = await notificationService.requestPermissions();
      setMasterEnabled(granted);
    } catch (error) {
      console.error('Error cargando preferencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterToggle = async () => {
    if (masterEnabled) {
      Alert.alert(
        'Desactivar notificaciones',
        '¿Estás seguro? No recibirás actualizaciones de tus pedidos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: async () => {
              await notificationService.cancelAllNotifications();
              setMasterEnabled(false);
            }
          }
        ]
      );
    } else {
      const { granted } = await notificationService.requestPermissions();
      if (granted) {
        setMasterEnabled(true);
        Alert.alert('Notificaciones activadas', 'Ahora recibirás actualizaciones importantes');
      } else {
        Alert.alert(
          'Permisos denegados',
          'Activa los permisos en la configuración de tu dispositivo',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handlePreferenceToggle = async (type) => {
    const newPrefs = { ...preferences, [type]: !preferences[type] };
    setPreferences(newPrefs);

    if (type === 'dailyReminders' && newPrefs.dailyReminders) {
      await scheduleHappyHourReminder();
      await scheduleFreeSpinReminder();
    }

    if (type === 'dailyReminders' && !newPrefs.dailyReminders) {
      await notificationService.cancelAllNotifications();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationService.saveNotificationPreferences(preferences);
      Alert.alert('Guardado', 'Tus preferencias han sido actualizadas', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.optionCard, styles.masterCard]}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🔔</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Notificaciones push</Text>
                <Text style={styles.optionSubtitle}>Recibe actualizaciones importantes</Text>
              </View>
            </View>
            <Switch
              value={masterEnabled}
              onValueChange={handleMasterToggle}
              trackColor={{ false: COLORS.text.tertiary, true: COLORS.accent.gold + '60' }}
              thumbColor={masterEnabled ? COLORS.accent.gold : '#f4f3f4'}
            />
          </View>

          <Text style={styles.sectionTitle}>TIPOS DE NOTIFICACIONES</Text>

          <NotificationOption
            icon="📦"
            title="Pedidos"
            subtitle="Actualizaciones de entregas"
            value={preferences.orders}
            onToggle={() => handlePreferenceToggle('orders')}
            disabled={!masterEnabled}
          />

          <NotificationOption
            icon="🎁"
            title="Promociones"
            subtitle="Ofertas y descuentos"
            value={preferences.promotions}
            onToggle={() => handlePreferenceToggle('promotions')}
            disabled={!masterEnabled}
          />

          <NotificationOption
            icon="🎮"
            title="Juegos"
            subtitle="Invitaciones y retos"
            value={preferences.games}
            onToggle={() => handlePreferenceToggle('games')}
            disabled={!masterEnabled}
          />

          <NotificationOption
            icon="🤠"
            title="El Charro"
            subtitle="Mensajes del bartender"
            value={preferences.charro}
            onToggle={() => handlePreferenceToggle('charro')}
            disabled={!masterEnabled}
          />

          <NotificationOption
            icon="⏰"
            title="Recordatorios"
            subtitle="Happy Hour y giros gratis"
            value={preferences.dailyReminders}
            onToggle={() => handlePreferenceToggle('dailyReminders')}
            disabled={!masterEnabled}
          />

          <Text style={styles.sectionTitle}>CONFIGURACIÓN</Text>

          <NotificationOption
            icon="🔊"
            title="Sonido"
            subtitle="Reproducir sonido en notificaciones"
            value={preferences.sound}
            onToggle={() => handlePreferenceToggle('sound')}
            disabled={!masterEnabled}
          />

          <NotificationOption
            icon="📳"
            title="Vibración"
            subtitle="Vibrar al recibir notificaciones"
            value={preferences.vibration}
            onToggle={() => handlePreferenceToggle('vibration')}
            disabled={!masterEnabled}
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.background.primary} />
            ) : (
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  content: {
    padding: SPACING.md,
  },
  optionCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.background.tertiary,
  },
  masterCard: {
    borderColor: COLORS.accent.gold,
    borderWidth: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  optionSubtitle: {
    fontSize: 13,
    color: COLORS.text.tertiary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  saveButton: {
    backgroundColor: COLORS.accent.gold,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});
