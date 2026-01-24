import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db, COLLECTIONS, handleFirebaseError } from '../config/firebaseConfig';

/**
 * Servicio completo de pedidos con Firebase
 */

// ==================== ORDER STATES ====================

export const ORDER_STATES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  ASSIGNED: 'assigned',
  ON_WAY: 'on_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const ORDER_STATE_LABELS = {
  [ORDER_STATES.PENDING]: 'Pendiente',
  [ORDER_STATES.CONFIRMED]: 'Confirmado',
  [ORDER_STATES.PREPARING]: 'Preparando',
  [ORDER_STATES.READY]: 'Listo',
  [ORDER_STATES.ASSIGNED]: 'Asignado',
  [ORDER_STATES.ON_WAY]: 'En camino',
  [ORDER_STATES.DELIVERED]: 'Entregado',
  [ORDER_STATES.CANCELLED]: 'Cancelado'
};

// ==================== CRUD OPERATIONS ====================

/**
 * Crear nuevo pedido
 */
export const createOrder = async (orderData) => {
  try {
    // Generar número de pedido único
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
    
    const newOrder = {
      ...orderData,
      orderNumber,
      status: ORDER_STATES.PENDING,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), newOrder);
    
    console.log('✅ Pedido creado:', docRef.id, orderNumber);
    
    return {
      id: docRef.id,
      orderNumber
    };
    
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Obtener todos los pedidos
 */
export const getAllOrders = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      orderBy('creadoEn', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${orders.length} pedidos cargados`);
    return orders;
    
  } catch (error) {
    console.error('Error getting orders:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Obtener pedido por ID
 */
export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Pedido no encontrado');
    }
    
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Obtener pedidos de un usuario
 */
export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('userId', '==', userId),
      orderBy('creadoEn', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
    
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Actualizar estado del pedido
 */
export const updateOrderStatus = async (orderId, newStatus, additionalData = {}) => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    
    const updateData = {
      status: newStatus,
      actualizadoEn: serverTimestamp(),
      ...additionalData
    };
    
    // Agregar timestamp específico según el estado
    if (newStatus === ORDER_STATES.CONFIRMED) {
      updateData.confirmedAt = serverTimestamp();
    } else if (newStatus === ORDER_STATES.ASSIGNED) {
      updateData.assignedAt = serverTimestamp();
    } else if (newStatus === ORDER_STATES.ON_WAY) {
      updateData.onWayAt = serverTimestamp();
    } else if (newStatus === ORDER_STATES.DELIVERED) {
      updateData.deliveredAt = serverTimestamp();
    }
    
    await updateDoc(orderRef, updateData);
    
    console.log('✅ Estado actualizado:', orderId, newStatus);
    return true;
    
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Asignar delivery a un pedido
 */
export const assignDeliveryToOrder = async (orderId, deliveryData) => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    
    await updateDoc(orderRef, {
      assignedDeliveryId: deliveryData.id,
      assignedDeliveryName: deliveryData.nombre,
      assignedDeliveryCode: deliveryData.code,
      assignedDeliveryPhone: deliveryData.telefono,
      assignedDeliveryVehicle: deliveryData.vehicleType,
      status: ORDER_STATES.ASSIGNED,
      assignedAt: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
    
    // Actualizar estado del delivery
    const deliveryRef = doc(db, COLLECTIONS.DELIVERIES, deliveryData.id);
    await updateDoc(deliveryRef, {
      disponible: false,
      pedidoActualId: orderId,
      actualizadoEn: serverTimestamp()
    });
    
    console.log('✅ Delivery asignado:', deliveryData.nombre, 'al pedido', orderId);
    return true;
    
  } catch (error) {
    console.error('Error assigning delivery:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Liberar delivery de un pedido
 */
export const releaseDeliveryFromOrder = async (orderId, deliveryId) => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    
    await updateDoc(orderRef, {
      assignedDeliveryId: null,
      assignedDeliveryName: null,
      assignedDeliveryCode: null,
      assignedDeliveryPhone: null,
      assignedDeliveryVehicle: null,
      actualizadoEn: serverTimestamp()
    });
    
    // Liberar delivery
    const deliveryRef = doc(db, COLLECTIONS.DELIVERIES, deliveryId);
    await updateDoc(deliveryRef, {
      disponible: true,
      pedidoActualId: null,
      actualizadoEn: serverTimestamp()
    });
    
    console.log('✅ Delivery liberado del pedido', orderId);
    return true;
    
  } catch (error) {
    console.error('Error releasing delivery:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Cancelar pedido
 */
export const cancelOrder = async (orderId, reason = '') => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    
    // Obtener datos del pedido para liberar delivery si está asignado
    const orderSnap = await getDoc(orderRef);
    const orderData = orderSnap.data();
    
    await updateDoc(orderRef, {
      status: ORDER_STATES.CANCELLED,
      cancelledAt: serverTimestamp(),
      cancellationReason: reason,
      actualizadoEn: serverTimestamp()
    });
    
    // Si tenía delivery asignado, liberarlo
    if (orderData.assignedDeliveryId) {
      await releaseDeliveryFromOrder(orderId, orderData.assignedDeliveryId);
    }
    
    console.log('✅ Pedido cancelado:', orderId);
    return true;
    
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Eliminar pedido (solo admin)
 */
export const deleteOrder = async (orderId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.ORDERS, orderId));
    
    console.log('✅ Pedido eliminado:', orderId);
    return true;
    
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error(handleFirebaseError(error));
  }
};

// ==================== REAL-TIME LISTENERS ====================

/**
 * Listener en tiempo real de todos los pedidos (para admin)
 */
export const subscribeToOrders = (callback, onError = null) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      orderBy('creadoEn', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = [];
        snapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`🔄 Pedidos actualizados: ${orders.length}`);
        callback(orders);
      },
      (error) => {
        console.error('Error in orders listener:', error);
        if (onError) onError(error);
      }
    );
    
    return unsubscribe;
    
  } catch (error) {
    console.error('Error subscribing to orders:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Listener de pedidos de un usuario específico
 */
export const subscribeToUserOrders = (userId, callback, onError = null) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('userId', '==', userId),
      orderBy('creadoEn', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = [];
        snapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        callback(orders);
      },
      (error) => {
        console.error('Error in user orders listener:', error);
        if (onError) onError(error);
      }
    );
    
    return unsubscribe;
    
  } catch (error) {
    console.error('Error subscribing to user orders:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Listener de un pedido específico
 */
export const subscribeToOrder = (orderId, callback, onError = null) => {
  try {
    const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data()
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error in order listener:', error);
        if (onError) onError(error);
      }
    );
    
    return unsubscribe;
    
  } catch (error) {
    console.error('Error subscribing to order:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Listener de pedidos pendientes (para notificaciones)
 */
export const subscribeToPendingOrders = (callback, onError = null) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('status', '==', ORDER_STATES.PENDING),
      orderBy('creadoEn', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = [];
        snapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        if (orders.length > 0) {
          console.log(`⚠️ ${orders.length} pedidos pendientes`);
        }
        
        callback(orders);
      },
      (error) => {
        console.error('Error in pending orders listener:', error);
        if (onError) onError(error);
      }
    );
    
    return unsubscribe;
    
  } catch (error) {
    console.error('Error subscribing to pending orders:', error);
    throw new Error(handleFirebaseError(error));
  }
};

// ==================== QUERY HELPERS ====================

/**
 * Obtener pedidos por estado
 */
export const getOrdersByStatus = async (status) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('status', '==', status),
      orderBy('creadoEn', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
    
  } catch (error) {
    console.error('Error getting orders by status:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Obtener pedidos de hoy
 */
export const getTodayOrders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('creadoEn', '>=', today),
      orderBy('creadoEn', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
    
  } catch (error) {
    console.error('Error getting today orders:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Obtener estadísticas de pedidos
 */
export const getOrderStats = async () => {
  try {
    const orders = await getAllOrders();
    
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === ORDER_STATES.PENDING).length,
      confirmed: orders.filter(o => o.status === ORDER_STATES.CONFIRMED).length,
      preparing: orders.filter(o => o.status === ORDER_STATES.PREPARING).length,
      onWay: orders.filter(o => o.status === ORDER_STATES.ON_WAY).length,
      delivered: orders.filter(o => o.status === ORDER_STATES.DELIVERED).length,
      cancelled: orders.filter(o => o.status === ORDER_STATES.CANCELLED).length,
      totalRevenue: orders
        .filter(o => o.status === ORDER_STATES.DELIVERED)
        .reduce((sum, o) => sum + (o.total || 0), 0)
    };
    
    return stats;
    
  } catch (error) {
    console.error('Error getting order stats:', error);
    throw new Error(handleFirebaseError(error));
  }
};

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  assignDeliveryToOrder,
  releaseDeliveryFromOrder,
  cancelOrder,
  deleteOrder,
  subscribeToOrders,
  subscribeToUserOrders,
  subscribeToOrder,
  subscribeToPendingOrders,
  getOrdersByStatus,
  getTodayOrders,
  getOrderStats,
  ORDER_STATES,
  ORDER_STATE_LABELS
};
