import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../constants/theme';
import { getOrderById } from '../../services/orderService';

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    const orderData = await getOrderById(orderId);
    setOrder(orderData);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accent.gold} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.semantic.error} />
        <Text style={styles.errorText}>Pedido no encontrado</Text>
      </View>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'delivered': return { label: 'Entregado', color: COLORS.semantic.success, icon: 'checkmark-circle' };
      case 'cancelled': return { label: 'Cancelado', color: COLORS.semantic.error, icon: 'close-circle' };
      case 'delivering': return { label: 'En camino', color: COLORS.semantic.info, icon: 'bicycle' };
      case 'preparing': return { label: 'Preparando', color: COLORS.semantic.warning, icon: 'time' };
      default: return { label: 'Pendiente', color: COLORS.text.tertiary, icon: 'hourglass' };
    }
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Pedido</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[statusConfig.color + '30', statusConfig.color + '10']} style={styles.statusCard}>
          <Ionicons name={statusConfig.icon} size={48} color={statusConfig.color} />
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRODUCTOS ({order.items.length})</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Text style={styles.itemEmoji}>{item.image}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>Bs. {item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.itemQuantity}>
                <Text style={styles.quantityText}>x{item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DIRECCIÓN DE ENTREGA</Text>
          <View style={styles.addressCard}>
            <Ionicons name="location" size={24} color={COLORS.accent.gold} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressStreet}>{order.deliveryAddress.street}</Text>
              <Text style={styles.addressDetails}>{order.deliveryAddress.zone}, {order.deliveryAddress.city}</Text>
              {order.deliveryAddress.reference && (
                <Text style={styles.addressReference}>Ref: {order.deliveryAddress.reference}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESUMEN DE PAGO</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>Bs. {order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>{order.delivery === 0 ? 'Gratis' : `Bs. ${order.delivery.toFixed(2)}`}</Text>
            </View>
            {order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Descuento</Text>
                <Text style={[styles.summaryValue, { color: COLORS.semantic.success }]}>-Bs. {order.discount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Bs. {order.total.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Ionicons name="card" size={16} color={COLORS.text.tertiary} />
              <Text style={styles.paymentMethodText}>{order.paymentMethod}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.background.tertiary },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  placeholder: { width: 40 },
  statusCard: { alignItems: 'center', padding: SPACING.xl, marginHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: 16 },
  statusLabel: { fontSize: 24, fontWeight: '700', marginTop: SPACING.md, marginBottom: SPACING.sm },
  orderNumber: { fontSize: 14, color: COLORS.text.secondary },
  section: { padding: SPACING.md },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text.tertiary, letterSpacing: 1, marginBottom: SPACING.md },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background.secondary, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.sm },
  itemEmoji: { fontSize: 40, marginRight: SPACING.md },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary, marginBottom: SPACING.xs },
  itemPrice: { fontSize: 14, color: COLORS.text.secondary },
  itemQuantity: { backgroundColor: COLORS.background.tertiary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 8 },
  quantityText: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  addressCard: { flexDirection: 'row', backgroundColor: COLORS.background.secondary, padding: SPACING.md, borderRadius: 12 },
  addressInfo: { flex: 1, marginLeft: SPACING.md },
  addressStreet: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary, marginBottom: SPACING.xs },
  addressDetails: { fontSize: 14, color: COLORS.text.secondary, marginBottom: SPACING.xs },
  addressReference: { fontSize: 13, color: COLORS.text.tertiary, fontStyle: 'italic' },
  summaryCard: { backgroundColor: COLORS.background.secondary, padding: SPACING.md, borderRadius: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  summaryLabel: { fontSize: 14, color: COLORS.text.secondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  divider: { height: 1, backgroundColor: COLORS.background.tertiary, marginVertical: SPACING.sm },
  totalLabel: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  totalValue: { fontSize: 18, fontWeight: '700', color: COLORS.accent.gold },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.background.tertiary },
  paymentMethodText: { fontSize: 13, color: COLORS.text.tertiary },
  errorText: { fontSize: 16, color: COLORS.text.secondary, marginTop: SPACING.md },
  bottomSpacing: { height: SPACING.xl },
});
