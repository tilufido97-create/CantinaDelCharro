import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import AddressCard from '../../components/address/AddressCard';
import Button from '../../components/common/Button';
import { loadAddresses, deleteAddress, setDefaultAddress } from '../../services/addressService';

export default function AddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const data = await loadAddresses();
    setAddresses(data);
  };

  const handleDelete = (addressId) => {
    Alert.alert('Eliminar dirección', '¿Estás seguro que deseas eliminar esta dirección?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteAddress(addressId);
          loadData();
        },
      },
    ]);
  };

  const handleSetDefault = async (addressId) => {
    await setDefaultAddress(addressId);
    loadData();
  };

  const handleEdit = (address) => {
    navigation.navigate('AddEditAddress', { address });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Direcciones</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddEditAddress')} style={styles.addButton}>
          <Ionicons name="add" size={24} color={COLORS.accent.gold} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onPress={() => {}}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyText}>No tienes direcciones guardadas</Text>
            <Text style={styles.emptySubtext}>Agrega una dirección para entregas más rápidas</Text>
            <Button
              title="Agregar Dirección"
              variant="primary"
              onPress={() => navigation.navigate('AddEditAddress')}
              style={styles.addFirstButton}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.tertiary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  addFirstButton: {
    minWidth: 200,
  },
});
