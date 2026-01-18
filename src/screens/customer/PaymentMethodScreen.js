import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyboardScrollWrapper from '../../components/common/KeyboardScrollWrapper';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { PAYMENT_METHODS } from '../../constants/mockData';
import Button from '../../components/common/Button';

export default function PaymentMethodScreen({ navigation }) {
  const [selected, setSelected] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');

  const handleConfirm = async () => {
    await AsyncStorage.setItem('default_payment', selected);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Método de pago</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardScrollWrapper>
        <View style={styles.content}>
          {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.card, selected === method.id && styles.cardSelected]}
            onPress={() => setSelected(method.id)}
            disabled={!method.enabled}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{method.icon}</Text>
              </View>
              <View style={styles.radio}>
                {selected === method.id && <View style={styles.radioInner} />}
              </View>
            </View>

            <Text style={styles.methodName}>{method.name}</Text>
            <Text style={styles.methodDescription}>{method.description}</Text>

            {method.id === 'cash' && selected === 'cash' && (
              <View style={styles.cashInput}>
                <Text style={styles.cashLabel}>¿Con cuánto pagarás? (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={cashAmount}
                  onChangeText={setCashAmount}
                  placeholder="Ej: 200"
                  placeholderTextColor={COLORS.text.tertiary}
                  keyboardType="numeric"
                />
                {cashAmount && (
                  <Text style={styles.changeText}>
                    Vuelto aproximado: Bs {(parseFloat(cashAmount) - 140.50).toFixed(2)}
                  </Text>
                )}
              </View>
            )}

            {!method.enabled && (
              <View style={styles.disabledBadge}>
                <Text style={styles.disabledText}>Próximamente</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </View>
      </KeyboardScrollWrapper>

      <View style={styles.footer}>
        <Button
          title="Confirmar método de pago"
          onPress={handleConfirm}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  backButton: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.medium },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  content: { paddingHorizontal: SPACING.lg },
  card: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: COLORS.accent.gold, backgroundColor: COLORS.bg.tertiary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  iconContainer: { width: 48, height: 48, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.bg.tertiary, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 24 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.text.tertiary, justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent.gold },
  methodName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, marginBottom: SPACING.xs },
  methodDescription: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  cashInput: { marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.bg.tertiary },
  cashLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: SPACING.sm },
  input: { backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary },
  changeText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.success, marginTop: SPACING.sm },
  disabledBadge: { marginTop: SPACING.md, backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.sm, padding: SPACING.xs, alignSelf: 'flex-start' },
  disabledText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.tertiary },
  footer: { padding: SPACING.lg, backgroundColor: COLORS.bg.primary, borderTopWidth: 1, borderTopColor: COLORS.bg.tertiary },
});
