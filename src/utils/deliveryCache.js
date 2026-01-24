import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'delivery_calculation_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos en milisegundos

/**
 * Obtener cálculo en caché
 * @param {String} address - Dirección completa
 * @returns {Object|null} - Cálculo o null si no existe/expiró
 */
export const get = async (address) => {
  try {
    const cacheJson = await AsyncStorage.getItem(CACHE_KEY);
    if (!cacheJson) return null;
    
    const cache = JSON.parse(cacheJson);
    const normalizedAddress = normalizeAddress(address);
    const cached = cache[normalizedAddress];
    
    if (!cached) return null;
    
    // Verificar si expiró
    const now = Date.now();
    const cachedTime = new Date(cached.calculatedAt).getTime();
    const age = now - cachedTime;
    
    if (age > CACHE_TTL) {
      console.log('🗑️ Caché expirado para:', address);
      await remove(address);
      return null;
    }
    
    console.log('✅ Usando caché para:', address);
    return cached;
    
  } catch (error) {
    console.error('Error obteniendo caché:', error);
    return null;
  }
};

/**
 * Guardar cálculo en caché
 * @param {String} address - Dirección completa
 * @param {Object} calculation - Objeto de cálculo
 */
export const set = async (address, calculation) => {
  try {
    const cacheJson = await AsyncStorage.getItem(CACHE_KEY);
    const cache = cacheJson ? JSON.parse(cacheJson) : {};
    
    const normalizedAddress = normalizeAddress(address);
    cache[normalizedAddress] = {
      ...calculation,
      cachedAt: new Date().toISOString()
    };
    
    // Limitar tamaño de caché (max 50 direcciones)
    const keys = Object.keys(cache);
    if (keys.length > 50) {
      // Eliminar la más antigua
      const oldest = keys.reduce((prev, curr) => {
        return new Date(cache[curr].cachedAt) < new Date(cache[prev].cachedAt) ? curr : prev;
      });
      delete cache[oldest];
    }
    
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('💾 Guardado en caché:', address);
    
  } catch (error) {
    console.error('Error guardando en caché:', error);
  }
};

/**
 * Eliminar entrada del caché
 * @param {String} address - Dirección a eliminar
 */
export const remove = async (address) => {
  try {
    const cacheJson = await AsyncStorage.getItem(CACHE_KEY);
    if (!cacheJson) return;
    
    const cache = JSON.parse(cacheJson);
    const normalizedAddress = normalizeAddress(address);
    delete cache[normalizedAddress];
    
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    
  } catch (error) {
    console.error('Error eliminando caché:', error);
  }
};

/**
 * Limpiar todo el caché
 */
export const clear = async () => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Caché limpiado');
  } catch (error) {
    console.error('Error limpiando caché:', error);
  }
};

/**
 * Verificar si un cálculo en caché es válido
 * @param {Object} cached - Objeto cacheado
 * @returns {Boolean}
 */
export const isValid = (cached) => {
  if (!cached || !cached.calculatedAt) return false;
  
  const now = Date.now();
  const cachedTime = new Date(cached.calculatedAt).getTime();
  const age = now - cachedTime;
  
  return age <= CACHE_TTL;
};

/**
 * Normalizar dirección para usar como key
 * (eliminar espacios extra, convertir a minúsculas, etc)
 * @param {String} address
 * @returns {String}
 */
const normalizeAddress = (address) => {
  return address
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/,\s*/g, ',');
};

/**
 * Obtener estadísticas del caché
 * @returns {Object} - { size, oldest, newest }
 */
export const getStats = async () => {
  try {
    const cacheJson = await AsyncStorage.getItem(CACHE_KEY);
    if (!cacheJson) return { size: 0 };
    
    const cache = JSON.parse(cacheJson);
    const keys = Object.keys(cache);
    
    if (keys.length === 0) return { size: 0 };
    
    const times = keys.map(key => new Date(cache[key].cachedAt).getTime());
    
    return {
      size: keys.length,
      oldest: new Date(Math.min(...times)),
      newest: new Date(Math.max(...times))
    };
    
  } catch (error) {
    console.error('Error obteniendo stats:', error);
    return { size: 0 };
  }
};

export default {
  get,
  set,
  remove,
  clear,
  isValid,
  getStats
};
