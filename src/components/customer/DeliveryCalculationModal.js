import React from 'react';
import { 
  Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

const DeliveryCalculationModal = ({ visible, calculation, onClose }) => {
  
  if (!calculation || !calculation.pricing) {
    return null;
  }
  
  const { pricing, distance, duration, vehicle } = calculation;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={[COLORS.accent.gold, '#FF9500']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Ionicons name="calculator" size={28} color="#000000" />
              <Text style={styles.headerTitle}>¿Cómo Calculamos?</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </LinearGradient>
          
          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* Sección 1: Proceso */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Nuestro Proceso</Text>
              <Text style={styles.text}>
                Usamos <Text style={styles.highlight}>Google Maps</Text> para calcular la distancia real desde nuestro local hasta tu dirección, considerando las rutas y el tráfico de La Paz.
              </Text>
              
              <View style={styles.processSteps}>
                <ProcessStep 
                  number="1" 
                  title="Calculamos distancia real"
                  description="Con Google Maps API"
                />
                <ProcessStep 
                  number="2" 
                  title="Seleccionamos el mejor vehículo"
                  description="Según distancia y eficiencia"
                />
                <ProcessStep 
                  number="3" 
                  title="Calculamos costos reales"
                  description="Combustible, mantenimiento, etc"
                />
                <ProcessStep 
                  number="4" 
                  title="Aplicamos precio justo"
                  description="Cubriendo costos y pagando bien"
                />
              </View>
            </View>
            
            {/* Sección 2: Tu Delivery */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚗 Tu Delivery</Text>
              
              <View style={styles.infoCard}>
                <InfoRow 
                  icon="navigate" 
                  label="Distancia" 
                  value={distance.text}
                />
                <InfoRow 
                  icon="time" 
                  label="Tiempo estimado" 
                  value={duration.text}
                />
                {vehicle && (
                  <InfoRow 
                    icon="car-sport" 
                    label="Vehículo asignado" 
                    value={`${vehicle.marca} ${vehicle.modelo}`}
                  />
                )}
              </View>
            </View>
            
            {/* Sección 3: Desglose de Precio */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Desglose del Precio</Text>
              
              <View style={styles.priceCard}>
                <Text style={styles.totalPrice}>
                  Bs {pricing.clientPrice.toFixed(2)}
                </Text>
                <Text style={styles.totalLabel}>Precio Total del Delivery</Text>
                
                <View style={styles.divider} />
                
                <Text style={styles.breakdownTitle}>Este precio incluye:</Text>
                
                <BreakdownItem
                  label="Costo Operativo"
                  description="Combustible, mantenimiento, depreciación"
                  amount={pricing.operatingCost}
                  percentage={pricing.distribution.operatingPercent}
                  color="#FF3B30"
                />
                
                <BreakdownItem
                  label="Pago al Delivery"
                  description="Salario justo para nuestro repartidor"
                  amount={pricing.distribution.deliveryPay}
                  percentage={pricing.distribution.deliveryPercent}
                  color="#007AFF"
                />
                
                <BreakdownItem
                  label="Ganancia del Negocio"
                  description="Para mantener el servicio operando"
                  amount={pricing.distribution.businessProfit}
                  percentage={pricing.distribution.businessPercent}
                  color="#34C759"
                />
              </View>
            </View>
            
            {/* Sección 4: Por qué esto es justo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✨ Transparencia Total</Text>
              <Text style={styles.text}>
                Creemos en ser <Text style={styles.highlight}>100% transparentes</Text>. 
                Por eso te mostramos exactamente cómo calculamos el precio y hacia dónde va cada boliviano.
              </Text>
              
              <View style={styles.benefitsList}>
                <BenefitItem 
                  icon="checkmark-circle"
                  text="Precio justo basado en distancia real"
                />
                <BenefitItem 
                  icon="checkmark-circle"
                  text="Repartidores bien pagados"
                />
                <BenefitItem 
                  icon="checkmark-circle"
                  text="Vehículo óptimo para tu pedido"
                />
                <BenefitItem 
                  icon="checkmark-circle"
                  text="Sin cargos ocultos"
                />
              </View>
            </View>
            
            {/* Nota final */}
            <View style={styles.finalNote}>
              <Ionicons name="information-circle" size={20} color={COLORS.accent.gold} />
              <Text style={styles.finalNoteText}>
                Si tienes alguna duda sobre el cálculo, no dudes en contactarnos. 
                ¡Estamos aquí para ayudarte! 🌮
              </Text>
            </View>
            
          </ScrollView>
          
          {/* Footer Button */}
          <TouchableOpacity style={styles.footerButton} onPress={onClose}>
            <Text style={styles.footerButtonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Componentes auxiliares
const ProcessStep = ({ number, title, description }) => (
  <View style={styles.processStep}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  </View>
);

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoRowLeft}>
      <Ionicons name={icon} size={18} color={COLORS.accent.gold} />
      <Text style={styles.infoRowLabel}>{label}</Text>
    </View>
    <Text style={styles.infoRowValue}>{value}</Text>
  </View>
);

const BreakdownItem = ({ label, description, amount, percentage, color }) => (
  <View style={styles.breakdownItem}>
    <View style={styles.breakdownHeader}>
      <View style={styles.breakdownLeft}>
        <View style={[styles.colorDot, { backgroundColor: color }]} />
        <Text style={styles.breakdownLabel}>{label}</Text>
      </View>
      <Text style={styles.breakdownAmount}>Bs {amount.toFixed(2)}</Text>
    </View>
    <Text style={styles.breakdownDescription}>{description}</Text>
    <View style={styles.percentageBar}>
      <View style={[styles.percentageFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.percentageText}>{percentage}% del total</Text>
  </View>
);

const BenefitItem = ({ icon, text }) => (
  <View style={styles.benefitItem}>
    <Ionicons name={icon} size={20} color="#34C759" />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 24
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#000000'
  },
  closeButton: {
    padding: SPACING.xs
  },
  content: {
    flex: 1,
    padding: SPACING.lg
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20
  },
  highlight: {
    color: COLORS.accent.gold,
    fontWeight: TYPOGRAPHY.weights.semibold
  },
  processSteps: {
    marginTop: SPACING.lg,
    gap: SPACING.md
  },
  processStep: {
    flexDirection: 'row',
    gap: SPACING.md
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent.gold,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumberText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#000000'
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary
  },
  infoCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.md
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  infoRowLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  infoRowValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary
  },
  priceCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg
  },
  totalPrice: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent.gold,
    textAlign: 'center'
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: SPACING.lg
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.bg.tertiary,
    marginVertical: SPACING.lg
  },
  breakdownTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md
  },
  breakdownItem: {
    marginBottom: SPACING.lg
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary
  },
  breakdownAmount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary
  },
  breakdownDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.lg
  },
  percentageBar: {
    height: 6,
    backgroundColor: COLORS.bg.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs
  },
  percentageFill: {
    height: '100%',
    borderRadius: 3
  },
  percentageText: {
    fontSize: 11,
    color: COLORS.text.tertiary,
    paddingLeft: SPACING.lg
  },
  benefitsList: {
    marginTop: SPACING.md,
    gap: SPACING.md
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  benefitText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary
  },
  finalNote: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.bg.secondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg
  },
  finalNoteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18
  },
  footerButton: {
    backgroundColor: COLORS.accent.gold,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center'
  },
  footerButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#000000'
  }
});

export default DeliveryCalculationModal;
