import { 
  getAuth, 
  signInWithCredential, 
  GoogleAuthProvider,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import app from '../config/firebaseConfig';
import { saveUserToDatabase, updateUserInDatabase } from './userService';

const auth = getAuth(app);

WebBrowser.maybeCompleteAuthSession();

// ============================================
// GOOGLE SIGN-IN (EXPO GO COMPATIBLE)
// ============================================

// Configuración de Google OAuth
const GOOGLE_CONFIG = {
  expoClientId: '981284006966-8qvqh9j3k5l6m7n8o9p0q1r2s3t4u5v6.apps.googleusercontent.com',
  iosClientId: '981284006966-ios.apps.googleusercontent.com',
  androidClientId: '981284006966-android.apps.googleusercontent.com',
  webClientId: '981284006966-web.apps.googleusercontent.com',
};

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CONFIG.expoClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
  });

  return { request, response, promptAsync };
};

export const handleGoogleResponse = async (response) => {
  if (response?.type === 'success') {
    const { id_token, access_token } = response.params;
    
    try {
      const credential = GoogleAuthProvider.credential(id_token, access_token);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber || null,
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('auth_token', user.uid);
      
      console.log('✅ Google Sign-In completado');
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Error en Firebase:', error);
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: 'Inicio de sesión cancelado' };
};

// ============================================
// PHONE AUTH SIMULADO (PARA DESARROLLO)
// ============================================

const MOCK_OTP = '123456';
let mockPhoneNumber = null;
let mockVerificationSent = false;

export const sendPhoneOTP = async (phoneNumber) => {
  try {
    console.log('📱 [DESARROLLO] Enviando código a:', phoneNumber);
    
    if (!phoneNumber.startsWith('+')) {
      return { success: false, error: 'El número debe incluir el código de país (+591)' };
    }
    
    mockPhoneNumber = phoneNumber;
    mockVerificationSent = true;
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ [DESARROLLO] Código: 123456');
    return { 
      success: true, 
      verificationId: 'mock-verification-id',
      message: `Código de prueba: ${MOCK_OTP}\n\n⚠️ En producción se enviará SMS real` 
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message || 'Error al enviar código' };
  }
};

export const verifyPhoneOTP = async (code) => {
  try {
    console.log('🔐 [DESARROLLO] Verificando código:', code);
    
    if (!mockVerificationSent || !mockPhoneNumber) {
      return { success: false, error: 'No hay verificación pendiente. Solicita un nuevo código.' };
    }
    
    if (code !== MOCK_OTP) {
      return { success: false, error: `Código incorrecto. Usa: ${MOCK_OTP}` };
    }
    
    const mockUid = `mock_${Date.now()}`;
    const userData = {
      uid: mockUid,
      phoneNumber: mockPhoneNumber,
      displayName: null,
      email: null,
      photoURL: null,
      provider: 'phone',
      createdAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    await AsyncStorage.setItem('auth_token', mockUid);
    
    mockVerificationSent = false;
    
    console.log('✅ [DESARROLLO] Autenticación exitosa');
    return { success: true, user: userData };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message || 'Error al verificar código' };
  }
};

// ============================================
// UTILIDADES
// ============================================

export const signOut = async () => {
  try {
    console.log('🚪 Cerrando sesión...');
    await auth.signOut();
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
