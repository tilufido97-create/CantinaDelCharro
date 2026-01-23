import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminLayout from '../components/AdminLayout';
import VehicleComparisonCard from '../components/VehicleComparisonCard';
import TooltipButton from '../components/TooltipButton';
import TooltipIcon from '../components/TooltipIcon';
import { getCurrentAdmin } from '../utils/adminAuth';
import * as deliveryOptimizationService from '../../services/deliveryOptimizationService';
import { isGoogleMapsConfigured } from '../../constants/config';

const DeliveryCalculatorScreen = () => {
  const [user, setUser] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [recentCalculations, setRecentCalculations] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      const admin = await getCurrentAdmin();
      setUser(admin);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadAvailability();
      loadRecentCalculations();
    }
  }, [user]);

  const loadAvailability = async () => {
    const status = await deliveryOptimizationService.validateDeliveryAvailability();
    setAvailabilityStatus(status);
  };

  const loadRecentCalculations = async () => {
    try {
      const data = await AsyncStorage.getItem('recent_delivery_calculations');
      if (data) {
        setRecentCalculations(JSON.parse(data).slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading recent calculations:', error);
    }
  };

  const handleCalculate = async () => {
    if (!destinationAddress.trim()) {
      Alert.alert('Error', 'Ingresa una dirección de entrega');
      return;
    }

    if (!isGoogleMapsConfigured()) {
      Alert.alert(
        'Google Maps no configurado',
        'La API key de Google Maps no está configurada. Se usará cálculo estimado.',
        [{ text: 'Continuar', onPress: () => performCalculation() }]
      );
      return;
    }

    performCalculation();
  };

  const performCalculation = async () => {
    setIsCalculating(true);
    try {
      const result = await deliveryOptimizationService.calculateOptimalDelivery(
        destinationAddress
      );
      
      setCalculationResult(result);
      
      const recent = [
        { address: destinationAddress, date: new Date().toISOString() },
        ...recentCalculations.filter(r => r.address !== destinationAddress)
      ].slice(0, 5);
      
      setRecentCalculations(recent);
      await AsyncStorage.setItem('recent_delivery_calculations', JSON.stringify(recent));
      
    } catch (error) {
      console.error('Error calculating delivery:', error);
      Alert.alert(
        'Error',
        error.message === 'NO_VEHICLES_AVAILABLE'
          ? 'No hay vehículos disponibles'
          : 'No se pudo calcular el delivery. Verifica la dirección.'
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClearResult = () => {
    setCalculationResult(null);
    setDestinationAddress('');
  };

  if (!user) return null;

  return (
    <AdminLayout title="Calculadora de Delivery" user={user}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Calculadora de Delivery</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>Simula cálculos con Google Maps</Text>
            <TooltipIcon 
              tooltip="Calcula precios reales usando distancias de Google Maps"
              size={16}
            />
          </View>
        </View>
      </View>

      {availabilityStatus && (
        <View style={[
          styles.availabilityBanner,
          { backgroundColor: availabilityStatus.available ? '#34C75920' : '#FF3B3020' }
        ]}>
          <Ionicons 
            name={availabilityStatus.available ? 'checkmark-circle' : 'warning'} 
            size={20} 
            color={availabilityStatus.available ? '#34C759' : '#FF3B30'} 
          />
          <Text style={[
            styles.availabilityText,
            { color: availabilityStatus.available ? '#34C759' : '#FF3B30' }
          ]}>
            {availabilityStatus.message}
          </Text>
        </View>
      )}

      <ScrollView>
        {!calculationResult ? (
          <>
            <View style={styles.inputCard}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Dirección de Entrega *</Text>
                <TooltipIcon 
                  tooltip="Dirección completa del cliente. Ejemplo: Av. Arce 2450, Sopocachi, La Paz"
                  size={14}
                />
              </View>
              
              <TextInput
                style={styles.input}
                value={destinationAddress}
                onChangeText={setDestinationAddress}
                placeholder="Ej: Calle 21 de Calacoto #456, entre Av. Ballivian y..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
              />

              <TooltipButton
                icon="calculator"
                label={isCalculating ? "Calculando..." : "Calcular Delivery"}
                tooltip="Calcular precio y seleccionar vehículo óptimo"
                onPress={handleCalculate}
                variant="primary"
                size="large"
                disabled={!destinationAddress.trim() || isCalculating || !availabilityStatus?.available}
              />
            </View>

            {recentCalculations.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Direcciones Recientes</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {recentCalculations.map((calc, index) => (
                    <TooltipButton
                      key={index}
                      label={calc.address.substring(0, 30) + '...'}
                      tooltip="Usar esta dirección"
                      onPress={() => {
                        setDestinationAddress(calc.address);
                        handleCalculate();
                      }}
                      variant="secondary"
                      size="small"
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {isCalculating && (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#FFB800" />
                <Text style={styles.loadingText}>Calculando con Google Maps...</Text>
                <Text style={styles.loadingSubtext}>
                  Obteniendo distancia real y seleccionando vehículo óptimo
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>✅ Cálculo Completado</Text>
              <TooltipButton
                icon="refresh"
                label="Nuevo Cálculo"
                tooltip="Limpiar y calcular otra dirección"
                onPress={handleClearResult}
                variant="secondary"
                size="medium"
              />
            </View>

            <View style={styles.distanceCard}>
              <View style={styles.distanceRow}>
                <View style={styles.distanceItem}>
                  <Ionicons name="map" size={24} color="#FFB800" />
                  <Text style={styles.distanceValue}>{calculationResult.distance.km} km</Text>
                  <Text style={styles.distanceLabel}>Distancia</Text>
                </View>
                
                <View style={styles.distanceItem}>
                  <Ionicons name="time" size={24} color="#007AFF" />
                  <Text style={styles.distanceValue}>{calculationResult.duration.minutes} min</Text>
                  <Text style={styles.distanceLabel}>Tiempo</Text>
                </View>
                
                <View style={styles.distanceItem}>
                  <Ionicons name="flag" size={24} color="#34C759" />
                  <Text style={styles.distanceValue}>{calculationResult.categoryText}</Text>
                  <Text style={styles.distanceLabel}>Categoría</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Vehículo Seleccionado</Text>
            <VehicleComparisonCard
              vehicle={calculationResult.vehicle}
              pricing={calculationResult.pricing}
              isRecommended={true}
            />

            {calculationResult.alternatives && calculationResult.alternatives.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Otras Opciones</Text>
                {calculationResult.alternatives.map((alt, index) => (
                  <VehicleComparisonCard
                    key={index}
                    vehicle={alt.vehicle}
                    pricing={alt.pricing}
                    isRecommended={false}
                  />
                ))}
              </>
            )}

            <View style={styles.locationCard}>
              <Text style={styles.locationTitle}>📍 Ubicaciones</Text>
              <Text style={styles.locationText}>
                Origen: {calculationResult.origin.address}
              </Text>
              <Text style={styles.locationText}>
                Destino: {calculationResult.destination.formattedAddress}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93'
  },
  availabilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24
  },
  availabilityText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600'
  },
  inputCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  recentSection: {
    marginBottom: 16
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12
  },
  loadingCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center'
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759'
  },
  distanceCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  distanceItem: {
    alignItems: 'center',
    gap: 8
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  distanceLabel: {
    fontSize: 12,
    color: '#8E8E93'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16
  },
  locationCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginTop: 16
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12
  },
  locationText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8
  }
});

export default DeliveryCalculatorScreen;
