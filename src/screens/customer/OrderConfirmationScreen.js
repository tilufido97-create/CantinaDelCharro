import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Button from '../../components/common/Button';

export default function OrderConfirmationScreen({ route, navigation }) {
  const { orderId, orderNumber, total, deliveryType, estimatedTime } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color={COLORS.success} />
        </View>

        <Text style={styles.title}>¡Pedido Confirmado! 🎉</Text>
        <Text style={styles.subtitle}>Tu pedido ha sido recibido exitosamente</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Número de pedido:</Text>
            <Text style={styles.value}>{orderNumber}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>Total pagado:</Text>
            <Text style={styles.valueGold}>Bs {total.toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de entrega:</Text>
            <Text style={styles.value}>
              {deliveryType === 'pickup' ? '🏪 Recojo en tienda' : '🚚 Delivery'}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>Tiempo estimado:</Text>
            <Text style={styles.value}>{estimatedTime}</Text>
          </View>
        </View>

        {deliveryType === 'pickup' && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.accent.gold} />
            <Text style={styles.infoText}>
              Te avisaremos cuando tu pedido esté listo para recoger
            </Text>
          </View>
        )}

        {deliveryType === 'delivery' && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.accent.gold} />
            <Text style={styles.infoText}>
              Puedes seguir el estado de tu pedido en tiempo real
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Ver Estado del Pedido"
            onPress={() => navigation.navigate('OrderTracking', { orderId })}
            fullWidth
          />
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.secondaryButtonText}>Volver al Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  valueGold: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.bg.tertiary,
    marginVertical: SPACING.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent.gold + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  actions: {
    gap: SPACING.md,
  },
  secondaryButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
