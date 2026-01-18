import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

const ORDER_STATES = {
  confirmed: { label: 'Confirmado', icon: '✅', color: COLORS.success },
  preparing: { label: 'Preparando', icon: '⏱️', color: COLORS.warning },
  on_the_way: { label: 'En camino', icon: '🏍️', color: COLORS.info },
  delivered: { label: 'Entregado', icon: '🎉', color: COLORS.success },
};

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  
  const [order, setOrder] = useState(null);
  const [currentState, setCurrentState] = useState('confirmed');
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [progress, setProgress] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadOrderData();
    startSimulation();
  }, []);

  const loadOrderData = async () => {
    try {
      const orderData = await AsyncStorage.getItem('current_order');
      if (orderData) {
        setOrder(JSON.parse(orderData));
      }
    } catch (error) {
      console.error('Error loading order:', error);
    }
  };

  const startSimulation = () => {
    // Confirmed -> Preparing (5s)
    setTimeout(() => {
      setCurrentState('preparing');
      animateProgress(0.33);
    }, 5000);

    // Preparing -> On the way (10s)
    setTimeout(() => {
      setCurrentState('on_the_way');
      animateProgress(0.66);
    }, 15000);

    // On the way -> Delivered (20s)
    setTimeout(() => {
      setCurrentState('delivered');
      animateProgress(1);
      setEstimatedTime(0);
      showDeliveredAlert();
    }, 35000);

    // Timer countdown
    const interval = setInterval(() => {
      setEstimatedTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  };

  const animateProgress = (toValue) => {
    Animated.timing(progressAnim, {
      toValue,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    setProgress(toValue);
  };

  const showDeliveredAlert = () => {
    Alert.alert(
      '¡Pedido entregado! 🎉',
      'Disfruta tu bebida responsablemente',
      [
        { text: 'Volver al inicio', onPress: () => navigation.navigate('HomeTab') }
      ]
    );
  };

  const handleCall = () => {
    Linking.openURL('tel:+59170123456');
  };

  const handleChat = () => {
    Alert.alert('Chat', 'Función disponible próximamente');
  };

  const handleSOS = () => {
    Alert.alert('🚨 Emergencia', '¿Qué sucedió?', [
      { text: 'Cancelar pedido', style: 'destructive' },
      { text: 'Reportar problema' },
      { text: 'Cerrar', style: 'cancel' }
    ]);
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando pedido...</Text>
      </SafeAreaView>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguimiento</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.mapMock}>
        <Text style={styles.mapTitle}>🗺️ Mapa en tiempo real</Text>
        <View style={styles.routeContainer}>
          <View style={styles.marker}>
            <Text style={styles.markerText}>🏪</Text>
            <Text style={styles.markerLabel}>Tienda</Text>
          </View>
          
          <View style={styles.routeLine}>
            <Animated.View style={[styles.routeProgress, { width: progressWidth }]} />
            {currentState === 'on_the_way' && (
              <View style={[styles.deliveryMarker, { left: `${progress * 100}%` }]}>
                <Text style={styles.deliveryIcon}>🏍️</Text>
              </View>
            )}
          </View>
          
          <View style={styles.marker}>
            <Text style={styles.markerText}>📍</Text>
            <Text style={styles.markerLabel}>Tu casa</Text>
          </View>
        </View>
        <Text style={styles.distance}>Distancia: {order.address?.distance || 2.3} km</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Pedido #{order.id}</Text>
          {currentState === 'on_the_way' && (
            <Text style={styles.driverName}>🏍️ Jorge está en camino</Text>
          )}
        </View>

        {currentState !== 'delivered' && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerIcon}>⏱️</Text>
            <Text style={styles.timerText}>Llega en ~{estimatedTime} minutos</Text>
          </View>
        )}

        <View style={styles.timeline}>
          {Object.entries(ORDER_STATES).map(([key, state], index) => {
            const stateKeys = Object.keys(ORDER_STATES);
            const currentIndex = stateKeys.indexOf(currentState);
            const isActive = key === currentState;
            const isCompleted = stateKeys.indexOf(key) < currentIndex;

            return (
              <View key={key} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineIcon,
                    (isCompleted || isActive) && styles.timelineIconActive
                  ]}>
                    <Text style={styles.timelineEmoji}>{state.icon}</Text>
                  </View>
                  {index < Object.keys(ORDER_STATES).length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      isCompleted && styles.timelineLineActive
                    ]} />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={[
                    styles.timelineLabel,
                    (isCompleted || isActive) && styles.timelineLabelActive
                  ]}>
                    {state.label}
                  </Text>
                  {isActive && (
                    <Text style={styles.timelineTime}>
                      {new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.orderSummary}>
          <Text style={styles.summaryText}>
            {order.items?.length || 0} productos • Bs {order.total?.toFixed(2)}
          </Text>
          <Text style={styles.summaryText}>
            {order.paymentMethod === 'cash' ? 'Efectivo contra entrega' : 'Pagado con QR'}
          </Text>
        </View>

        {currentState !== 'delivered' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleChat}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.sosButton]} onPress={handleSOS}>
              <Text style={styles.actionIcon}>🚨</Text>
              <Text style={[styles.actionText, styles.sosText]}>SOS</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  backButton: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.medium },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  mapMock: { backgroundColor: COLORS.bg.secondary, margin: SPACING.lg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  mapTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary, marginBottom: SPACING.md },
  routeContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: SPACING.lg },
  marker: { alignItems: 'center' },
  markerText: { fontSize: 32 },
  markerLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.tertiary, marginTop: SPACING.xs },
  routeLine: { flex: 1, height: 4, backgroundColor: COLORS.bg.tertiary, marginHorizontal: SPACING.md, borderRadius: 2, position: 'relative' },
  routeProgress: { height: '100%', backgroundColor: COLORS.accent.gold, borderRadius: 2 },
  deliveryMarker: { position: 'absolute', top: -16, marginLeft: -16 },
  deliveryIcon: { fontSize: 32 },
  distance: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  infoCard: { backgroundColor: COLORS.bg.secondary, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.lg, flex: 1 },
  orderHeader: { marginBottom: SPACING.md },
  orderNumber: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.secondary, marginBottom: SPACING.xs },
  driverName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg.tertiary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg },
  timerIcon: { fontSize: 20, marginRight: SPACING.sm },
  timerText: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary },
  timeline: { marginBottom: SPACING.lg },
  timelineItem: { flexDirection: 'row', marginBottom: SPACING.md },
  timelineLeft: { alignItems: 'center', marginRight: SPACING.md },
  timelineIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg.tertiary, justifyContent: 'center', alignItems: 'center' },
  timelineIconActive: { backgroundColor: COLORS.accent.gold },
  timelineEmoji: { fontSize: 20 },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.bg.tertiary, marginVertical: 4 },
  timelineLineActive: { backgroundColor: COLORS.accent.gold },
  timelineRight: { flex: 1, justifyContent: 'center' },
  timelineLabel: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.tertiary },
  timelineLabelActive: { color: COLORS.text.primary },
  timelineTime: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.accent.gold, marginTop: SPACING.xs },
  orderSummary: { backgroundColor: COLORS.bg.tertiary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.lg },
  summaryText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: 4 },
  actionButtons: { flexDirection: 'row', gap: SPACING.sm },
  actionButton: { flex: 1, backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  sosButton: { backgroundColor: COLORS.error + '20' },
  actionIcon: { fontSize: 20, marginBottom: SPACING.xs },
  actionText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary },
  sosText: { color: COLORS.error },
  loadingText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.secondary, textAlign: 'center', marginTop: SPACING.xl },
});
