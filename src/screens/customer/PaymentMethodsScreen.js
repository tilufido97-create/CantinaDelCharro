import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

export default function PaymentMethodsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métodos de Pago</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView>
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyText}>Gestión de tarjetas</Text>
            <Text style={styles.emptySubtext}>Próximamente podrás guardar tus tarjetas de forma segura</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={COLORS.semantic.info} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Métodos disponibles</Text>
              <Text style={styles.infoText}>• Efectivo contra entrega</Text>
              <Text style={styles.infoText}>• Tigo Money (QR)</Text>
              <Text style={styles.infoText}>• Transferencia QR Banco</Text>
            </View>
          </View>
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
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl * 2 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text.secondary, marginTop: SPACING.md },
  emptySubtext: { fontSize: 14, color: COLORS.text.tertiary, marginTop: SPACING.xs, textAlign: 'center' },
  infoCard: { flexDirection: 'row', backgroundColor: COLORS.semantic.info + '15', padding: SPACING.md, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: COLORS.semantic.info, marginTop: SPACING.xl },
  infoContent: { flex: 1, marginLeft: SPACING.md },
  infoTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary, marginBottom: SPACING.sm },
  infoText: { fontSize: 14, color: COLORS.text.secondary, marginBottom: SPACING.xs },
});
