import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Button from '../../components/common/Button';

export default function OrderConfirmationScreen({ route, navigation }) {
  const { order } = route.params;
  
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeTab' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.skull}>💀</Text>
          <Text style={styles.hat}>🤠</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>¡Pedido confirmado! 🎉</Text>
          <Text style={styles.subtitle}>Tu pedido está siendo preparado</Text>
        </Animated.View>

        <Animated.View style={[styles.detailsCard, { opacity: fadeAnim }]}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pedido</Text>
            <Text style={styles.detailValue}>{order.id}</Text>
          </View>

          {order.deliveryType === 'delivery' && order.address && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Dirección</Text>
              <Text style={styles.detailValue}>
                {order.address.street} {order.address.number}{'\n'}
                {order.address.zone}
              </Text>
            </View>
          )}

          {order.deliveryType === 'pickup' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🏪 Recojo en</Text>
              <Text style={styles.detailValue}>
                Av. Arce #2140, Sopocachi
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏱️ Tiempo estimado</Text>
            <Text style={styles.detailValue}>{order.estimatedTime} min</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💰 Total</Text>
            <Text style={styles.detailValueBold}>Bs {order.total.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Método de pago</Text>
            <Text style={styles.detailValue}>
              {order.paymentMethod === 'cash' ? 'Efectivo contra entrega' : 'QR'}
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>
          <Button
            title="Ver estado del pedido"
            onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
            fullWidth
          />
          <View style={{ height: SPACING.md }} />
          <Button
            title="Volver al inicio"
            variant="outline"
            onPress={handleGoHome}
            fullWidth
          />
        </Animated.View>
      </View>

      {confettiAnim._value > 0 && (
        <Animated.View style={[styles.confetti, { opacity: confettiAnim }]} pointerEvents="none">
          <Text style={styles.confettiEmoji}>🎉</Text>
          <Text style={styles.confettiEmoji}>🎊</Text>
          <Text style={styles.confettiEmoji}>✨</Text>
          <Text style={styles.confettiEmoji}>🎉</Text>
          <Text style={styles.confettiEmoji}>🎊</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  content: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'center' },
  iconContainer: { alignItems: 'center', marginBottom: SPACING.xl },
  skull: { fontSize: 80 },
  hat: { fontSize: 60, marginTop: -20 },
  title: { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.success, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, textAlign: 'center', marginBottom: SPACING.xxl },
  detailsCard: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xl },
  detailRow: { marginBottom: SPACING.md },
  detailLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary, marginBottom: SPACING.xs },
  detailValue: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary },
  detailValueBold: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold },
  buttonsContainer: {},
  confetti: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: SPACING.xl },
  confettiEmoji: { fontSize: 60, opacity: 0.6 },
});
