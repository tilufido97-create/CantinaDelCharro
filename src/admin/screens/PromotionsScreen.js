import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import AdminLayout from '../components/AdminLayout';

export default function PromotionsScreen({ route }) {
  const user = route.params?.user;

  return (
    <AdminLayout title="Gestión de Promociones" user={user} showBackButton={true}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎁 Promociones</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={COLORS.background.primary} />
            <Text style={styles.addButtonText}>Nueva Promoción</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.placeholder}>
          <Ionicons name="gift-outline" size={64} color={COLORS.text.tertiary} />
          <Text style={styles.placeholderText}>Próximamente</Text>
          <Text style={styles.placeholderSubtext}>Sistema de promociones en desarrollo</Text>
        </View>
      </ScrollView>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text.primary },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent.gold, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, cursor: 'pointer' },
  addButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.background.primary, marginLeft: SPACING.sm },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  placeholderText: { fontSize: 20, fontWeight: '600', color: COLORS.text.secondary, marginTop: SPACING.lg },
  placeholderSubtext: { fontSize: 14, color: COLORS.text.tertiary, marginTop: SPACING.sm }
});
