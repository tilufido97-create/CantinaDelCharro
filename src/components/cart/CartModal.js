import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  StyleSheet, Animated, Dimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { updateQuantity } from '../../utils/cartManager';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CartModal = ({ visible, onClose, cartItems, onUpdateCart, navigation }) => {
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const deliveryCost = 15;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const subtotal = cartItems.reduce((sum, item) => 
    sum + ((item.product?.price || 0) * item.quantity), 0
  );
  const total = subtotal + deliveryCost;

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      await updateQuantity(productId, newQuantity);
      onUpdateCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Mostrar alerta si excede el stock
      const Alert = require('react-native').Alert;
      Alert.alert('Stock insuficiente', error.message || 'No se pudo actualizar la cantidad');
    }
  };

  const handleCheckout = () => {
    onClose();
    navigation.navigate('Checkout');
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carrito</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.storeCard}>
            <Text style={styles.storeEmoji}>💀🤠</Text>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>La Cantina del Charro</Text>
              <Text style={styles.storeCategory}>Tequila hasta los huesos</Text>
            </View>
          </View>

          <View style={styles.productsContainer}>
            {cartItems.map((item) => (
              <View key={item.product.id} style={styles.productItem}>
                <View style={styles.productLeft}>
                  <Text style={styles.productEmoji}>🍺</Text>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.productPrice}>
                      Bs. {(item.product.price || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={18} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={18} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Resumen de Costos</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>Bs. {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Costo de Delivery</Text>
              <Text style={styles.summaryValue}>Bs. {deliveryCost.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total a Pagar</Text>
              <Text style={styles.totalValue}>Bs. {total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={{ height: 180 }} />
        </ScrollView>

        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Pagar</Text>
            <View style={styles.checkoutButtonIcon}>
              <Ionicons name="arrow-forward" size={20} color="#0A0A0A" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueButton} onPress={onClose}>
            <Text style={styles.continueButtonText}>Seguir Comprando</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SCREEN_HEIGHT * 0.85, backgroundColor: COLORS.bgPrimary,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  scrollContent: { flex: 1 },
  storeCard: {
    flexDirection: 'row', backgroundColor: COLORS.bgSecondary,
    borderRadius: 16, padding: 16, margin: 20, borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.2)',
  },
  storeEmoji: { fontSize: 60, marginRight: 16 },
  storeInfo: { flex: 1, justifyContent: 'center' },
  storeName: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  storeCategory: { fontSize: 14, color: COLORS.accentGold },
  productsContainer: { paddingHorizontal: 20, marginBottom: 24 },
  productItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  productLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  productEmoji: { fontSize: 48, marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: COLORS.accentGold },
  quantityControls: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgTertiary,
    borderRadius: 12, paddingVertical: 6, paddingHorizontal: 8, gap: 12,
  },
  quantityButton: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: '#38383A',
    justifyContent: 'center', alignItems: 'center',
  },
  quantityText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, minWidth: 20, textAlign: 'center' },
  summaryContainer: {
    backgroundColor: COLORS.bgSecondary, borderRadius: 16,
    padding: 20, marginHorizontal: 20, marginBottom: 16,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 15, color: COLORS.textSecondary },
  summaryValue: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginVertical: 12 },
  totalLabel: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  totalValue: { fontSize: 20, fontWeight: '900', color: COLORS.accentGold },
  bottomButtons: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bgPrimary, paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkoutButton: {
    backgroundColor: COLORS.accentGold, borderRadius: 16, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: COLORS.accentGold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  checkoutButtonText: { fontSize: 18, fontWeight: '800', color: '#0A0A0A', marginRight: 12 },
  checkoutButtonIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(10, 10, 10, 0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  continueButton: {
    backgroundColor: 'transparent', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  continueButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
});

export default CartModal;
