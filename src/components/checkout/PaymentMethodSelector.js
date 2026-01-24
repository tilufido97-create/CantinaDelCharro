import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

const PAYMENT_METHODS = [
  { 
    id: 'cash', 
    name: 'Efectivo', 
    icon: 'cash-outline',
    description: 'Paga al recibir tu pedido'
  },
  { 
    id: 'qr', 
    name: 'QR Banco', 
    icon: 'qr-code-outline',
    description: 'Escanea y paga ahora'
  },
];

export default function PaymentMethodSelector({ selected, onSelect, total }) {
  const [showQR, setShowQR] = useState(false);

  const handleSelectQR = () => {
    onSelect('qr');
    setShowQR(true);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>💳 Método de pago</Text>
        {PAYMENT_METHODS.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selected === method.id && styles.methodCardActive
            ]}
            onPress={() => method.id === 'qr' ? handleSelectQR() : onSelect(method.id)}
          >
            <View style={styles.methodLeft}>
              <View style={[
                styles.iconCircle,
                selected === method.id && styles.iconCircleActive
              ]}>
                <Ionicons 
                  name={method.icon} 
                  size={24} 
                  color={selected === method.id ? COLORS.accent.gold : COLORS.text.tertiary} 
                />
              </View>
              <View>
                <Text style={[
                  styles.methodName,
                  selected === method.id && styles.methodNameActive
                ]}>
                  {method.name}
                </Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
            </View>
            {selected === method.id && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.accent.gold} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal QR */}
      <Modal
        visible={showQR}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQR(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pagar con QR</Text>
              <TouchableOpacity onPress={() => setShowQR(false)}>
                <Ionicons name="close" size={28} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code" size={200} color={COLORS.text.tertiary} />
              </View>
              <Text style={styles.qrInstructions}>
                Escanea este código QR con tu app bancaria
              </Text>
              <Text style={styles.qrAmount}>
                Monto a pagar: Bs {total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.qrInfo}>
              <Ionicons name="information-circle" size={20} color={COLORS.accent.gold} />
              <Text style={styles.qrInfoText}>
                Una vez realizado el pago, presiona "Confirmar Pedido"
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowQR(false)}
            >
              <Text style={styles.closeButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.bg.tertiary,
  },
  methodCardActive: {
    borderColor: COLORS.accent.gold,
    backgroundColor: COLORS.accent.gold + '10',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleActive: {
    backgroundColor: COLORS.accent.gold + '20',
  },
  methodName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  methodNameActive: {
    color: COLORS.accent.gold,
  },
  methodDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  qrPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  qrInstructions: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  qrAmount: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
  },
  qrInfo: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent.gold + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  qrInfoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  closeButton: {
    backgroundColor: COLORS.accent.gold,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.bg.primary,
  },
});
