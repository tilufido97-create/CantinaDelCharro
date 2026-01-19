import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadOrders = async () => {
  try {
    const data = await AsyncStorage.getItem('user_orders');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error cargando pedidos:', error);
    return [];
  }
};

export const saveOrder = async (order) => {
  try {
    const orders = await loadOrders();
    orders.unshift(order);
    await AsyncStorage.setItem('user_orders', JSON.stringify(orders));
    return { success: true };
  } catch (error) {
    console.error('Error guardando pedido:', error);
    return { success: false, error };
  }
};

export const getOrderById = async (orderId) => {
  try {
    const orders = await loadOrders();
    return orders.find(order => order.id === orderId);
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    return null;
  }
};

export const getOrderStats = async () => {
  try {
    const orders = await loadOrders();
    return {
      total: orders.length,
      completed: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalSpent: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    };
  } catch (error) {
    console.error('Error calculando stats:', error);
    return { total: 0, completed: 0, cancelled: 0, totalSpent: 0 };
  }
};
