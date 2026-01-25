import { ref, set, get, update } from 'firebase/database';
import { database } from '../config/firebase';

// ============================================
// USUARIOS
// ============================================

export const saveUserToDatabase = async (userId, userData) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    
    const userToSave = {
      uid: userId,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      avatar: userData.avatar || '💀',
      provider: userData.provider || 'phone',
      profileCompleted: userData.profileCompleted || false,
      ageVerified: userData.ageVerified || false,
      role: 'customer',
      status: 'active',
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Datos para pedidos
      addresses: [],
      orders: [],
      favorites: [],
      cart: [],
      // Gamificación
      points: 0,
      level: 1,
      badges: [],
    };

    await set(userRef, userToSave);
    console.log('✅ Usuario guardado en Firebase:', userId);
    return { success: true, user: userToSave };
  } catch (error) {
    console.error('❌ Error guardando usuario en Firebase:', error);
    return { success: false, error: error.message };
  }
};

export const getUserFromDatabase = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return { success: true, user: snapshot.val() };
    } else {
      return { success: false, error: 'Usuario no encontrado' };
    }
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserInDatabase = async (userId, updates) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await update(userRef, updateData);
    console.log('✅ Usuario actualizado en Firebase:', userId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// DIRECCIONES
// ============================================

export const saveUserAddress = async (userId, address) => {
  try {
    const addressId = `addr_${Date.now()}`;
    const addressRef = ref(database, `users/${userId}/addresses/${addressId}`);
    
    const addressData = {
      id: addressId,
      label: address.label || 'Casa',
      street: address.street,
      number: address.number,
      zone: address.zone,
      city: address.city || 'La Paz',
      reference: address.reference || '',
      coordinates: address.coordinates || null,
      isDefault: address.isDefault || false,
      createdAt: new Date().toISOString(),
    };

    await set(addressRef, addressData);
    console.log('✅ Dirección guardada:', addressId);
    return { success: true, address: addressData };
  } catch (error) {
    console.error('❌ Error guardando dirección:', error);
    return { success: false, error: error.message };
  }
};

export const getUserAddresses = async (userId) => {
  try {
    const addressesRef = ref(database, `users/${userId}/addresses`);
    const snapshot = await get(addressesRef);
    
    if (snapshot.exists()) {
      const addresses = Object.values(snapshot.val());
      return { success: true, addresses };
    } else {
      return { success: true, addresses: [] };
    }
  } catch (error) {
    console.error('❌ Error obteniendo direcciones:', error);
    return { success: false, error: error.message };
  }
};

export default {
  saveUserToDatabase,
  getUserFromDatabase,
  updateUserInDatabase,
  saveUserAddress,
  getUserAddresses,
};
