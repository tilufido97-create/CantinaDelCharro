export const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';

export const isGoogleMapsConfigured = () => {
  return GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE';
};

export const STORE_LOCATION = {
  lat: -16.5000,
  lng: -68.1500,
  address: 'Av. Arce 2234, Sopocachi, La Paz, Bolivia',
  zone: 'Sopocachi',
  city: 'La Paz',
  country: 'Bolivia'
};

export const DELIVERY_CONFIG = {
  MAX_DELIVERY_DISTANCE: 15,
  MIN_DELIVERY_DISTANCE: 0.5,
  SHORT_DISTANCE_MAX: 3,
  MEDIUM_DISTANCE_MAX: 7,
  PREPARATION_TIME_MINUTES: 10
};

export const MESSAGES = {
  NO_VEHICLES_AVAILABLE: 'No hay vehículos disponibles en este momento. Por favor intenta más tarde.',
  GOOGLE_MAPS_ERROR: 'No se pudo calcular la distancia. Usando estimación aproximada.',
  ADDRESS_NOT_FOUND: 'No se pudo encontrar la dirección. Verifica que sea correcta.',
  DISTANCE_TOO_FAR: `La dirección está fuera de nuestra zona de cobertura (máximo ${15} km).`,
  API_KEY_NOT_CONFIGURED: 'Google Maps no está configurado. Contacta al administrador.'
};

export const FEATURES = {
  GOOGLE_MAPS_ENABLED: true,
  REAL_TIME_TRACKING: true,
  PAYMENT_GATEWAY: false,
  PUSH_NOTIFICATIONS: true,
  LOYALTY_PROGRAM: true,
  GAMES: true
};

export default {
  GOOGLE_MAPS_API_KEY,
  STORE_LOCATION,
  DELIVERY_CONFIG,
  MESSAGES,
  FEATURES,
  isGoogleMapsConfigured
};
