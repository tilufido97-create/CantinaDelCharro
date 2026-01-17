import AsyncStorage from '@react-native-async-storage/async-storage';

// Simular envío de OTP
export const sendOTP = async (phoneNumber) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log(`OTP enviado a ${phoneNumber}`);
  
  return {
    success: true,
    message: 'Código enviado correctamente'
  };
};

// Simular verificación de OTP
export const verifyOTP = async (phoneNumber, code) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock: cualquier código de 6 dígitos funciona
  if (code.length === 6) {
    return {
      success: true,
      token: 'mock_jwt_token_12345',
      user: {
        phone: phoneNumber,
        isNewUser: true
      }
    };
  }
  
  return {
    success: false,
    message: 'Código incorrecto'
  };
};

// Guardar perfil
export const saveUserProfile = async (profileData) => {
  await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
  return { success: true };
};

// Obtener perfil
export const getUserProfile = async () => {
  const profile = await AsyncStorage.getItem('userProfile');
  return profile ? JSON.parse(profile) : null;
};

// Verificar si usuario está autenticado
export const isAuthenticated = async () => {
  const profile = await getUserProfile();
  return profile !== null;
};

// Cerrar sesión
export const logout = async () => {
  await AsyncStorage.removeItem('userProfile');
  return { success: true };
};
