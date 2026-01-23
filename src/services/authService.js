import { ref, get } from "firebase/database";
import { database } from "../config/firebase";
import { getRoleInfo } from "../config/roles";
import { logger } from "../utils/logger";
import { loginWithDB } from "./seedersDB";

export const authService = {
  // Login con base de datos (sin Firebase Auth)
  async login(email, password) {
    try {
      logger.info('AUTH', `Intentando login con DB: ${email}`);
      
      const result = await loginWithDB(email, password);
      
      if (result.success) {
        const roleInfo = getRoleInfo(result.userData?.role);
        
        logger.success('AUTH', 'Login exitoso con DB', {
          email,
          role: result.userData?.role,
          roleName: roleInfo.name
        });
        
        return {
          success: true,
          user: result.user,
          userData: result.userData,
          roleInfo
        };
      } else {
        logger.error('AUTH', 'Login fallido con DB', { email, error: result.error });
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      logger.error('AUTH', 'Error en login con DB', { email, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Obtener datos del usuario por ID
  async getUserData(userId) {
    try {
      logger.debug('AUTH', `Obteniendo datos del usuario: ${userId}`);
      
      const snapshot = await get(ref(database, `users/${userId}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const roleInfo = getRoleInfo(data.role);
        
        logger.success('AUTH', 'Datos del usuario obtenidos', {
          name: data.name,
          role: data.role,
          roleName: roleInfo.name,
          email: data.email,
          lastLogin: data.lastLogin
        });
        
        return data;
      }
      
      logger.warning('AUTH', `No se encontraron datos para el usuario: ${userId}`);
      return null;
    } catch (error) {
      logger.error('AUTH', 'Error obteniendo datos del usuario', {
        userId,
        error: error.message
      });
      return null;
    }
  },

  // Logout simple
  async logout() {
    try {
      logger.success('AUTH', 'Logout exitoso');
      return { success: true };
    } catch (error) {
      logger.error('AUTH', 'Error en logout', { error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Mensajes de error
  getErrorMessage(errorCode) {
    const errorMessages = {
      'user-not-found': 'Usuario no encontrado',
      'wrong-password': 'Contraseña incorrecta',
      'invalid-email': 'Email inválido',
      'network-error': 'Error de conexión'
    };
    
    const message = errorMessages[errorCode] || 'Error desconocido';
    logger.warning('AUTH', `Error traducido: ${errorCode} -> ${message}`);
    return message;
  }
};