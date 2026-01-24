import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase
// IMPORTANTE: Reemplazar con tus credenciales de Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "la-cantina-del-charro.firebaseapp.com",
  projectId: "la-cantina-del-charro",
  storageBucket: "la-cantina-del-charro.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Inicializar Firebase (solo si no existe)
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
  }
} else {
  app = getApp();
  console.log('ℹ️ Firebase ya estaba inicializado');
}

// Servicios de Firebase
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Habilitar persistencia offline para Firestore (solo web)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Persistencia: Múltiples pestañas abiertas');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Persistencia: Navegador no soportado');
    }
  });
}

// Configuración de Storage
export const STORAGE_PATHS = {
  PRODUCTS: 'products',
  DELIVERIES: 'deliveries',
  USERS: 'users',
  ORDERS: 'orders'
};

// Configuración de Firestore
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  DELIVERIES: 'deliveries',
  ADMINS: 'admins',
  NOTIFICATIONS: 'notifications'
};

// Helper para verificar si Firebase está configurado
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
};

// Helper para manejar errores de Firebase
export const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  
  const errorMessages = {
    'permission-denied': 'No tienes permisos para realizar esta acción',
    'not-found': 'El documento no existe',
    'already-exists': 'El documento ya existe',
    'failed-precondition': 'Operación no permitida en el estado actual',
    'unavailable': 'Servicio temporalmente no disponible',
    'unauthenticated': 'Debes iniciar sesión para continuar'
  };
  
  return errorMessages[error.code] || 'Error desconocido. Intenta de nuevo.';
};

export default app;
