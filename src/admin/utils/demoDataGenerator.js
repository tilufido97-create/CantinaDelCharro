import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomBolivianName = () => {
  const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'José', 'Rosa', 'Pedro', 'Elena', 'Miguel', 'Sofia', 'Diego', 'Laura', 'Fernando', 'Patricia', 'Roberto', 'Isabel', 'Jorge', 'Gabriela'];
  const apellidos = ['Pérez', 'López', 'García', 'Rodríguez', 'Martínez', 'González', 'Fernández', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Herrera', 'Jiménez', 'Álvarez', 'Romero'];
  return `${getRandomItem(nombres)} ${getRandomItem(apellidos)}`;
};

const getRandomBolivianPhone = () => {
  return `+591 7${Math.floor(1000000 + Math.random() * 9000000)}`;
};

const getRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

const generateUniqueCode = (prefix) => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${random}`;
};

export const generateDemoData = async () => {
  try {
    console.log('🚀 Iniciando generación de datos demo...');
    
    // Cargar productos existentes
    const { MOCK_PRODUCTS } = require('../../constants/mockData');
    await AsyncStorage.setItem('all_products', JSON.stringify(MOCK_PRODUCTS));
    console.log('✅ Productos guardados:', MOCK_PRODUCTS.length);
    
    // Generar 50 pedidos
    const pedidos = [];
    const estados = [
      { status: 'delivered', count: 30 },
      { status: 'on_way', count: 10 },
      { status: 'pending', count: 5 },
      { status: 'cancelled', count: 5 }
    ];
    
    let orderIndex = 0;
    estados.forEach(({ status, count }) => {
      for (let i = 0; i < count; i++) {
        const fecha = getRandomDate(30);
        const productos = [];
        const numProductos = Math.floor(Math.random() * 3) + 1;
        let subtotal = 0;
        
        for (let j = 0; j < numProductos; j++) {
          const producto = getRandomItem(MOCK_PRODUCTS);
          const cantidad = Math.floor(Math.random() * 3) + 1;
          productos.push({
            id: producto.id,
            name: producto.name,
            price: producto.price,
            quantity: cantidad
          });
          subtotal += producto.price * cantidad;
        }
        
        const deliveryFee = [5, 10, 15][Math.floor(Math.random() * 3)];
        const total = subtotal + deliveryFee;
        
        pedidos.push({
          id: `ord-${Date.now()}-${orderIndex}`,
          orderNumber: `ORD-${String(1000 + orderIndex).padStart(4, '0')}`,
          customerName: getRandomBolivianName(),
          customerPhone: getRandomBolivianPhone(),
          items: productos,
          subtotal,
          delivery: deliveryFee,
          total,
          status,
          paymentMethod: Math.random() > 0.5 ? 'cash' : 'qr',
          createdAt: fecha,
          deliveredAt: status === 'delivered' ? fecha : null,
          deliveryAddress: {
            street: `Calle ${Math.floor(Math.random() * 50) + 1}`,
            zone: getRandomItem(['Zona Sur', 'Zona Norte', 'Centro', 'Zona Este']),
            reference: 'Casa con portón verde'
          },
          assignedDeliveryId: ['on_way', 'delivered'].includes(status) ? `dlv-${Math.floor(Math.random() * 10)}` : null,
          assignedDeliveryName: ['on_way', 'delivered'].includes(status) ? getRandomBolivianName() : null,
          assignedDeliveryCode: ['on_way', 'delivered'].includes(status) ? `DLV-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}` : null
        });
        orderIndex++;
      }
    });
    
    await AsyncStorage.setItem('order_history', JSON.stringify(pedidos));
    console.log('✅ Pedidos generados:', pedidos.length);
    
    // Generar 10 deliverys
    const deliverys = [];
    for (let i = 0; i < 10; i++) {
      deliverys.push({
        id: `dlv-${i}`,
        code: `DLV-${String(i + 1).padStart(3, '0')}`,
        name: getRandomBolivianName(),
        phone: getRandomBolivianPhone(),
        vehicleType: Math.random() > 0.5 ? 'Moto' : 'Bicicleta',
        vehiclePlate: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'active',
        available: i < 6,
        rating: (4 + Math.random()).toFixed(1),
        completedToday: Math.floor(Math.random() * 20),
        createdAt: getRandomDate(90)
      });
    }
    
    await AsyncStorage.setItem('active_deliveries', JSON.stringify(deliverys));
    console.log('✅ Deliverys generados:', deliverys.length);
    
    // Generar 20 usuarios
    const usuarios = [];
    const tiers = [
      { tier: 'bronze', count: 10, puntos: [0, 500] },
      { tier: 'silver', count: 6, puntos: [500, 1500] },
      { tier: 'gold', count: 3, puntos: [1500, 3000] },
      { tier: 'platinum', count: 1, puntos: [3000, 5000] }
    ];
    
    let userIndex = 0;
    tiers.forEach(({ tier, count, puntos }) => {
      for (let i = 0; i < count; i++) {
        usuarios.push({
          id: `user-${userIndex}`,
          name: getRandomBolivianName(),
          phone: getRandomBolivianPhone(),
          avatar: Math.floor(Math.random() * 8),
          tier,
          points: Math.floor(Math.random() * (puntos[1] - puntos[0])) + puntos[0],
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: getRandomDate(180),
          addresses: [{
            street: `Calle ${Math.floor(Math.random() * 50) + 1}`,
            zone: getRandomItem(['Zona Sur', 'Zona Norte', 'Centro']),
            reference: 'Casa con portón'
          }]
        });
        userIndex++;
      }
    });
    
    await AsyncStorage.setItem('all_users', JSON.stringify(usuarios));
    console.log('✅ Usuarios generados:', usuarios.length);
    
    // Generar transacciones financieras (ingresos desde pedidos completados)
    const transacciones = [];
    const pedidosCompletados = pedidos.filter(p => p.status === 'delivered');
    
    pedidosCompletados.forEach(pedido => {
      transacciones.push({
        id: generateUniqueCode('TXN'),
        tipo: 'ingreso_venta',
        categoria: 'ventas',
        monto: pedido.total,
        descripcion: `Venta - Pedido #${pedido.orderNumber}`,
        fecha: pedido.deliveredAt,
        orderId: pedido.id,
        metodoPago: pedido.paymentMethod,
        clienteNombre: pedido.customerName
      });
    });
    
    // Agregar algunos gastos
    const gastosInventario = 7;
    for (let i = 0; i < gastosInventario; i++) {
      transacciones.push({
        id: generateUniqueCode('TXN'),
        tipo: 'gasto_inventario',
        categoria: 'inventario',
        monto: Math.floor(Math.random() * 2000) + 500,
        descripcion: `Compra de inventario - ${getRandomItem(['Singani', 'Cerveza', 'Ron', 'Vodka'])}`,
        fecha: getRandomDate(30),
        proveedor: getRandomBolivianName(),
        comprobante: `FAC-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }
    
    const gastosSalarios = 3;
    for (let i = 0; i < gastosSalarios; i++) {
      transacciones.push({
        id: generateUniqueCode('TXN'),
        tipo: 'gasto_salarios',
        categoria: 'salarios',
        monto: Math.floor(Math.random() * 1000) + 500,
        descripcion: `Pago delivery - ${getRandomBolivianName()}`,
        fecha: getRandomDate(30)
      });
    }
    
    const gastosOperativos = 2;
    for (let i = 0; i < gastosOperativos; i++) {
      transacciones.push({
        id: generateUniqueCode('TXN'),
        tipo: 'gasto_operativos',
        categoria: 'operativos',
        monto: Math.floor(Math.random() * 500) + 100,
        descripcion: getRandomItem(['Factura de luz', 'Internet', 'Alquiler local']),
        fecha: getRandomDate(30)
      });
    }
    
    await AsyncStorage.setItem('financial_transactions', JSON.stringify(transacciones));
    console.log('✅ Transacciones generadas:', transacciones.length);
    
    // Generar 5 promociones
    const promociones = [];
    const tiposPromo = ['discount', 'combo', 'flash', 'happy_hour'];
    for (let i = 0; i < 5; i++) {
      const inicio = new Date();
      inicio.setDate(inicio.getDate() - Math.floor(Math.random() * 10));
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + Math.floor(Math.random() * 20) + 10);
      
      promociones.push({
        id: `promo-${i}`,
        code: `PROMO${String(i + 1).padStart(3, '0')}`,
        name: `Promoción ${i + 1}`,
        type: getRandomItem(tiposPromo),
        discount: Math.floor(Math.random() * 30) + 10,
        startDate: inicio.toISOString(),
        endDate: fin.toISOString(),
        active: Math.random() > 0.3,
        description: 'Promoción especial',
        createdAt: getRandomDate(30)
      });
    }
    
    await AsyncStorage.setItem('promotions', JSON.stringify(promociones));
    console.log('✅ Promociones generadas:', promociones.length);
    
    console.log('🎉 Datos demo generados exitosamente');
    
    return {
      success: true,
      stats: {
        pedidos: pedidos.length,
        deliverys: deliverys.length,
        usuarios: usuarios.length,
        transacciones: transacciones.length,
        promociones: promociones.length
      }
    };
  } catch (error) {
    console.error('❌ Error generando datos demo:', error);
    Alert.alert('Error', 'No se pudieron generar los datos: ' + error.message);
    return { success: false, error: error.message };
  }
};

export const clearAllDemoData = async () => {
  try {
    console.log('🗑️ Limpiando datos demo...');
    await AsyncStorage.removeItem('order_history');
    await AsyncStorage.removeItem('all_users');
    await AsyncStorage.removeItem('active_deliveries');
    await AsyncStorage.removeItem('promotions');
    await AsyncStorage.removeItem('financial_transactions');
    console.log('✅ Datos demo eliminados');
    return { success: true };
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
    return { success: false, error: error.message };
  }
};
