import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Button from '../../components/common/Button';
import * as googleMapsService from '../../services/googleMapsService';
import { DELIVERY_CONFIG } from '../../constants/config';

export default function AddressScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [location, setLocation] = useState(null);
  
  const [zone, setZone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadAddresses();
    requestLocationPermission();
    startLocationTracking();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus === 'granted') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus === 'granted') {
          console.log('✅ Permisos de ubicación concedidos (foreground + background)');
        }
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        
        // Guardar ubicación en AsyncStorage para analytics
        await AsyncStorage.setItem('user_location', JSON.stringify({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          timestamp: new Date().toISOString()
        }));

        // Tracking en segundo plano cada 5 minutos
        await Location.startLocationUpdatesAsync('background-location-task', {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 300000, // 5 minutos
          distanceInterval: 100, // 100 metros
          foregroundService: {
            notificationTitle: 'La Cantina del Charro',
            notificationBody: 'Rastreando ubicación para mejor servicio',
          },
        });
      }
    } catch (error) {
      console.error('Error iniciando tracking:', error);
    }
  };

  const loadAddresses = async () => {
    const saved = await AsyncStorage.getItem('user_addresses');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAddresses(parsed);
      const defaultAddr = parsed.find(a => a.isDefault);
      if (defaultAddr) setSelectedId(defaultAddr.id);
    }
  };

  const getRandomDistance = (zoneName) => {
    return (Math.random() * 7 + 1).toFixed(1);
  };
  
  const validateAddressDistance = async (address) => {
    try {
      setValidating(true);
      const fullAddress = `${address.street} ${address.number}, ${address.zone}, La Paz, Bolivia`;
      
      try {
        const coords = await googleMapsService.geocodeAddress(fullAddress);
        const distanceData = await googleMapsService.calculateDistance(
          googleMapsService.STORE_LOCATION,
          coords
        );
        
        const MAX_DISTANCE = DELIVERY_CONFIG.MAX_DELIVERY_DISTANCE;
        
        if (distanceData.distanceKM > MAX_DISTANCE) {
          return new Promise((resolve) => {
            Alert.alert(
              'Dirección Fuera de Cobertura',
              `Tu dirección está a ${distanceData.distanceKM} km de nuestro local.\n\nNuestra cobertura máxima es de ${MAX_DISTANCE} km.\n\n¿Deseas agregar esta dirección de todas formas?`,
              [
                { text: 'No', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Sí, Agregar', onPress: () => resolve(true) }
              ]
            );
          });
        }
        
        address.distance = distanceData.distanceKM;
        address.distanceKM = distanceData.distanceKM;
        return true;
        
      } catch (geoError) {
        console.log('No se pudo validar distancia exacta:', geoError);
        return true;
      }
      
    } catch (error) {
      console.error('Error validando dirección:', error);
      return true;
    } finally {
      setValidating(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!zone || !street || !number || !phone) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const phoneRegex = /^[67]\d{7}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Teléfono inválido', 'Ingresa un número válido (ej: 70123456)');
      return;
    }

    const newAddress = {
      id: editingAddress?.id || Date.now().toString(),
      zone,
      street,
      number,
      phone,
      reference,
      distance: parseFloat(getRandomDistance(zone)),
      latitude: location?.latitude || null,
      longitude: location?.longitude || null,
      isDefault: addresses.length === 0
    };
    
    const isValid = await validateAddressDistance(newAddress);
    if (!isValid) return;

    let updated;
    if (editingAddress) {
      updated = addresses.map(a => a.id === editingAddress.id ? newAddress : a);
    } else {
      updated = [...addresses, newAddress];
    }

    await AsyncStorage.setItem('user_addresses', JSON.stringify(updated));
    setAddresses(updated);
    setModalVisible(false);
    resetForm();
  };

  const handleSelectAddress = async (id) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    await AsyncStorage.setItem('user_addresses', JSON.stringify(updated));
    await AsyncStorage.setItem('default_address', JSON.stringify(updated.find(a => a.id === id)));
    setAddresses(updated);
    setSelectedId(id);
    navigation.goBack();
  };

  const handleDeleteAddress = async (id) => {
    Alert.alert('Eliminar dirección', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const updated = addresses.filter(a => a.id !== id);
          await AsyncStorage.setItem('user_addresses', JSON.stringify(updated));
          setAddresses(updated);
        }
      }
    ]);
  };

  const openAddModal = () => {
    resetForm();
    setEditingAddress(null);
    setModalVisible(true);
  };

  const openEditModal = (address) => {
    setZone(address.zone);
    setStreet(address.street);
    setNumber(address.number);
    setPhone(address.phone || '');
    setReference(address.reference);
    setEditingAddress(address);
    setModalVisible(true);
  };

  const resetForm = () => {
    setZone('');
    setStreet('');
    setNumber('');
    setPhone('');
    setReference('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Direcciones</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Agregar nueva dirección</Text>
        </TouchableOpacity>

        {addresses.map((addr) => (
          <TouchableOpacity
            key={addr.id}
            style={[styles.addressCard, addr.isDefault && styles.addressCardSelected]}
            onPress={() => handleSelectAddress(addr.id)}
          >
            <View style={styles.addressHeader}>
              <View style={styles.radio}>
                {addr.isDefault && <View style={styles.radioInner} />}
              </View>
              <View style={styles.addressContent}>
                <Text style={styles.addressStreet}>{addr.street} {addr.number}</Text>
                <Text style={styles.addressZone}>{addr.zone}, La Paz</Text>
                {addr.reference && (
                  <Text style={styles.addressRef}>Ref: {addr.reference}</Text>
                )}
                <View style={styles.distanceRow}>
                  <Ionicons name="location" size={12} color={COLORS.accent.gold} />
                  <Text style={styles.addressDistance}>{addr.distance} km de la tienda</Text>
                  {addr.distanceKM && addr.distanceKM > 15 && (
                    <View style={styles.outOfRangeBadge}>
                      <Text style={styles.outOfRangeText}>Fuera de cobertura</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.addressActions}>
              <TouchableOpacity onPress={() => openEditModal(addr)}>
                <Text style={styles.actionButton}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)}>
                <Text style={[styles.actionButton, styles.deleteButton]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {editingAddress ? 'Editar dirección' : 'Nueva dirección'}
                </Text>

                <Text style={styles.label}>Zona *</Text>
                <TextInput
                  style={styles.input}
                  value={zone}
                  onChangeText={setZone}
                  placeholder="Ej: Sopocachi, Miraflores, Calacoto..."
                  placeholderTextColor={COLORS.text.tertiary}
                  returnKeyType="next"
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Calle/Avenida *</Text>
                <TextInput
                  style={styles.input}
                  value={street}
                  onChangeText={setStreet}
                  placeholder="Ej: Calle Fernando Guachalla"
                  placeholderTextColor={COLORS.text.tertiary}
                  returnKeyType="next"
                />

                <Text style={styles.label}>Número *</Text>
                <TextInput
                  style={styles.input}
                  value={number}
                  onChangeText={setNumber}
                  placeholder="Ej: 411 (Si no tienes, escribe 0)"
                  placeholderTextColor={COLORS.text.tertiary}
                  keyboardType="numeric"
                  returnKeyType="next"
                />

                <Text style={styles.label}>Teléfono (WhatsApp) *</Text>
                <View style={styles.phoneContainer}>
                  <Text style={styles.phonePrefix}>+591</Text>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="70123456"
                    placeholderTextColor={COLORS.text.tertiary}
                    keyboardType="phone-pad"
                    maxLength={8}
                    returnKeyType="next"
                  />
                </View>
                <Text style={styles.helperText}>
                  📞 Necesario para coordinar la entrega
                </Text>

                <Text style={styles.label}>Referencia (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={reference}
                  onChangeText={setReference}
                  placeholder="Ej: Edificio azul, portón café"
                  placeholderTextColor={COLORS.text.tertiary}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  multiline
                  numberOfLines={2}
                />

                {location && (
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationText}>
                      📍 Ubicación GPS guardada
                    </Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={() => {
                      setModalVisible(false);
                      resetForm();
                    }}
                    fullWidth
                  />
                  <View style={{ width: SPACING.md }} />
                  <Button
                    title={validating ? "Validando..." : "Guardar"}
                    onPress={handleSaveAddress}
                    disabled={validating}
                    fullWidth
                  />
                </View>

                <View style={{ height: 60 }} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  backButton: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.medium },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  scroll: { flex: 1, paddingHorizontal: SPACING.lg },
  addButton: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 2, borderColor: COLORS.accent.gold, borderStyle: 'dashed', marginBottom: SPACING.lg },
  addButtonText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'center' },
  addressCard: { backgroundColor: COLORS.bg.secondary, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 2, borderColor: 'transparent' },
  addressCardSelected: { borderColor: COLORS.accent.gold },
  addressHeader: { flexDirection: 'row', marginBottom: SPACING.md },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.text.tertiary, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent.gold },
  addressContent: { flex: 1 },
  addressStreet: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary },
  addressZone: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginTop: SPACING.xs },
  addressRef: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.tertiary, marginTop: SPACING.xs },
  addressDistance: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.accent.gold, marginLeft: SPACING.xs },
  distanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs },
  outOfRangeBadge: { backgroundColor: '#FF3B3020', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm, marginLeft: SPACING.sm },
  outOfRangeText: { fontSize: 10, color: '#FF3B30', fontWeight: TYPOGRAPHY.weights.semibold },
  addressActions: { flexDirection: 'row', gap: SPACING.lg },
  actionButton: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.medium },
  deleteButton: { color: COLORS.error },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  keyboardView: { flex: 1, justifyContent: 'flex-end' },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.bg.secondary, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.xl, maxHeight: '90%' },
  modalTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.lg },
  label: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: { backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary },
  textArea: { height: 60, textAlignVertical: 'top' },
  zoneScroll: { marginBottom: SPACING.sm },
  zoneButtons: { flexDirection: 'row', gap: SPACING.sm },
  zoneButton: { backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 2, borderColor: 'transparent' },
  zoneButtonSelected: { borderColor: COLORS.accent.gold, backgroundColor: COLORS.accent.gold + '20' },
  zoneButtonDisabled: { opacity: 0.5 },
  zoneButtonText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  zoneButtonTextSelected: { color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.semibold },
  zoneBadge: { fontSize: 9, color: COLORS.text.tertiary, marginTop: 2 },
  phoneContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  phonePrefix: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, fontWeight: TYPOGRAPHY.weights.semibold, backgroundColor: COLORS.bg.tertiary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md },
  phoneInput: { flex: 1 },
  helperText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.tertiary, marginTop: SPACING.xs },
  locationInfo: { backgroundColor: COLORS.success + '20', padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.md, alignItems: 'center' },
  locationText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.success, fontWeight: TYPOGRAPHY.weights.semibold },
  modalButtons: { flexDirection: 'row', marginTop: SPACING.xl },
});
