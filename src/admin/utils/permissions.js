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
  },
  
  CONTENT_MANAGER: {
    name: 'Gestor de Contenido',
    permissions: [
      'manage_products',
      'manage_promos'
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

export const canAccessRoute = (userRole, routeName) => {
  const routePermissions = {
    'AdminDashboard': '*',
    'Products': ['manage_products'],
    'Orders': ['manage_orders', 'view_orders'],
    'Users': ['manage_users'],
    'Deliveries': ['approve_deliveries', 'view_delivery_stats'],
    'Promotions': ['manage_promos'],
    'Analytics': ['view_analytics'],
    'Admins': ['*']
  };
  
  const requiredPerms = routePermissions[routeName];
  if (!requiredPerms) return false;
  if (requiredPerms === '*') return userRole === 'SUPER_ADMIN';
  
  const userPermissions = ROLES[userRole]?.permissions || [];
  if (userPermissions.includes('*')) return true;
  
  return requiredPerms.some(perm => userPermissions.includes(perm));
};

export const getPermissionsForRole = (role) => {
  return ROLES[role]?.permissions || [];
};

export const getAllRoles = () => {
  return Object.keys(ROLES);
};
