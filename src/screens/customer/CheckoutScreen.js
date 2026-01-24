import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { calculateDeliveryFee, isWithinServiceHours, validateMinimumOrder } from '../../utils/deliveryCalculator';
import { getCart, getCartTotal, clearCart } from '../../utils/cartManager';
import { PAYMENT_METHODS, STORE_INFO } from '../../constants/mockData';
import Button from '../../components/common/Button';
import DeliveryTypeCard from '../../components/checkout/DeliveryTypeCard';
import DeliveryInfoCard from '../../components/customer/DeliveryInfoCard';
import DeliveryCalculationModal from '../../components/customer/DeliveryCalculationModal';
import * as deliveryOptimizationService from '../../services/deliveryOptimizationService';
import * as deliveryCache from '../../utils/deliveryCache';
import { isGoogleMapsConfigured, DELIVERY_CONFIG } from '../../constants/config';
import { createOrder } from '../../services/firebaseOrderService';
import { isFirebaseConfigured } from '../../config/firebaseConfig';

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
  
  // Estados para delivery inteligente
  const [deliveryCalculation, setDeliveryCalculation] = useState({
    distance: null,
    duration: null,
    vehicle: null,
    pricing: null,
    isCalculating: false,
    isEstimate: false,
    calculatedAt: null,
    error: null
  });
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  useEffect(() => {
    loadData();
  }, []);
  
  // Calcular delivery cuando se selecciona dirección
  useEffect(() => {
    if (address && deliveryType === 'delivery') {
      calculateDeliveryFee(address);
    }
  }, [address, deliveryType]);
  
  // Recalcular si el usuario vuelve a la pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      recalculateIfNeeded();
    });
    
    return unsubscribe;
  }, [navigation, deliveryCalculation]);

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

  const deliveryFee = deliveryType === 'delivery' && deliveryCalculation.pricing
    ? deliveryCalculation.pricing.clientPrice
    : 0;
  const total = subtotal + deliveryFee;

  // Debug
  console.log('=== CHECKOUT DEBUG ===');
  console.log('Subtotal:', subtotal, typeof subtotal);
  console.log('Delivery fee:', deliveryFee, typeof deliveryFee);
  console.log('Total:', total, typeof total);
  console.log('=====================');

  const calculateDeliveryFeeIntelligent = async (selectedAddress) => {
    try {
      setIsCalculatingDelivery(true);
      setDeliveryCalculation(prev => ({...prev, isCalculating: true}));
      
      const fullAddress = `${selectedAddress.street} ${selectedAddress.number}, ${selectedAddress.zone}, La Paz, Bolivia`;
      console.log('📦 Calculando delivery para:', fullAddress);
      
      // PASO 1: Verificar caché primero
      const cached = await deliveryCache.get(fullAddress);
      if (cached && deliveryCache.isValid(cached)) {
        console.log('✅ Usando delivery en caché');
        setDeliveryCalculation(cached);
        setIsCalculatingDelivery(false);
        return;
      }
      
      // PASO 2: Verificar disponibilidad de vehículos
      const availability = await deliveryOptimizationService.validateDeliveryAvailability();
      
      if (!availability.available) {
        setDeliveryAvailable(false);
        Alert.alert(
          'Sin Cobertura',
          availability.message + '\n\nPor favor intenta más tarde o selecciona otra dirección.',
          [{ text: 'Entendido' }]
        );
        setIsCalculatingDelivery(false);
        return;
      }
      
      setDeliveryAvailable(true);
      
      // PASO 3: Calcular con servicio de optimización
      const orderDetails = {
        subtotal: subtotal,
        items: cart,
        itemCount: cart.length
      };
      
      const calculation = await deliveryOptimizationService.calculateOptimalDelivery(
        fullAddress,
        orderDetails
      );
      
      console.log('✅ Delivery calculado:', calculation.pricing.clientPrice, 'Bs');
      
      // PASO 4: Validar distancia máxima
      const MAX_DISTANCE = DELIVERY_CONFIG.MAX_DELIVERY_DISTANCE;
      if (calculation.distance.km > MAX_DISTANCE) {
        Alert.alert(
          'Fuera de Cobertura',
          `Lo sentimos, tu dirección está a ${calculation.distance.km} km de nuestro local.\n\nNuestra cobertura máxima es de ${MAX_DISTANCE} km.`,
          [
            { text: 'Elegir Otra Dirección', onPress: () => navigation.navigate('Address') },
            { text: 'Cancelar' }
          ]
        );
        setIsCalculatingDelivery(false);
        return;
      }
      
      // PASO 5: Guardar cálculo
      const calculationWithMeta = {
        ...calculation,
        isCalculating: false,
        isEstimate: calculation.isFallback || false,
        calculatedAt: new Date().toISOString(),
        error: null
      };
      
      setDeliveryCalculation(calculationWithMeta);
      
      // PASO 6: Guardar en caché
      await deliveryCache.set(fullAddress, calculationWithMeta);
      
      setIsCalculatingDelivery(false);
      
    } catch (error) {
      console.error('❌ Error calculando delivery:', error);
      
      // Fallback a cálculo por zona
      const fallbackFee = calculateFallbackDeliveryFee(selectedAddress);
      
      setDeliveryCalculation({
        isCalculating: false,
        isEstimate: true,
        error: 'No se pudo calcular distancia exacta',
        pricing: { clientPrice: fallbackFee },
        distance: { text: 'Estimado', km: selectedAddress.distance || 5 },
        duration: { text: 'Por confirmar', minutes: 20 },
        calculatedAt: new Date().toISOString()
      });
      
      setIsCalculatingDelivery(false);
      
      // Mostrar warning al usuario
      Alert.alert(
        'Cálculo Estimado',
        'No pudimos calcular la distancia exacta. El costo de delivery es aproximado y será confirmado antes de la entrega.',
        [{ text: 'Entendido' }]
      );
    }
  };
  
  const calculateFallbackDeliveryFee = (selectedAddress) => {
    const zona = selectedAddress.zone?.toLowerCase() || '';
    
    // Zonas cercanas
    if (zona.includes('sopocachi') || zona.includes('san miguel')) {
      return 5;
    }
    // Zonas medias
    if (zona.includes('miraflores') || zona.includes('calacoto') || zona.includes('san jorge')) {
      return 10;
    }
    // Zonas lejanas
    return 15;
  };
  
  const handleShowDeliveryInfo = () => {
    setShowDeliveryModal(true);
  };
  
  const recalculateIfNeeded = async () => {
    if (!address || deliveryType !== 'delivery') return;
    
    // Verificar si el cálculo es muy viejo (>30 min)
    if (deliveryCalculation.calculatedAt) {
      const calculatedTime = new Date(deliveryCalculation.calculatedAt);
      const now = new Date();
      const diffMinutes = (now - calculatedTime) / 1000 / 60;
      
      if (diffMinutes > 30) {
        console.log('🔄 Recalculando delivery (cálculo antiguo)');
        await calculateDeliveryFeeIntelligent(address);
      }
    }
  };
  
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

    try {
      // Obtener datos del usuario
      const userData = await AsyncStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : {};
      
      // Preparar datos del pedido
      const orderData = {
        userId: user.id || 'guest',
        customerName: user.displayName || user.nombre || 'Cliente',
        customerPhone: user.phone || address?.phone || '',
        customerEmail: user.email || '',
        items: cart.map(item => ({
          productId: item.id,
          nombre: item.nombre || item.name,
          cantidad: item.quantity || 1,
          precio: item.precio || item.price,
          subtotal: (item.precio || item.price) * (item.quantity || 1),
          imagenURL: item.imagenURL || item.imagen
        })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        paymentMethod: paymentMethod,
        deliveryType: deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? {
          calle: `${address.street} ${address.number}`,
          zona: address.zone,
          referencia: address.reference || '',
          telefono: address.phone || ''
        } : null,
        deliveryCalculation: deliveryType === 'delivery' ? deliveryCalculation : null
      };
      
      // Intentar guardar en Firebase
      if (isFirebaseConfigured()) {
        console.log('🔥 Guardando pedido en Firebase...');
        
        const { id: firebaseOrderId, orderNumber } = await createOrder(orderData);
        
        console.log('✅ Pedido guardado en Firebase:', firebaseOrderId, orderNumber);
        
        // Guardar también en AsyncStorage como backup
        const order = {
          id: firebaseOrderId,
          orderNumber: orderNumber,
          ...orderData,
          date: new Date().toISOString(),
          status: 'pending'
        };
        
        await AsyncStorage.setItem('current_order', JSON.stringify(order));
        
        // Guardar en historial local
        const historyData = await AsyncStorage.getItem('order_history');
        const history = historyData ? JSON.parse(historyData) : [];
        history.push(order);
        await AsyncStorage.setItem('order_history', JSON.stringify(history));
        
        // Limpiar carrito
        await clearCart();
        
        setLoading(false);
        
        // Navegar a confirmación
        navigation.replace('OrderConfirmation', {
          orderId: firebaseOrderId,
          orderNumber: orderNumber,
          total: total
        });
        
      } else {
        // Fallback a AsyncStorage si Firebase no está configurado
        console.log('⚠️ Firebase no configurado, guardando en AsyncStorage');
        
        const orderCount = parseInt(await AsyncStorage.getItem('order_count') || '0') + 1;
        const orderId = `CH-${new Date().getFullYear()}-${String(orderCount).padStart(4, '0')}`;

        const order = {
          id: orderId,
          orderNumber: orderId,
          date: new Date().toISOString(),
          ...orderData,
          status: 'confirmed',
          estimatedTime: deliveryType === 'delivery' ? 45 : 15
        };

        await AsyncStorage.setItem('current_order', JSON.stringify(order));
        await AsyncStorage.setItem('order_count', String(orderCount));
        await clearCart();

        setLoading(false);
        navigation.replace('OrderConfirmation', { order });
      }
      
    } catch (error) {
      console.error('❌ Error al crear pedido:', error);
      setLoading(false);
      Alert.alert(
        'Error',
        'No se pudo procesar tu pedido. Por favor intenta de nuevo.',
        [
          { text: 'Reintentar', onPress: () => handlePlaceOrder() },
          { text: 'Cancelar' }
        ]
      );
    }
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
              <>
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
                
                {/* Card de información del delivery */}
                <DeliveryInfoCard
                  calculation={deliveryCalculation}
                  isCalculating={isCalculatingDelivery}
                  onShowInfo={handleShowDeliveryInfo}
                />
                
                {/* Warning si es estimado */}
                {deliveryCalculation.isEstimate && !deliveryCalculation.error && (
                  <View style={styles.warningBanner}>
                    <Ionicons name="information-circle" size={20} color="#FF9500" />
                    <Text style={styles.warningText}>
                      Costo estimado. Será confirmado antes de la entrega.
                    </Text>
                  </View>
                )}
                
                {/* Error si falló cálculo */}
                {deliveryCalculation.error && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="warning" size={20} color="#FF3B30" />
                    <Text style={styles.errorText}>
                      {deliveryCalculation.error}
                    </Text>
                  </View>
                )}
              </>
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.totalLabel}>Delivery</Text>
                  {deliveryCalculation.distance && (
                    <Text style={styles.deliveryDetails}>
                      {deliveryCalculation.distance.text} • {deliveryCalculation.duration?.text || 'Calculando...'}
                    </Text>
                  )}
                  {deliveryCalculation.vehicle && (
                    <Text style={styles.deliveryDetails}>
                      {deliveryCalculation.vehicle.marca} {deliveryCalculation.vehicle.modelo}
                    </Text>
                  )}
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  {isCalculatingDelivery ? (
                    <ActivityIndicator size="small" color={COLORS.accent.gold} />
                  ) : (
                    <>
                      <Text style={styles.totalValue}>
                        Bs {formatPrice(deliveryFee)}
                      </Text>
                      {deliveryCalculation.isEstimate && (
                        <Text style={styles.estimateTag}>Estimado</Text>
                      )}
                    </>
                  )}
                </View>
              </View>
            )}
            
            {/* Botón info */}
            {deliveryType === 'delivery' && address && deliveryCalculation.pricing && (
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={handleShowDeliveryInfo}
              >
                <Ionicons name="information-circle-outline" size={16} color={COLORS.accent.gold} />
                <Text style={styles.infoButtonText}>¿Cómo calculamos el delivery?</Text>
              </TouchableOpacity>
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
          title={
            isCalculatingDelivery 
              ? 'Calculando delivery...' 
              : !deliveryAvailable
              ? 'Sin cobertura'
              : `Realizar pedido • Bs ${formatPrice(total)}`
          }
          onPress={handlePlaceOrder}
          disabled={
            !serviceHours.isOpen || 
            !validation.isValid || 
            (deliveryType === 'delivery' && !address) ||
            isCalculatingDelivery ||
            !deliveryAvailable
          }
          loading={loading}
          fullWidth
        />
      </View>
      
      {/* Modal de información */}
      <DeliveryCalculationModal
        visible={showDeliveryModal}
        calculation={deliveryCalculation}
        onClose={() => setShowDeliveryModal(false)}
      />
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
  deliveryDetails: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.tertiary, marginTop: 2 },
  estimateTag: { fontSize: 10, color: '#FF9500', marginTop: 2 },
  infoButton: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.sm, paddingVertical: SPACING.xs },
  infoButtonText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.accent.gold },
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: '#FF950020', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.md },
  warningText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, color: '#FF9500' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: '#FF3B3020', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.md },
});
