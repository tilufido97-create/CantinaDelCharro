import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getCart, getCartTotal, clearCart } from '../../utils/cartManager';
import Button from '../../components/common/Button';
import DeliveryTypeCard from '../../components/checkout/DeliveryTypeCard';
import PickupTimeSelector from '../../components/checkout/PickupTimeSelector';
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector';
import firebaseOrderService from '../../services/firebaseOrderService';
import * as deliveryOptimizationService from '../../services/deliveryOptimizationService';
import * as deliveryCache from '../../utils/deliveryCache';
import { DELIVERY_CONFIG } from '../../constants/config';

export default function CheckoutScreenNew({ navigation }) {
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [pickupPersonName, setPickupPersonName] = useState('');
  const [pickupTime, setPickupTime] = useState('30min');
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deliveryCalculation, setDeliveryCalculation] = useState(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (address && deliveryType === 'delivery') {
      calculateDeliveryFee();
    }
  }, [address, deliveryType]);

  const loadData = async () => {
    const cartData = await getCart();
    setCart(cartData);
    
    // Calcular subtotal correctamente
    const calculatedSubtotal = cartData.reduce((sum, item) => {
      const product = item.product || item;
      const price = product.price || product.precio || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
    
    setSubtotal(calculatedSubtotal);
    
    const savedAddress = await AsyncStorage.getItem('default_address');
    if (savedAddress) {
      setAddress(JSON.parse(savedAddress));
    }

    // Cargar nombre del usuario desde Google o registro
    const userData = await AsyncStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      // Priorizar displayName de Google, luego nombre, luego email
      const userName = user.displayName || user.nombre || user.email?.split('@')[0] || '';
      setPickupPersonName(userName);
    }
  };

  const deliveryFee = deliveryType === 'delivery' && deliveryCalculation?.pricing
    ? deliveryCalculation.pricing.clientPrice
    : 0;
  const total = subtotal + deliveryFee;

  const getPickupTimeLabel = () => {
    const times = {
      '15min': '15 minutos',
      '30min': '30 minutos',
      '1hour': '1 hora',
      '2hours': '2 horas'
    };
    return times[pickupTime] || '30 minutos';
  };

  const calculateDeliveryFee = async () => {
    if (!address) return;

    try {
      setIsCalculatingDelivery(true);
      
      const fullAddress = `${address.street} ${address.number}, ${address.zone}, La Paz, Bolivia`;
      
      // Verificar caché
      const cached = await deliveryCache.get(fullAddress);
      if (cached && deliveryCache.isValid(cached)) {
        console.log('✅ Usando delivery en caché');
        setDeliveryCalculation(cached);
        setIsCalculatingDelivery(false);
        return;
      }
      
      // Calcular con servicio de optimización
      const orderDetails = {
        subtotal: subtotal,
        items: cart,
        itemCount: cart.length
      };
      
      const calculation = await deliveryOptimizationService.calculateOptimalDelivery(
        fullAddress,
        orderDetails
      );
      
      // Validar distancia máxima
      const MAX_DISTANCE = DELIVERY_CONFIG.MAX_DELIVERY_DISTANCE || 15;
      if (calculation.distance.km > MAX_DISTANCE) {
        Alert.alert(
          'Fuera de Cobertura',
          `Tu dirección está a ${calculation.distance.km} km. Cobertura máxima: ${MAX_DISTANCE} km.`,
          [
            { text: 'Elegir Otra Dirección', onPress: () => navigation.navigate('Address') },
            { text: 'Cancelar' }
          ]
        );
        setIsCalculatingDelivery(false);
        return;
      }
      
      setDeliveryCalculation(calculation);
      await deliveryCache.set(fullAddress, calculation);
      setIsCalculatingDelivery(false);
      
    } catch (error) {
      console.error('❌ Error calculando delivery:', error);
      
      // Fallback a costo fijo
      setDeliveryCalculation({
        pricing: { clientPrice: 15 },
        distance: { text: 'Estimado', km: 5 },
        duration: { text: '30-45 min', minutes: 35 },
        isEstimate: true
      });
      
      setIsCalculatingDelivery(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Validaciones
    if (deliveryType === 'delivery' && !address) {
      Alert.alert('Dirección requerida', 'Por favor agrega una dirección de entrega');
      navigation.navigate('Address');
      return;
    }

    setLoading(true);

    try {
      const userData = await AsyncStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : {};

      // Nombre del cliente: priorizar displayName de Google, luego nombre, luego email
      const customerName = user.displayName || user.nombre || user.email?.split('@')[0] || 'Cliente';
      
      // Nombre de quien recoge: usar el ingresado o el del usuario
      const pickupName = pickupPersonName.trim() || customerName;

      const orderData = {
        userId: user.id || 'guest',
        customerName,
        customerEmail: user.email || '',
        customerPhone: user.phone || address?.phone || '',
        deliveryType,
        
        // Datos de recojo (opcional)
        pickupPersonName: deliveryType === 'pickup' ? pickupName : null,
        estimatedPickupTime: deliveryType === 'pickup' ? getPickupTimeLabel() : null,
        
        // Datos de delivery
        deliveryAddress: deliveryType === 'delivery' ? {
          street: `${address.street} ${address.number}`,
          zone: address.zone,
          city: 'La Paz',
          reference: address.reference || ''
        } : null,
        deliveryCost: deliveryFee,
        
        paymentMethod,
        
        items: cart.map(item => {
          // Normalizar estructura del producto
          const product = item.product || item;
          const productId = product.id;
          const productName = product.name || product.nombre;
          const productPrice = product.price || product.precio;
          const quantity = item.quantity || 1;
          
          return {
            productId,
            name: productName,
            quantity,
            price: productPrice,
            subtotal: productPrice * quantity
          };
        }),
        
        subtotal,
        total
      };

      const result = await firebaseOrderService.createOrder(orderData);

      if (result.success) {
        await clearCart();
        setLoading(false);
        
        navigation.replace('OrderConfirmation', {
          orderId: result.orderId,
          orderNumber: result.orderId,
          total,
          deliveryType,
          estimatedTime: deliveryType === 'pickup' ? getPickupTimeLabel() : '30-45 minutos'
        });
      } else {
        setLoading(false);
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      setLoading(false);
      Alert.alert('Error', 'No se pudo procesar tu pedido');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar pedido</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Tipo de entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚚 Tipo de entrega</Text>
          <DeliveryTypeCard
            type="pickup"
            selected={deliveryType === 'pickup'}
            onSelect={setDeliveryType}
          />
          <View style={{ height: SPACING.md }} />
          <DeliveryTypeCard
            type="delivery"
            selected={deliveryType === 'delivery'}
            onSelect={setDeliveryType}
          />
        </View>

        {/* RECOJO EN TIENDA */}
        {deliveryType === 'pickup' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 ¿Quién recogerá el pedido? (Opcional)</Text>
              <TextInput
                style={styles.input}
                value={pickupPersonName}
                onChangeText={setPickupPersonName}
                placeholder="Dejar vacío para usar tu nombre"
                placeholderTextColor={COLORS.text.tertiary}
              />
              {pickupPersonName && (
                <Text style={styles.helperText}>Recogerá: {pickupPersonName}</Text>
              )}
            </View>

            <View style={styles.section}>
              <PickupTimeSelector
                selected={pickupTime}
                onSelect={setPickupTime}
              />
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={20} color={COLORS.accent.gold} />
                <Text style={styles.infoText}>
                  Tu pedido estará listo en {getPickupTimeLabel()}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* DELIVERY */}
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
            {address && deliveryCalculation && (
              <View style={styles.deliveryInfoCard}>
                <View style={styles.deliveryInfoRow}>
                  <Ionicons name="location" size={16} color={COLORS.accent.gold} />
                  <Text style={styles.deliveryInfoText}>
                    {deliveryCalculation.distance?.text || 'Calculando...'}
                  </Text>
                </View>
                <View style={styles.deliveryInfoRow}>
                  <Ionicons name="time" size={16} color={COLORS.accent.gold} />
                  <Text style={styles.deliveryInfoText}>
                    {deliveryCalculation.duration?.text || 'Calculando...'}
                  </Text>
                </View>
                {deliveryCalculation.vehicle && (
                  <View style={styles.deliveryInfoRow}>
                    <Ionicons name="car" size={16} color={COLORS.accent.gold} />
                    <Text style={styles.deliveryInfoText}>
                      {deliveryCalculation.vehicle.marca} {deliveryCalculation.vehicle.modelo}
                    </Text>
                  </View>
                )}
              </View>
            )}
            {isCalculatingDelivery && (
              <View style={styles.calculatingCard}>
                <ActivityIndicator size="small" color={COLORS.accent.gold} />
                <Text style={styles.calculatingText}>Calculando mejor ruta...</Text>
              </View>
            )}
            <View style={styles.infoCard}>
              <Ionicons name="time" size={20} color={COLORS.accent.gold} />
              <Text style={styles.infoText}>
                Llegará en {deliveryCalculation?.duration?.text || '30-45 minutos'}
              </Text>
            </View>
          </View>
        )}

        {/* Resumen del pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛒 Tu pedido ({cart.length} productos)</Text>
          <View style={styles.card}>
            {cart.map((item, index) => {
              const product = item.product || item;
              const productName = product.name || product.nombre;
              const productPrice = product.price || product.precio || 0;
              const quantity = item.quantity || 1;
              
              return (
                <View key={index} style={styles.cartItem}>
                  <Text style={styles.cartItemText}>
                    {quantity}x {productName}
                  </Text>
                  <Text style={styles.cartItemPrice}>
                    Bs {(productPrice * quantity).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Método de pago */}
        <View style={styles.section}>
          <PaymentMethodSelector
            selected={paymentMethod}
            onSelect={setPaymentMethod}
            total={total}
          />
        </View>

        {/* Total */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>Bs {subtotal.toFixed(2)}</Text>
            </View>
            {deliveryType === 'delivery' && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery</Text>
                <Text style={styles.totalValue}>Bs {deliveryFee.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>TOTAL</Text>
              <Text style={styles.totalValueBold}>Bs {total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Confirmar Pedido • Bs ${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          disabled={deliveryType === 'delivery' && !address}
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
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  scroll: { flex: 1 },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, marginBottom: SPACING.md },
  input: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, borderWidth: 1, borderColor: COLORS.bg.tertiary },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.accent.gold + '20', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.md },
  infoText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  card: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md },
  addressStreet: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary },
  addressZone: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginTop: SPACING.xs },
  addressRef: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary, marginTop: SPACING.xs },
  changeButton: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.accent.gold, marginTop: SPACING.md, fontWeight: TYPOGRAPHY.weights.medium },
  addButton: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.md, padding: SPACING.lg, borderWidth: 2, borderColor: COLORS.accent.gold, borderStyle: 'dashed' },
  addButtonText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'center' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  cartItemText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, flex: 1 },
  cartItemPrice: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.medium },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  totalLabel: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary },
  totalValue: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary },
  totalLabelBold: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  totalValueBold: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.accent.gold },
  divider: { height: 1, backgroundColor: COLORS.bg.tertiary, marginVertical: SPACING.md },
  footer: { padding: SPACING.lg, backgroundColor: COLORS.bg.primary, borderTopWidth: 1, borderTopColor: COLORS.bg.tertiary },
  deliveryInfoCard: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginTop: SPACING.md, gap: SPACING.sm },
  deliveryInfoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  deliveryInfoText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  calculatingCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.accent.gold + '20', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.md },
  calculatingText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  helperText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.accent.gold, marginTop: SPACING.xs, fontStyle: 'italic' },
});
