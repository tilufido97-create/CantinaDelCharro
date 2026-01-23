import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminLayout from '../components/AdminLayout';
import TooltipButton from '../components/TooltipButton';
import TooltipIcon from '../components/TooltipIcon';
import { getCurrentAdmin } from '../utils/adminAuth';
import { DEFAULT_OPERATING_COSTS, calculateDeliveryPrice } from '../utils/fleetCalculator';

const OperatingCostsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [costs, setCosts] = useState(DEFAULT_OPERATING_COSTS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadCosts = async () => {
      const data = await AsyncStorage.getItem('operating_costs');
      setCosts(data ? JSON.parse(data) : DEFAULT_OPERATING_COSTS);
    };
    if (user) loadCosts();
  }, [user]);

  const handleUpdateCost = (category, subcategory, value) => {
    const numValue = parseFloat(value) || 0;
    setCosts(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: numValue
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    Alert.alert(
      'Guardar Cambios',
      '¿Recalcular costos de todos los vehículos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: async () => {
            await AsyncStorage.setItem('operating_costs', JSON.stringify(costs));
            setHasChanges(false);
            Alert.alert('Éxito', 'Costos actualizados correctamente');
          }
        }
      ]
    );
  };

  const exampleVehicle = {
    tipo: 'moto',
    rendimientoKmLitro: 35,
    tipoCombustible: 'gasolinaEspecial',
    velocidadPromedioKmH: 40
  };

  const exampleCalc = calculateDeliveryPrice(5, exampleVehicle, costs);

  if (!user) return null;

  return (
    <AdminLayout title="Costos Operativos" user={user}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Costos Operativos</Text>
          <Text style={styles.subtitle}>Configura precios y costos variables</Text>
        </View>
        <TooltipButton
          icon="checkmark-circle"
          label="Guardar Cambios"
          tooltip="Guardar configuración y recalcular costos de vehículos"
          onPress={handleSave}
          variant="success"
          size="large"
          disabled={!hasChanges}
        />
      </View>

      {hasChanges && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="#FF9500" />
          <Text style={styles.warningText}>
            Tienes cambios sin guardar. Recuerda guardar para aplicarlos.
          </Text>
        </View>
      )}

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⛽ Precios de Combustibles</Text>
          
          <CostInput
            label="Gasolina Especial (93 octanos)"
            value={costs.combustibles.gasolinaEspecial}
            onChangeText={(val) => handleUpdateCost('combustibles', 'gasolinaEspecial', val)}
            unit="Bs/litro"
            tooltip="Precio actual por litro en Bolivia"
          />
          
          <CostInput
            label="Gasolina Premium (95 octanos)"
            value={costs.combustibles.gasolinaPremium}
            onChangeText={(val) => handleUpdateCost('combustibles', 'gasolinaPremium', val)}
            unit="Bs/litro"
          />
          
          <CostInput
            label="Diesel"
            value={costs.combustibles.diesel}
            onChangeText={(val) => handleUpdateCost('combustibles', 'diesel', val)}
            unit="Bs/litro"
          />
          
          <CostInput
            label="GNV (Gas Natural)"
            value={costs.combustibles.gnv}
            onChangeText={(val) => handleUpdateCost('combustibles', 'gnv', val)}
            unit="Bs/litro"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛢️ Lubricantes y Fluidos</Text>
          
          <CostInput
            label="Aceite de Motor"
            value={costs.lubricantes.aceiteMotor}
            onChangeText={(val) => handleUpdateCost('lubricantes', 'aceiteMotor', val)}
            unit="Bs/litro"
          />
          
          <CostInput
            label="Frecuencia Cambio Aceite"
            value={costs.lubricantes.cambioAceiteKM}
            onChangeText={(val) => handleUpdateCost('lubricantes', 'cambioAceiteKM', val)}
            unit="KM"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Salarios de Deliverys</Text>
          
          <CostInput
            label="Comisión Fija por Pedido"
            value={costs.salarios.comisionPorPedido}
            onChangeText={(val) => handleUpdateCost('salarios', 'comisionPorPedido', val)}
            unit="Bs"
          />
          
          <CostInput
            label="Comisión Porcentual"
            value={costs.salarios.comisionPorcentaje}
            onChangeText={(val) => handleUpdateCost('salarios', 'comisionPorcentaje', val)}
            unit="%"
          />
        </View>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>EJEMPLO DE CÁLCULO</Text>
          <Text style={styles.exampleSubtitle}>Vehículo: Moto (35 km/L) • Distancia: 5 km</Text>
          
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Costo operativo:</Text>
            <Text style={styles.exampleValue}>Bs {exampleCalc.operatingCost.toFixed(2)}</Text>
          </View>
          
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Precio al cliente:</Text>
            <Text style={[styles.exampleValue, { color: '#FFB800' }]}>
              Bs {exampleCalc.clientPrice.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>• Delivery:</Text>
            <Text style={styles.exampleValue}>
              Bs {exampleCalc.distribution.deliveryPay.toFixed(2)} ({exampleCalc.distribution.deliveryPercent}%)
            </Text>
          </View>
          
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>• Negocio:</Text>
            <Text style={styles.exampleValue}>
              Bs {exampleCalc.distribution.businessProfit.toFixed(2)} ({exampleCalc.distribution.businessPercent}%)
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.exampleRow}>
            <Text style={[styles.exampleLabel, { fontWeight: '700' }]}>✅ Margen ganancia:</Text>
            <Text style={[styles.exampleValue, { color: '#34C759', fontWeight: '700' }]}>
              {exampleCalc.profitMargin.toFixed(1)}%
            </Text>
          </View>
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const CostInput = ({ label, value, onChangeText, unit, tooltip }) => (
  <View style={styles.inputRow}>
    <View style={styles.inputLabel}>
      <Text style={styles.labelText}>{label}</Text>
      {tooltip && <TooltipIcon tooltip={tooltip} size={14} />}
    </View>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={value.toString()}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholderTextColor="#8E8E93"
      />
      <Text style={styles.unit}>{unit}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93'
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FF950020',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  inputLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  labelText: {
    fontSize: 14,
    color: '#FFFFFF'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 140
  },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14
  },
  unit: {
    fontSize: 12,
    color: '#8E8E93'
  },
  exampleCard: {
    backgroundColor: '#FFB80010',
    borderWidth: 2,
    borderColor: '#FFB800',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFB800',
    marginBottom: 8
  },
  exampleSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  exampleLabel: {
    fontSize: 14,
    color: '#FFFFFF'
  },
  exampleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  divider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 12
  }
});

export default OperatingCostsScreen;
