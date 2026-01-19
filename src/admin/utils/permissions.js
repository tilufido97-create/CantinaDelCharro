export const ROLES = {
  SUPER_ADMIN: {
    name: 'Super Administrador',
    permissions: ['*']
  },
  
  ADMIN: {
    name: 'Administrador',
    permissions: [
      'manage_products',
      'manage_orders',
      'view_analytics',
      'manage_promos',
      'approve_deliveries',
      'manage_users'
    ]
  },
  
  DELIVERY_MANAGER: {
    name: 'Gestor de Deliverys',
    permissions: [
      'approve_deliveries',
      'assign_routes',
      'view_delivery_stats',
      'generate_delivery_codes'
    ]
  },
  
  SUPPORT: {
    name: 'Soporte',
    permissions: [
      'view_orders',
      'contact_users',
      'refund_orders',
      'view_users'
    ]
  }
};

export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  if (user.permissions.includes('*')) return true;
  return user.permissions.includes(permission);
};

export const hasAllPermissions = (user, permissions) => {
  return permissions.every(perm => hasPermission(user, perm));
};

export const hasAnyPermission = (user, permissions) => {
  return permissions.some(perm => hasPermission(user, perm));
};

export const getRoleName = (roleKey) => {
  return ROLES[roleKey]?.name || 'Sin rol';
};
