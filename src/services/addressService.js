import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadAddresses = async () => {
  try {
    const data = await AsyncStorage.getItem('user_addresses');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error cargando direcciones:', error);
    return [];
  }
};

export const saveAddresses = async (addresses) => {
  try {
    await AsyncStorage.setItem('user_addresses', JSON.stringify(addresses));
    return { success: true };
  } catch (error) {
    console.error('Error guardando direcciones:', error);
    return { success: false, error };
  }
};

export const addAddress = async (address) => {
  try {
    const addresses = await loadAddresses();
    
    if (addresses.length === 0 || address.isDefault) {
      addresses.forEach(a => a.isDefault = false);
    }

    const newAddress = {
      id: `addr_${Date.now()}`,
      ...address,
      createdAt: Date.now(),
    };

    addresses.push(newAddress);
    await saveAddresses(addresses);
    return { success: true, address: newAddress };
  } catch (error) {
    console.error('Error agregando dirección:', error);
    return { success: false, error };
  }
};

export const updateAddress = async (addressId, updates) => {
  try {
    const addresses = await loadAddresses();
    const index = addresses.findIndex(a => a.id === addressId);
    
    if (index === -1) {
      return { success: false, error: 'Dirección no encontrada' };
    }

    if (updates.isDefault) {
      addresses.forEach(a => a.isDefault = false);
    }

    addresses[index] = { ...addresses[index], ...updates };
    await saveAddresses(addresses);
    return { success: true };
  } catch (error) {
    console.error('Error actualizando dirección:', error);
    return { success: false, error };
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const addresses = await loadAddresses();
    const filtered = addresses.filter(a => a.id !== addressId);
    
    const wasDefault = addresses.find(a => a.id === addressId)?.isDefault;
    if (wasDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }

    await saveAddresses(filtered);
    return { success: true };
  } catch (error) {
    console.error('Error eliminando dirección:', error);
    return { success: false, error };
  }
};

export const getDefaultAddress = async () => {
  try {
    const addresses = await loadAddresses();
    return addresses.find(a => a.isDefault) || addresses[0] || null;
  } catch (error) {
    console.error('Error obteniendo dirección default:', error);
    return null;
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const addresses = await loadAddresses();
    addresses.forEach(a => {
      a.isDefault = a.id === addressId;
    });
    await saveAddresses(addresses);
    return { success: true };
  } catch (error) {
    console.error('Error estableciendo dirección default:', error);
    return { success: false, error };
  }
};
