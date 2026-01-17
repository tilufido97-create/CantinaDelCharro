import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { calculateDeliveryFee, isWithinServiceHours, validateMinimumOrder } from '../../utils/deliveryCalculator';
import { getCart, getCartTotal, clearCart } from '../../utils/cartManager';
import { PAYMENT_METHODS, STORE_INFO } from '../../constants/mockData';
import Button from '../../components/common/Button';
import DeliveryTypeCard from '../../components/checkout/DeliveryTypeCard';

// Helper para formatear precios de forma segura
const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

export default function CheckoutScreen({ navigation }) {
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [serviceHours, setServiceHours] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cartData = await getCart();
    setCart(cartData);
    
    const total = await getCartTotal();
    setSubtotal(parseFloat(total) || 0);
    
    const savedAddress = await AsyncStorage.getItem('default_address');
    if (savedAddress) {
      setAddress(JSON.parse(savedAddress));
    }
    
    setServiceHours(isWithinServiceHours());
  };

  const deliveryFee = deliveryType === 'delivery' && address 
    ? parseFloat(calculateDeliveryFee(address.distance).total) || 0
    : 0;
  const total = subtotal + deliveryFee;

  // Debug
  console.log('=== CHECKOUT DEBUG ===');
  console.log('Subtotal:', subtotal, typeof subtotal);
  console.log('Delivery fee:', deliveryFee, typeof deliveryFee);
  console.log('Total:', total, typeof total);
  console.log('=====================');

  const validation = validateMinimumOrder(subtotal, deliveryType);

  const handlePlaceOrder = async () => {
    if (!serviceHours.isOpen) {
      Alert.alert('Fuera de horario', serviceHours.message);
      return;
    }

    if (deliveryType === 'delivery' && !address) {
      Alert.alert('Dirección requerida', 'Por favor agrega una dirección de entrega');
      navigation.navigate('Address');
      return;
    }

    if (!validation.isValid) {
      Alert.alert('Monto mínimo', validation.message);
      return;
    }

    setLoading(true);

    const orderCount = parseInt(await AsyncStorage.getItem('order_count') || '0') + 1;
    const orderId = `CH-${new Date().getFullYear()}-${String(orderCount).padStart(4, '0')}`;

    const order = {
      id: orderId,
      date: new Date().toISOString(),
      items: cart,
      address: address,
      deliveryType: deliveryType,
      paymentMethod: paymentMethod,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total,
      status: 'confirmed',
      estimatedTime: deliveryType === 'delivery' ? 45 : 15
    };

    await AsyncStorage.setItem('current_order', JSON.stringify(order));
    await AsyncStorage.setItem('order_count', String(orderCount));
    await clearCart();

    setTimeout(() => {
      setLoading(false);
      navigation.replace('OrderConfirmation', { order });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar pedido</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de entrega</Text>
          <DeliveryTypeCard
            type="delivery"
            selected={deliveryType === 'delivery'}
            onSelect={setDeliveryType}
          />
          <View style={{ height: SPACING.md }} />
          <DeliveryTypeCard
            type="pickup"
            selected={deliveryType === 'pickup'}
            onSelect={setDeliveryType}
          />
        </View>

        {deliveryType === 'delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Dirección de entrega</Text>
            {address ? (
              <View style={styles.card}>
                <Text style={styles.addressStreet}>{address.street} {address.number}</Text>
                <Text style={styles.addressZone}>{address.zone}, La Paz</Text>
                {address.reference && (
                  <Text style={styles.addressRef}>Ref: {address.reference}</Text>
                )}
                <TouchableOpacity onPress={() => navigation.navigate('Address')}>
                  <Text style={styles.changeButton}>Cambiar dirección ›</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('Address')}
              >
                <Text style={styles.addButtonText}>+ Agregar dirección</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Horario de entrega</Text>
          <View style={styles.card}>
            <Text style={styles.hoursText}>{serviceHours.message}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛒 Tu pedido ({cart.length} productos)</Text>
          <View style={styles.card}>
            {cart.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <Text style={styles.cartItemText}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.cartItemPrice}>Bs {formatPrice(item.price * item.quantity)}</Text>
              </View>
            ))}
            <TouchableOpacity onPress={() => navigation.navigate('CartTab')}>
              <Text style={styles.editButton}>Editar carrito ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>Bs {formatPrice(subtotal)}</Text>
            </View>
            {deliveryType === 'delivery' && address && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery ({address.distance} km)</Text>
                <Text style={styles.totalValue}>Bs {formatPrice(deliveryFee)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>TOTAL</Text>
              <Text style={styles.totalValueBold}>Bs {formatPrice(total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Método de pago</Text>
          <View style={styles.card}>
            <Text style={styles.paymentText}>
              {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PaymentMethod')}>
              <Text style={styles.changeButton}>Cambiar método ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!validation.isValid && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {validation.message}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Realizar pedido • Bs ${formatPrice(total)}`}
          onPress={handlePlaceOrder}
          disabled={!serviceHours.isOpen || !validation.isValid || (deliveryType === 'delivery' && !address)}
          loading={loading}
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
  scroll: { flex: 1 },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, marginBottom: SPACING.md },
  card: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg },
  addressStreet: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary },
  addressZone: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginTop: SPACING.xs },
  addressRef: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary, marginTop: SPACING.xs },
  changeButton: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.accent.gold, marginTop: SPACING.md, fontWeight: TYPOGRAPHY.weights.medium },
  addButton: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 2, borderColor: COLORS.accent.gold, borderStyle: 'dashed' },
  addButtonText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'center' },
  hoursText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  cartItemText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, flex: 1 },
  cartItemPrice: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },
  editButton: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.accent.gold, marginTop: SPACING.md, fontWeight: TYPOGRAPHY.weights.medium },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  totalLabel: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary },
  totalValue: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary },
  totalLabelBold: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  totalValueBold: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold },
  divider: { height: 1, backgroundColor: COLORS.bg.tertiary, marginVertical: SPACING.md },
  paymentText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary },
  errorCard: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.error + '20', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
  errorText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.error, textAlign: 'center' },
  footer: { padding: SPACING.lg, backgroundColor: COLORS.bg.primary, borderTopWidth: 1, borderTopColor: COLORS.bg.tertiary },
});
