import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { addAddress, updateAddress } from '../../services/addressService';

const ADDRESS_TYPES = [
  { id: 'home', label: 'Casa', icon: 'home' },
  { id: 'work', label: 'Trabajo', icon: 'briefcase' },
  { id: 'other', label: 'Otro', icon: 'location' },
];

export default function AddEditAddressScreen({ route, navigation }) {
  const editAddress = route.params?.address;
  const isEditing = !!editAddress;

  const [label, setLabel] = useState(editAddress?.label || '');
  const [type, setType] = useState(editAddress?.type || 'home');
  const [street, setStreet] = useState(editAddress?.street || '');
  const [zone, setZone] = useState(editAddress?.zone || '');
  const [city, setCity] = useState(editAddress?.city || 'La Paz');
  const [reference, setReference] = useState(editAddress?.reference || '');
  const [isDefault, setIsDefault] = useState(editAddress?.isDefault || false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!street.trim()) {
      Alert.alert('Error', 'Por favor ingresa la calle');
      return;
    }
    if (!zone.trim()) {
      Alert.alert('Error', 'Por favor ingresa la zona');
      return;
    }

    setLoading(true);

    const addressData = {
      label: label.trim() || ADDRESS_TYPES.find(t => t.id === type).label,
      type,
      street: street.trim(),
      zone: zone.trim(),
      city: city.trim(),
      reference: reference.trim(),
      isDefault,
    };

    let result;
    if (isEditing) {
      result = await updateAddress(editAddress.id, addressData);
    } else {
      result = await addAddress(addressData);
    }

    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', isEditing ? 'Dirección actualizada' : 'Dirección agregada', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', 'No se pudo guardar la dirección');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Dirección' : 'Nueva Dirección'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Tipo de dirección</Text>
            <View style={styles.typeSelector}>
              {ADDRESS_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.typeButton, type === item.id && styles.typeButtonActive]}
                  onPress={() => setType(item.id)}
                >
                  <Ionicons name={item.icon} size={24} color={type === item.id ? COLORS.accent.gold : COLORS.text.secondary} />
                  <Text style={[styles.typeLabel, type === item.id && styles.typeLabelActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.form}>
            <Input label="Etiqueta (opcional)" value={label} onChangeText={setLabel} placeholder="Ej: Casa de mamá, Oficina principal" />
            <Input label="Calle y número *" value={street} onChangeText={setStreet} placeholder="Ej: Av. 6 de Agosto #1234" />
            <Input label="Zona *" value={zone} onChangeText={setZone} placeholder="Ej: San Miguel, Sopocachi" />
            <Input label="Ciudad" value={city} onChangeText={setCity} placeholder="La Paz" />
            <Input label="Referencia (opcional)" value={reference} onChangeText={setReference} placeholder="Ej: Edificio azul, frente al parque" multiline numberOfLines={3} />

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Dirección principal</Text>
                <Text style={styles.switchDescription}>Usar esta dirección por defecto</Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: COLORS.background.tertiary, true: COLORS.accent.gold + '60' }}
                thumbColor={isDefault ? COLORS.accent.gold : COLORS.text.tertiary}
              />
            </View>
          </View>

          <Button title={isEditing ? 'Guardar Cambios' : 'Agregar Dirección'} variant="primary" onPress={handleSave} loading={loading} style={styles.saveButton} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.background.tertiary },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  placeholder: { width: 40 },
  content: { padding: SPACING.md },
  section: { marginBottom: SPACING.lg },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text.secondary, marginBottom: SPACING.sm },
  typeSelector: { flexDirection: 'row', gap: SPACING.md },
  typeButton: { flex: 1, alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.background.secondary, borderRadius: 12, borderWidth: 2, borderColor: COLORS.background.tertiary },
  typeButtonActive: { borderColor: COLORS.accent.gold, backgroundColor: COLORS.accent.gold + '10' },
  typeLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary, marginTop: SPACING.xs },
  typeLabelActive: { color: COLORS.accent.gold },
  form: { gap: SPACING.md, marginBottom: SPACING.xl },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.background.secondary, padding: SPACING.md, borderRadius: 12 },
  switchLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary, marginBottom: SPACING.xs },
  switchDescription: { fontSize: 13, color: COLORS.text.tertiary },
  saveButton: { marginBottom: SPACING.xl },
});
