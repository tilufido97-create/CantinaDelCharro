import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import MenuItem from '../../components/profile/MenuItem';

export default function SettingsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>NOTIFICACIONES</Text>
          <MenuItem
            icon="notifications-outline"
            iconColor={COLORS.accent.gold}
            iconBgColor={COLORS.accent.gold + '20'}
            label="Notificaciones"
            onPress={() => navigation.navigate('NotificationSettings')}
          />

          <Text style={styles.sectionTitle}>PREFERENCIAS</Text>
          <MenuItem
            icon="moon-outline"
            iconColor={COLORS.text.secondary}
            iconBgColor={COLORS.background.tertiary}
            label="Tema oscuro"
            onPress={() => {}}
          />

          <Text style={styles.sectionTitle}>IDIOMA</Text>
          <MenuItem
            icon="language-outline"
            iconColor={COLORS.text.secondary}
            iconBgColor={COLORS.background.tertiary}
            label="Español"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.background.tertiary },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  placeholder: { width: 40 },
  content: { padding: SPACING.md },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text.tertiary, letterSpacing: 1, marginBottom: SPACING.md, marginTop: SPACING.lg },
});
