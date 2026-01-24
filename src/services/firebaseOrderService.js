import { database } from '../config/firebase';
import { ref, onValue, set, push, update, get, increment } from 'firebase/database';
import firebaseFinanceService from './firebaseFinanceService';

class OrderService {
  constructor() {
    this.ordersRef = ref(database, 'orders');
    this.productsRef = ref(database, 'products');
  }

  generateOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORDER_${year}${month}${day}_${random}`;
  }

  async createOrder(orderData) {
    try {
      // Validar stock antes de crear pedido
      for (const item of orderData.items) {
        const productRef = ref(database, `products/${item.productId}`);
        const snapshot = await get(productRef);
        const product = snapshot.val();
        
        if (!product) {
          return {
            success: false,
            error: `Producto "${item.name}" no encontrado`
          };
        }
        
        if (product.disponible === false) {
          return {
            success: false,
            error: `Producto "${item.name}" no está disponible`
          };
        }
        
        if (product.stock < item.quantity) {
          return {
            success: false,
            error: `Stock insuficiente para "${item.name}". Disponible: ${product.stock}`
          };
        }
      }

      // Reducir stock de cada producto
      for (const item of orderData.items) {
        const productRef = ref(database, `products/${item.productId}`);
        const snapshot = await get(productRef);
        const product = snapshot.val();
        const newStock = product.stock - item.quantity;
        
        await update(productRef, {
          stock: newStock,
          outOfStock: newStock === 0,
          disponible: newStock > 0,
          updatedAt: new Date().toISOString()
        });
      }

      // Crear pedido
      const orderId = this.generateOrderId();
      const orderRef = ref(database, `orders/${orderId}`);
      
      const order = {
        orderId,
        orderNumber: orderId.replace('ORDER_', ''),
        ...orderData,
        status: 'pendiente',
        createdAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'pendiente',
            timestamp: new Date().toISOString(),
            label: 'Pedido Realizado'
          }
        ]
      };

      await set(orderRef, order);
      
      console.log('✅ Pedido creado:', orderId);
      return { success: true, orderId, order };
    } catch (error) {
      console.error('❌ Error al crear pedido:', error);
      return { success: false, error: error.message };
    }
  }

  subscribeToOrders(callback) {
    const unsubscribe = onValue(this.ordersRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data) {
        callback([]);
        return;
      }

      const ordersArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));

      // Ordenar por fecha (más recientes primero)
      ordersArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log('📦 Firebase: Pedidos actualizados:', ordersArray.length);
      callback(ordersArray);
    }, (error) => {
      console.error('❌ Error al escuchar pedidos:', error);
      callback([]);
    });

    return unsubscribe;
  }

  subscribeToOrder(orderId, callback) {
    const orderRef = ref(database, `orders/${orderId}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      const order = snapshot.val();
      callback(order);
    });
    return unsubscribe;
  }

  async updateOrderStatus(orderId, newStatus, additionalData = {}) {
    try {
      const orderRef = ref(database, `orders/${orderId}`);
      const snapshot = await get(orderRef);
      const order = snapshot.val();

      const statusLabels = {
        pendiente: 'Pedido Realizado',
        preparando: 'Preparando Pedido',
        listo_pickup: 'Esperando Recojo',
        listo_delivery: 'Esperando Delivery',
        en_camino: 'En Camino',
        entregado: 'Entregado',
        cancelado: 'Cancelado'
      };

      const statusHistory = order.statusHistory || [];
      statusHistory.push({
        status: newStatus,
        label: statusLabels[newStatus] || newStatus,
        timestamp: new Date().toISOString(),
        ...additionalData
      });

      await update(orderRef, {
        status: newStatus,
        statusHistory,
        updatedAt: new Date().toISOString(),
        ...additionalData
      });

      // Si se marca como entregado, crear transacción de venta
      if (newStatus === 'entregado') {
        await firebaseFinanceService.createSaleTransaction({
          ...order,
          orderId,
          deliveredAt: additionalData.deliveredAt || new Date().toISOString()
        });
        console.log('💰 Transacción de venta creada automáticamente');
      }

      console.log('✅ Estado actualizado:', orderId, newStatus);
      return { success: true };
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      return { success: false, error: error.message };
    }
  }

  async cancelOrder(orderId) {
    try {
      const orderRef = ref(database, `orders/${orderId}`);
      const snapshot = await get(orderRef);
      const order = snapshot.val();

      // Restaurar stock
      for (const item of order.items) {
        const productRef = ref(database, `products/${item.productId}`);
        const productSnapshot = await get(productRef);
        const product = productSnapshot.val();
        const newStock = product.stock + item.quantity;
        
        await update(productRef, {
          stock: newStock,
          outOfStock: false,
          disponible: true, // Re-habilitar al restaurar stock
          updatedAt: new Date().toISOString()
        });
      }

      // Actualizar pedido
      await this.updateOrderStatus(orderId, 'cancelado', {
        cancelledAt: new Date().toISOString()
      });

      console.log('✅ Pedido cancelado y stock restaurado:', orderId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error al cancelar pedido:', error);
      return { success: false, error: error.message };
    }
  }

  async assignDelivery(orderId, deliveryId, deliveryName) {
    try {
      await update(ref(database, `orders/${orderId}`), {
        deliveryId,
        deliveryName,
        assignedAt: new Date().toISOString()
      });

      await this.updateOrderStatus(orderId, 'listo_delivery');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error al asignar delivery:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new OrderService();
