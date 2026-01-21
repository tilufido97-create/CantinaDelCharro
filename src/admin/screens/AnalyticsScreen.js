import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';

export default function AnalyticsScreen({ route }) {
  const user = route.params?.user;

  return (
    <AdminLayout title="Analytics y Reportes" user={user}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>📈 Analytics</Text>

        <View style={styles.placeholder}>
          <Ionicons name="bar-chart-outline" size={64} color={COLORS.text.tertiary} />
          <Text style={styles.placeholderText}>Próximamente</Text>
          <Text style={styles.placeholderSubtext}>Sistema de analytics en desarrollo</Text>
        </View>
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.xl },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  placeholderText: { fontSize: 20, fontWeight: '600', color: COLORS.text.secondary, marginTop: SPACING.lg },
  placeholderSubtext: { fontSize: 14, color: COLORS.text.tertiary, marginTop: SPACING.sm }
});
