import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserToDatabase, updateUserInDatabase } from './userService';

WebBrowser.maybeCompleteAuthSession();

// ============================================
// GOOGLE SIGN-IN (EXPO GO COMPATIBLE)
// ============================================

// Configuración de Google OAuth - Versión simplificada
const GOOGLE_CONFIG = {
  expoClientId: '7156486343-iai42vb9rk75vrhomc62stk36n5rfs60.apps.googleusercontent.com',
  androidClientId: '7156486343-s38iv6gkvdogqise3r3h7t8805ufbkvr.apps.googleusercontent.com',
  iosClientId: '7156486343-6ushbn6cbus3e0l5rijispfn99tmb2k8.apps.googleusercontent.com',
  // Configuración corregida para coincidir con app.json
  redirectUri: 'https://auth.expo.io/@gatopinto/cantina-charro',
};

export const useGoogleAuth = () => {
  console.log('🔧 Configuración de Google Auth:');
  console.log('  - expoClientId:', GOOGLE_CONFIG.expoClientId);
  console.log('  - redirectUri:', GOOGLE_CONFIG.redirectUri);
  console.log('  - androidClientId:', GOOGLE_CONFIG.androidClientId);
  console.log('  - iosClientId:', GOOGLE_CONFIG.iosClientId);
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CONFIG.expoClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    redirectUri: GOOGLE_CONFIG.redirectUri,
    scopes: ['profile', 'email'],
    selectAccount: true,
    // Removido responseType que causaba el error
    additionalParameters: {
      access_type: 'online',
      prompt: 'select_account',
    },
  });

  console.log('🔍 Request object:', request ? 'Creado' : 'No creado');
  console.log('🔍 Request URL:', request?.url || 'No disponible');
  
  return { request, response, promptAsync };
};

export const handleGoogleResponse = async (response) => {
  console.log('🔍 Respuesta completa de Google:', response);
  
  if (response?.type === 'success') {
    const { authentication } = response;
    
    console.log('✅ Token de acceso:', authentication?.accessToken ? 'Presente' : 'Ausente');
    
    if (!authentication?.accessToken) {
      console.error('❌ No se recibió token de acceso');
      return { success: false, error: 'No se recibió token de acceso' };
    }
    
    try {
      console.log('🌐 Obteniendo información del usuario...');
      
      // Obtener información del usuario desde Google API
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { 
          Authorization: `Bearer ${authentication.accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!userInfoResponse.ok) {
        throw new Error(`HTTP ${userInfoResponse.status}: ${userInfoResponse.statusText}`);
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('👤 Info del usuario obtenida:', {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture ? 'Presente' : 'Ausente'
      });
      
      // Validar datos esenciales
      if (!userInfo.id || !userInfo.email) {
        throw new Error('Datos de usuario incompletos');
      }
      
      const userData = {
        uid: userInfo.id,
        email: userInfo.email,
        displayName: userInfo.name || userInfo.email,
        photoURL: userInfo.picture || null,
        phoneNumber: null,
        provider: 'google',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('auth_token', userInfo.id);
      
      console.log('✅ Google Sign-In completado exitosamente');
      console.log('💾 Datos guardados en AsyncStorage');
      
      return { success: true, user: userData };
      
    } catch (error) {
      console.error('❌ Error obteniendo info del usuario:', error);
      console.error('🔍 Detalles del error:', {
        message: error.message,
        stack: error.stack
      });
      return { 
        success: false, 
        error: `Error al obtener información del usuario: ${error.message}` 
      };
    }
  }
  
  if (response?.type === 'error') {
    console.error('❌ Error en Google Auth:', response.error);
    console.error('🔍 Detalles del error:', response.params);
    return { 
      success: false, 
      error: response.error?.message || response.params?.error_description || 'Error de autenticación' 
    };
  }
  
  if (response?.type === 'cancel') {
    console.log('⚠️ Usuario canceló el inicio de sesión');
    return { success: false, error: 'Inicio de sesión cancelado por el usuario' };
  }
  
  if (response?.type === 'dismiss') {
    console.log('⚠️ Usuario cerró la ventana de autenticación');
    return { success: false, error: 'Ventana de autenticación cerrada' };
  }
  
  console.log('⚠️ Respuesta inesperada:', response?.type);
  return { success: false, error: 'Respuesta inesperada del servidor' };
};

// ============================================
// PHONE AUTH MOCK (PARA DESARROLLO)
// ============================================

const MOCK_OTP = '123456';
let mockPhoneNumber = null;
let mockVerificationSent = false;
let mockVerificationTime = null;

export const sendPhoneOTP = async (phoneNumber) => {
  try {
    console.log('📱 [MOCK] Iniciando envío de código a:', phoneNumber);
    
    // Validación de formato
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return { success: false, error: 'Número de teléfono inválido' };
    }
    
    if (!phoneNumber.startsWith('+')) {
      return { success: false, error: 'El número debe incluir el código de país (+591)' };
    }
    
    // Validación de longitud mínima
    if (phoneNumber.length < 10) {
      return { success: false, error: 'Número de teléfono demasiado corto' };
    }
    
    // Limpiar estado anterior
    mockPhoneNumber = phoneNumber;
    mockVerificationSent = true;
    mockVerificationTime = Date.now();
    
    console.log('⏳ [MOCK] Simulando envío de SMS...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ [MOCK] Código generado:', MOCK_OTP);
    console.log('🕰️ [MOCK] Tiempo de verificación:', new Date(mockVerificationTime).toISOString());
    
    return { 
      success: true, 
      verificationId: 'mock-verification-id',
      message: `⚠️ MODO DESARROLLO\nCódigo de prueba: ${MOCK_OTP}\n\nEn producción se enviará SMS real`,
      expiresIn: 300 // 5 minutos
    };
    
  } catch (error) {
    console.error('❌ [MOCK] Error:', error);
    return { success: false, error: error.message || 'Error al enviar código' };
  }
};

export const verifyPhoneOTP = async (code) => {
  try {
    console.log('🔐 [MOCK] Iniciando verificación de código:', code);
    
    // Validaciones básicas
    if (!code || typeof code !== 'string') {
      return { success: false, error: 'Código inválido' };
    }
    
    if (!mockVerificationSent || !mockPhoneNumber) {
      console.error('❌ [MOCK] No hay verificación pendiente');
      return { success: false, error: 'No hay verificación pendiente. Solicita un nuevo código.' };
    }
    
    // Verificar expiración (5 minutos)
    const now = Date.now();
    const timeElapsed = now - mockVerificationTime;
    if (timeElapsed > 300000) { // 5 minutos en ms
      console.error('❌ [MOCK] Código expirado');
      mockVerificationSent = false;
      mockPhoneNumber = null;
      mockVerificationTime = null;
      return { success: false, error: 'El código ha expirado. Solicita uno nuevo.' };
    }
    
    // Verificar código
    if (code.trim() !== MOCK_OTP) {
      console.error('❌ [MOCK] Código incorrecto:', code, 'vs', MOCK_OTP);
      return { success: false, error: `Código incorrecto. Usa: ${MOCK_OTP}` };
    }
    
    // Check if phone number already exists in database
    const { getClientByPhone } = require('./clientService');
    const existingClient = await getClientByPhone(mockPhoneNumber);
    
    if (existingClient) {
      console.log('✅ [MOCK] Usuario existente encontrado, iniciando sesión...');
      
      const userData = {
        uid: `existing_${existingClient.id}`,
        phoneNumber: mockPhoneNumber,
        firstName: existingClient.nombre,
        lastName: existingClient.apellido,
        email: existingClient.email,
        displayName: `${existingClient.nombre} ${existingClient.apellido}`,
        photoURL: existingClient.avatar,
        provider: 'phone',
        clientId: existingClient.id,
        profileCompleted: true,
        ageVerified: true,
        createdAt: existingClient.fechaRegistro,
        lastLoginAt: new Date().toISOString(),
      };
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('auth_token', userData.uid);
      await AsyncStorage.setItem('authCompleted', 'true');
      
      // Limpiar estado
      mockVerificationSent = false;
      mockPhoneNumber = null;
      mockVerificationTime = null;
      
      console.log('✅ [MOCK] Login automático exitoso con datos existentes');
      return { success: true, user: userData, existingUser: true };
    }
    
    // Usuario nuevo - continuar con flujo normal
    const mockUid = `mock_${Date.now()}`;
    const userData = {
      uid: mockUid,
      phoneNumber: mockPhoneNumber,
      displayName: null,
      email: null,
      photoURL: null,
      provider: 'phone',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    
    // Guardar en AsyncStorage
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    await AsyncStorage.setItem('auth_token', mockUid);
    
    // Limpiar estado
    mockVerificationSent = false;
    mockPhoneNumber = null;
    mockVerificationTime = null;
    
    console.log('✅ [MOCK] Autenticación exitosa - usuario nuevo');
    console.log('💾 [MOCK] Datos guardados en AsyncStorage');
    
    return { success: true, user: userData, existingUser: false };
    
  } catch (error) {
    console.error('❌ [MOCK] Error:', error);
    return { success: false, error: error.message || 'Error al verificar código' };
  }
};

// ============================================
// UTILIDADES
// ============================================

export const signOut = async () => {
  try {
    console.log('🚪 Cerrando sesión...');
    await AsyncStorage.removeItem('user_data');
    await AsyncStorage.removeItem('auth_token');
    console.log('✅ Sesión cerrada exitosamente');
    return { success: true };
  } catch (error) {
    console.error('❌ Error cerrando sesión:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
};

export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  } catch (error) {
    return false;
  }
};

export const updateUserProfile = async (updates) => {
  try {
    const userData = await getCurrentUser();
    if (!userData) {
      throw new Error('No hay usuario autenticado');
    }
    
    const updatedUser = { ...userData, ...updates };
    await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    
    console.log('✅ Perfil actualizado:', updates);
    return { success: true, user: updatedUser };
    
  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    return { success: false, error: error.message };
  }
};

export const saveUserProfile = async (profile) => {
  try {
    const userData = await getCurrentUser();
    if (!userData) {
      throw new Error('No hay usuario autenticado');
    }
    
    const updatedUser = {
      ...userData,
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: `${profile.firstName} ${profile.lastName}`,
      email: profile.email || userData.email,
      avatar: profile.avatar,
      profileCompleted: true,
      updatedAt: new Date().toISOString(),
    };
    
    // Guardar en AsyncStorage
    await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    
    // Guardar en Firebase Realtime Database
    await saveUserToDatabase(userData.uid, updatedUser);
    
    console.log('✅ Perfil guardado en AsyncStorage y Firebase');
    return { success: true, user: updatedUser };
    
  } catch (error) {
    console.error('❌ Error guardando perfil:', error);
    return { success: false, error: error.message };
  }
};

export default {
  useGoogleAuth,
  handleGoogleResponse,
  sendPhoneOTP,
  verifyPhoneOTP,
  signOut,
  getCurrentUser,
  isAuthenticated,
  updateUserProfile,
  saveUserProfile,
};