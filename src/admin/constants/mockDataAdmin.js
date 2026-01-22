export const MOCK_ADMINS = [
  {
    id: 'admin_001',
    email: 'admin@cantina.com',
    name: 'María García',
    role: 'ADMIN',
    password: 'Admin123!',
    avatar: null,
    createdAt: '2026-01-10T00:00:00.000Z',
    createdBy: 'nicolaspc97@gmail.com'
  },
  {
    id: 'admin_002',
    email: 'delivery.manager@cantina.com',
    name: 'Carlos Rojas',
    role: 'DELIVERY_MANAGER',
    password: 'Manager123!',
    avatar: null,
    createdAt: '2026-01-15T00:00:00.000Z',
    createdBy: 'nicolaspc97@gmail.com'
  },
  {
    id: 'admin_003',
    email: 'support@cantina.com',
    name: 'Ana López',
    role: 'SUPPORT',
    password: 'Support123!',
    avatar: null,
    createdAt: '2026-01-18T00:00:00.000Z',
    createdBy: 'nicolaspc97@gmail.com'
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif_001',
    type: 'delivery_request',
    title: 'Nueva solicitud de delivery',
    message: 'Juan Pérez ha enviado su solicitud',
    timestamp: Date.now() - 300000,
    read: false,
    actionUrl: '/deliveries'
  },
  {
    id: 'notif_002',
    type: 'order_issue',
    title: 'Pedido requiere atención',
    message: 'Pedido #CH-2026-123 tiene un problema',
    timestamp: Date.now() - 1800000,
    read: false,
    actionUrl: '/orders'
  },
  {
    id: 'notif_003',
    type: 'stock_low',
    title: 'Stock bajo',
    message: 'Singani Rujero: quedan 5 unidades',
    timestamp: Date.now() - 3600000,
    read: true,
    actionUrl: '/products'
  }
];

export const initializeMockAdmins = async (AsyncStorage) => {
  const existing = await AsyncStorage.getItem('admins_list');
  if (!existing) {
    await AsyncStorage.setItem('admins_list', JSON.stringify(MOCK_ADMINS));
  }
};
