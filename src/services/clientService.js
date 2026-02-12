import { ref, set, get, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../config/firebase';

// Database path for clients
const DB_PATH = 'clientes';

// Create or update client in database
export const saveClient = async (clientData) => {
  try {
    console.log('💾 Guardando cliente en base de datos:', clientData);
    
    const clientRef = push(ref(database, DB_PATH));
    const clientId = clientRef.key;
    
    const clientRecord = {
      id: clientId,
      nombre: clientData.firstName,
      apellido: clientData.lastName,
      email: clientData.email || null,
      telefono: clientData.phoneNumber,
      fechaNacimiento: clientData.birthDate || null,
      avatar: clientData.avatar || null,
      fechaRegistro: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString(),
      activo: true
    };
    
    await set(clientRef, clientRecord);
    
    console.log('✅ Cliente guardado exitosamente con ID:', clientId);
    return { success: true, clientId, client: clientRecord };
    
  } catch (error) {
    console.error('❌ Error guardando cliente:', error);
    return { success: false, error: error.message };
  }
};

// Get client by phone number
export const getClientByPhone = async (phoneNumber) => {
  try {
    console.log('🔍 Buscando cliente por teléfono:', phoneNumber);
    
    // Get all clients and filter manually to avoid index requirement
    const snapshot = await get(ref(database, DB_PATH));
    
    if (snapshot.exists()) {
      const clients = [];
      snapshot.forEach(child => {
        const clientData = child.val();
        if (clientData.telefono === phoneNumber) {
          clients.push({ id: child.key, ...clientData });
        }
      });
      
      if (clients.length > 0) {
        console.log('✅ Cliente encontrado:', clients[0].nombre, clients[0].apellido);
        return clients[0]; // Return first match
      }
    }
    
    console.log('ℹ️ No se encontró cliente con ese teléfono');
    return null;
  } catch (error) {
    console.error('❌ Error buscando cliente por teléfono:', error);
    return null;
  }
};

// Update client information
export const updateClient = async (clientId, updateData) => {
  try {
    console.log('🔄 Actualizando cliente:', clientId, updateData);
    
    const updateRecord = {
      ...updateData,
      ultimaActualizacion: new Date().toISOString()
    };
    
    await update(ref(database, `${DB_PATH}/${clientId}`), updateRecord);
    
    console.log('✅ Cliente actualizado exitosamente');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error actualizando cliente:', error);
    return { success: false, error: error.message };
  }
};

// Get client by ID
export const getClientById = async (clientId) => {
  try {
    const snapshot = await get(ref(database, `${DB_PATH}/${clientId}`));
    return snapshot.exists() ? { id: clientId, ...snapshot.val() } : null;
  } catch (error) {
    console.error('❌ Error obteniendo cliente:', error);
    return null;
  }
};