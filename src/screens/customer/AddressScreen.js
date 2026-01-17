import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { SUPPORTED_ZONES } from '../../constants/mockData';
import Button from '../../components/common/Button';

export default function AddressScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [zone, setZone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

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
    const zoneData = SUPPORTED_ZONES.find(z => z.name === zoneName);
    if (!zoneData) return 2.0;
    return (Math.random() * (zoneData.maxDistance - zoneData.minDistance) + zoneData.minDistance).toFixed(1);
  };

  const handleSaveAddress = async () => {
    if (!zone || !street) {
      Alert.alert('Campos requeridos', 'Por favor completa zona y calle');
      return;
    }

    const newAddress = {
      id: editingAddress?.id || Date.now().toString(),
      zone,
      street,
      number,
      reference,
      distance: parseFloat(getRandomDistance(zone)),
      isDefault: addresses.length === 0
    };

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
    setReference(address.reference);
    setEditingAddress(address);
    setModalVisible(true);
  };

  const resetForm = () => {
    setZone('');
    setStreet('');
    setNumber('');
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

      <ScrollView style={styles.scroll}>
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
                <Text style={styles.addressDistance}>{addr.distance} km de la tienda</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingAddress ? 'Editar dirección' : 'Nueva dirección'}
            </Text>

            <Text style={styles.label}>Zona *</Text>
            <View style={styles.zoneButtons}>
              {SUPPORTED_ZONES.map((z) => (
                <TouchableOpacity
                  key={z.id}
                  style={[styles.zoneButton, zone === z.name && styles.zoneButtonSelected]}
                  onPress={() => setZone(z.name)}
                >
                  <Text style={[styles.zoneButtonText, zone === z.name && styles.zoneButtonTextSelected]}>
                    {z.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Calle/Avenida *</Text>
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="Ej: Calle Fernando Guachalla"
              placeholderTextColor={COLORS.text.tertiary}
            />

            <Text style={styles.label}>Número</Text>
            <TextInput
              style={styles.input}
              value={number}
              onChangeText={setNumber}
              placeholder="Ej: 411"
              placeholderTextColor={COLORS.text.tertiary}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Referencia (opcional)</Text>
            <TextInput
              style={styles.input}
              value={reference}
              onChangeText={setReference}
              placeholder="Ej: Edificio azul, portón café"
              placeholderTextColor={COLORS.text.tertiary}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setModalVisible(false)}
                fullWidth
              />
              <View style={{ width: SPACING.md }} />
              <Button
                title="Guardar"
                onPress={handleSaveAddress}
                fullWidth
              />
            </View>
          </View>
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
  addressDistance: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.accent.gold, marginTop: SPACING.xs },
  addressActions: { flexDirection: 'row', gap: SPACING.lg },
  actionButton: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.medium },
  deleteButton: { color: COLORS.error },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.bg.secondary, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.xl },
  modalTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, marginBottom: SPACING.lg },
  label: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: { backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary },
  zoneButtons: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  zoneButton: { backgroundColor: COLORS.bg.tertiary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 2, borderColor: 'transparent' },
  zoneButtonSelected: { borderColor: COLORS.accent.gold, backgroundColor: COLORS.accent.gold + '20' },
  zoneButtonText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  zoneButtonTextSelected: { color: COLORS.accent.gold, fontWeight: TYPOGRAPHY.weights.semibold },
  modalButtons: { flexDirection: 'row', marginTop: SPACING.xl },
});
