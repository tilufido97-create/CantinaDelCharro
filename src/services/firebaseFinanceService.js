import { database } from '../config/firebase';
import { ref, onValue, set, push, update, get, remove } from 'firebase/database';

class FinanceService {
  constructor() {
    this.transactionsRef = ref(database, 'finances/transactions');
    this.employeesRef = ref(database, 'finances/employees');
  }

  generateTransactionId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TXN_${year}${month}${day}_${random}`;
  }

  async createTransaction(transactionData) {
    try {
      const transactionId = this.generateTransactionId();
      const transactionRef = ref(database, `finances/transactions/${transactionId}`);
      
      const transaction = {
        transactionId,
        ...transactionData,
        createdAt: new Date().toISOString()
      };

      await set(transactionRef, transaction);
      console.log('✅ Transacción creada:', transactionId);
      return { success: true, transactionId, transaction };
    } catch (error) {
      console.error('❌ Error al crear transacción:', error);
      return { success: false, error: error.message };
    }
  }

  async createSaleTransaction(orderData) {
    try {
      const transaction = {
        type: 'ingreso',
        category: 'venta',
        orderId: orderData.orderId,
        amount: orderData.total,
        paymentMethod: orderData.paymentMethod,
        date: orderData.deliveredAt || new Date().toISOString(),
        customerName: orderData.customerName,
        products: orderData.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        deliveryType: orderData.deliveryType,
        deliveryCost: orderData.deliveryCost || 0,
        description: `Venta - Pedido #${orderData.orderNumber || orderData.orderId}`,
        isAutomatic: true
      };

      return await this.createTransaction(transaction);
    } catch (error) {
      console.error('❌ Error al crear transacción de venta:', error);
      return { success: false, error: error.message };
    }
  }

  subscribeToTransactions(callback) {
    const unsubscribe = onValue(this.transactionsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data) {
        callback([]);
        return;
      }

      const transactionsArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));

      transactionsArray.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log('💰 Firebase: Transacciones actualizadas:', transactionsArray.length);
      callback(transactionsArray);
    }, (error) => {
      console.error('❌ Error al escuchar transacciones:', error);
      callback([]);
    });

    return unsubscribe;
  }

  async updateTransaction(transactionId, updates) {
    try {
      const transactionRef = ref(database, `finances/transactions/${transactionId}`);
      await update(transactionRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Error al actualizar transacción:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteTransaction(transactionId) {
    try {
      const transactionRef = ref(database, `finances/transactions/${transactionId}`);
      await remove(transactionRef);
      return { success: true };
    } catch (error) {
      console.error('❌ Error al eliminar transacción:', error);
      return { success: false, error: error.message };
    }
  }

  // Empleados
  async createEmployee(employeeData) {
    try {
      const employeeId = `EMP_${Date.now()}`;
      const employeeRef = ref(database, `finances/employees/${employeeId}`);
      
      const employee = {
        employeeId,
        ...employeeData,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      await set(employeeRef, employee);
      return { success: true, employeeId, employee };
    } catch (error) {
      console.error('❌ Error al crear empleado:', error);
      return { success: false, error: error.message };
    }
  }

  subscribeToEmployees(callback) {
    const unsubscribe = onValue(this.employeesRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data) {
        callback([]);
        return;
      }

      const employeesArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));

      callback(employeesArray);
    });

    return unsubscribe;
  }

  async updateEmployee(employeeId, updates) {
    try {
      const employeeRef = ref(database, `finances/employees/${employeeId}`);
      await update(employeeRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteEmployee(employeeId) {
    try {
      const employeeRef = ref(database, `finances/employees/${employeeId}`);
      await remove(employeeRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new FinanceService();
