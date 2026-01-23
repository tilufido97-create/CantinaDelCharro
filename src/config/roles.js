export const ROLES = {
  ADMIN: 'admin',
  REPONEDOR: 'reponedor', 
  REPARTIDOR: 'repartidor',
  CUSTOMER: 'customer'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    name: 'Administrador',
    icon: '👑',
    color: '#FFB800',
    permissions: [
      'manage_users',
      'manage_products', 
      'manage_orders',
      'view_reports',
      'manage_inventory',
      'manage_deliveries'
    ],
    description: 'Acceso completo al sistema'
  },
  [ROLES.REPONEDOR]: {
    name: 'Reponedor',
    icon: '📦',
    color: '#28a745',
    permissions: [
      'manage_inventory',
      'view_products',
      'update_stock'
    ],
    description: 'Gestión de inventario y productos'
  },
  [ROLES.REPARTIDOR]: {
    name: 'Repartidor',
    icon: '🚚',
    color: '#17a2b8',
    permissions: [
      'view_deliveries',
      'update_delivery_status',
      'view_orders'
    ],
    description: 'Gestión de entregas y pedidos'
  },
  [ROLES.CUSTOMER]: {
    name: 'Cliente',
    icon: '👤',
    color: '#6c757d',
    permissions: [
      'place_orders',
      'view_menu',
      'track_orders'
    ],
    description: 'Cliente de la cantina'
  }
};

export const getRoleInfo = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.CUSTOMER];
};

export const hasPermission = (userRole, permission) => {
  const roleInfo = getRoleInfo(userRole);
  return roleInfo.permissions.includes(permission);
};

export const getAllRoles = () => {
  return Object.values(ROLES);
};

export const getRoleOptions = () => {
  return Object.entries(ROLE_PERMISSIONS).map(([key, value]) => ({
    value: key,
    label: value.name,
    icon: value.icon,
    color: value.color,
    description: value.description
  }));
};