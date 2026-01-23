import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithDB } from '../../services/seedersDB';
import { getRoleInfo, ROLES } from '../../config/roles';
import { logger } from '../../utils/logger';

const SUPER_ADMIN = {
  email: 'nicolaspc97@gmail.com',
  name: 'Nicolás Pinto',
  role: 'SUPER_ADMIN',
  permissions: ['*'],
  avatar: null,
  createdAt: '2026-01-01T00:00:00.000Z'
};

export const isSuperAdmin = (email) => {
  return email.toLowerCase() === SUPER_ADMIN.email.toLowerCase();
};

export const loginAdmin = async (email, password) => {
  try {
    console.log("🔐 ADMIN AUTH - Iniciando proceso de autenticación...");
    console.log(`📧 Email: ${email}`);
    console.log(`🔒 Password: ${'*'.repeat(password.length)}`);
    logger.info('ADMIN_AUTH', `Intento de login admin: ${email}`);
    
    // Verificar super admin primero
    if (isSuperAdmin(email)) {
      console.log("👑 VERIFICANDO SUPER ADMIN...");
      logger.info('ADMIN_AUTH', 'Verificando credenciales de super admin');
      
      if (password === 'Admin123!') {
        console.log("✅ SUPER ADMIN - CREDENCIALES CORRECTAS");
        console.log("🎉 SUPER ADMIN LOGIN EXITOSO");
        
        const adminData = SUPER_ADMIN;
        await AsyncStorage.setItem('admin_user', JSON.stringify(adminData));
        
        logger.success('ADMIN_AUTH', 'Super admin login exitoso', {
          email: adminData.email,
          name: adminData.name,
          role: adminData.role
        });
        
        return { success: true, user: adminData };
      } else {
        console.log("❌ SUPER ADMIN - CONTRASEÑA INCORRECTA");
        logger.error('ADMIN_AUTH', 'Super admin contraseña incorrecta', {
          email,
          expectedPassword: 'Admin123!',
          providedPassword: password
        });
        return { success: false, error: 'Contraseña de super admin incorrecta' };
      }
    }
    
    // Intentar login con Firebase Database
    console.log("🔍 VERIFICANDO EN FIREBASE DATABASE...");
    logger.info('ADMIN_AUTH', 'Verificando credenciales en Firebase Database');
    
    const result = await loginWithDB(email, password);
    
    if (result.success) {
      console.log("✅ FIREBASE - CREDENCIALES ENCONTRADAS");
      console.log("👤 Usuario encontrado:", {
        email: result.userData.email,
        name: result.userData.name,
        role: result.userData.role
      });
      
      const roleInfo = getRoleInfo(result.userData?.role);
      
      // Verificar que el usuario tenga permisos administrativos
      const allowedRoles = [ROLES.ADMIN, ROLES.REPONEDOR, ROLES.REPARTIDOR];
      if (!allowedRoles.includes(result.userData?.role)) {
        console.log("❌ USUARIO SIN PERMISOS ADMINISTRATIVOS");
        console.log(`🚫 Rol actual: ${result.userData?.role}`);
        console.log(`✅ Roles permitidos: ${allowedRoles.join(', ')}`);
        
        logger.warning('ADMIN_AUTH', 'Usuario sin permisos administrativos', {
          email,
          role: result.userData?.role,
          allowedRoles
        });
        
        return { success: false, error: 'Sin permisos administrativos' };
      }
      
      // Crear objeto admin compatible
      const adminData = {
        id: result.user.id,
        email: result.userData.email,
        name: result.userData.name,
        role: result.userData.role,
        roleInfo: roleInfo,
        permissions: roleInfo.permissions,
        avatar: null,
        createdAt: result.userData.createdAt,
        lastLogin: result.userData.lastLogin,
        phone: result.userData.phone,
        age: result.userData.age
      };
      
      console.log("🎉 ADMIN LOGIN EXITOSO CON FIREBASE:");
      console.log("📊 Datos del admin:", {
        email: adminData.email,
        name: adminData.name,
        role: adminData.role,
        roleName: roleInfo.name,
        permissions: roleInfo.permissions.length
      });
      
      await AsyncStorage.setItem('admin_user', JSON.stringify(adminData));
      
      logger.success('ADMIN_AUTH', 'Admin login exitoso con Firebase', {
        email: adminData.email,
        name: adminData.name,
        role: adminData.role,
        roleName: roleInfo.name
      });
      
      return { success: true, user: adminData };
    } else {
      console.log("❌ FIREBASE - CREDENCIALES INCORRECTAS");
      console.log("💥 Error:", result.error);
      
      logger.error('ADMIN_AUTH', 'Credenciales incorrectas en Firebase', {
        email,
        error: result.error,
        timestamp: new Date().toISOString()
      });
      
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error("💥 ERROR CRÍTICO EN ADMIN AUTH:", error);
    console.error("📍 Stack trace:", error.stack);
    
    logger.error('ADMIN_AUTH', 'Error crítico en admin auth', {
      email,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return { success: false, error: `Error del sistema: ${error.message}` };
  }
};

export const logoutAdmin = async () => {
  console.log("🚪 ADMIN LOGOUT - Cerrando sesión...");
  logger.info('ADMIN_AUTH', 'Admin logout ejecutado');
  
  try {
    const currentAdmin = await getCurrentAdmin();
    if (currentAdmin) {
      console.log("👋 Cerrando sesión de:", {
        email: currentAdmin.email,
        name: currentAdmin.name,
        role: currentAdmin.role
      });
      
      logger.info('ADMIN_AUTH', 'Cerrando sesión de admin', {
        email: currentAdmin.email,
        name: currentAdmin.name,
        role: currentAdmin.role
      });
    }
    
    await AsyncStorage.removeItem('admin_user');
    console.log("✅ LOGOUT COMPLETADO");
    logger.success('ADMIN_AUTH', 'Logout completado exitosamente');
    
  } catch (error) {
    console.error("❌ ERROR EN LOGOUT:", error);
    logger.error('ADMIN_AUTH', 'Error en logout', { error: error.message });
  }
};

export const getCurrentAdmin = async () => {
  try {
    const adminData = await AsyncStorage.getItem('admin_user');
    const admin = adminData ? JSON.parse(adminData) : null;
    
    if (admin) {
      console.log("👤 ADMIN ACTUAL:", {
        email: admin.email,
        name: admin.name,
        role: admin.role
      });
    } else {
      console.log("❌ NO HAY ADMIN LOGUEADO");
    }
    
    return admin;
  } catch (error) {
    console.error("❌ ERROR OBTENIENDO ADMIN ACTUAL:", error);
    return null;
  }
};

export const isAdminLoggedIn = async () => {
  const admin = await getCurrentAdmin();
  const isLoggedIn = admin !== null;
  
  console.log(`🔍 VERIFICANDO ESTADO DE LOGIN: ${isLoggedIn ? 'LOGUEADO' : 'NO LOGUEADO'}`);
  
  return isLoggedIn;
};

// Mantener compatibilidad con funciones existentes
export const getAdmins = async () => {
  const adminsData = await AsyncStorage.getItem('admins_list');
  return adminsData ? JSON.parse(adminsData) : [];
};

export const addAdmin = async (email, name, role, createdBy) => {
  const admins = await getAdmins();
  const newAdmin = {
    id: `admin_${Date.now()}`,
    email,
    name,
    role,
    password: 'Admin123!',
    permissions: [],
    avatar: null,
    createdAt: new Date().toISOString(),
    createdBy
  };
  admins.push(newAdmin);
  await AsyncStorage.setItem('admins_list', JSON.stringify(admins));
  return newAdmin;
};

export const removeAdmin = async (email, currentUserEmail) => {
  if (email === currentUserEmail) {
    return { success: false, error: 'No puedes eliminarte a ti mismo' };
  }
  if (isSuperAdmin(email)) {
    return { success: false, error: 'No puedes eliminar al SUPER_ADMIN' };
  }
  const admins = await getAdmins();
  const filtered = admins.filter(a => a.email !== email);
  await AsyncStorage.setItem('admins_list', JSON.stringify(filtered));
  return { success: true };
};

export const changePassword = async (email, currentPassword, newPassword) => {
  if (isSuperAdmin(email)) {
    return { success: false, error: 'Contacta al desarrollador para cambiar contraseña de SUPER_ADMIN' };
  }
  const admins = await getAdmins();
  const admin = admins.find(a => a.email === email);
  if (!admin || admin.password !== currentPassword) {
    return { success: false, error: 'Contraseña actual incorrecta' };
  }
  admin.password = newPassword;
  await AsyncStorage.setItem('admins_list', JSON.stringify(admins));
  return { success: true };
};