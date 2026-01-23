import { GOOGLE_MAPS_API_KEY, STORE_LOCATION } from '../constants/config';

export { STORE_LOCATION };

const toRad = (degrees) => degrees * (Math.PI / 180);

const calculateLinearDistance = (origin, destination) => {
  if (!origin.lat || !destination.lat) {
    return {
      distanceKM: 5.0,
      distanceText: '~5 km',
      durationMinutes: 15,
      estimatedDurationMinutes: 20,
      durationText: '~15 min',
      isFallback: true,
      message: 'Distancia estimada (sin Google Maps)'
    };
  }
  
  const R = 6371;
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  const adjustedDistance = distance * 1.4;
  const distanceKM = parseFloat(adjustedDistance.toFixed(2));
  const durationMinutes = Math.ceil((distanceKM / 30) * 60);
  
  return {
    distanceKM,
    distanceText: `~${distanceKM} km`,
    durationMinutes,
    estimatedDurationMinutes: Math.ceil(durationMinutes * 1.3),
    durationText: `~${durationMinutes} min`,
    isFallback: true,
    message: 'Distancia lineal estimada'
  };
};

export const calculateDistance = async (origin, destination) => {
  try {
    const originStr = origin.lat 
      ? `${origin.lat},${origin.lng}`
      : encodeURIComponent(origin.address);
    
    const destinationStr = destination.lat
      ? `${destination.lat},${destination.lng}`
      : encodeURIComponent(destination.address);
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&mode=driving&language=es&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('🗺️ Calculando distancia con Google Maps...');
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }
    
    const element = data.rows[0].elements[0];
    
    if (element.status !== 'OK') {
      throw new Error(`Route calculation error: ${element.status}`);
    }
    
    const result = {
      distanceMeters: element.distance.value,
      distanceKM: parseFloat((element.distance.value / 1000).toFixed(2)),
      distanceText: element.distance.text,
      
      durationSeconds: element.duration.value,
      durationMinutes: Math.ceil(element.duration.value / 60),
      durationText: element.duration.text,
      
      estimatedDurationMinutes: Math.ceil((element.duration.value / 60) * 1.3),
      
      origin: {
        lat: origin.lat || null,
        lng: origin.lng || null,
        address: origin.address || null
      },
      destination: {
        lat: destination.lat || null,
        lng: destination.lng || null,
        address: destination.address || null
      },
      
      calculatedAt: new Date().toISOString()
    };
    
    console.log('✅ Distancia calculada:', result.distanceKM, 'km');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error calculando distancia:', error);
    console.log('⚠️ Usando cálculo de distancia lineal como fallback');
    return calculateLinearDistance(origin, destination);
  }
};

export const geocodeAddress = async (address) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('📍 Geocodificando dirección...');
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' || data.results.length === 0) {
      throw new Error(`Geocoding error: ${data.status}`);
    }
    
    const location = data.results[0].geometry.location;
    const formattedAddress = data.results[0].formatted_address;
    
    console.log('✅ Dirección geocodificada');
    
    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress,
      placeId: data.results[0].place_id,
      addressComponents: data.results[0].address_components
    };
    
  } catch (error) {
    console.error('❌ Error geocodificando dirección:', error);
    throw error;
  }
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' || data.results.length === 0) {
      throw new Error(`Reverse geocoding error: ${data.status}`);
    }
    
    return data.results[0].formatted_address;
    
  } catch (error) {
    console.error('❌ Error reverse geocoding:', error);
    return `Lat: ${lat}, Lng: ${lng}`;
  }
};

export const getDirectionsPolyline = async (origin, destination) => {
  try {
    const originStr = `${origin.lat},${origin.lng}`;
    const destStr = `${destination.lat},${destination.lng}`;
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' || data.routes.length === 0) {
      throw new Error(`Directions error: ${data.status}`);
    }
    
    const route = data.routes[0];
    
    return {
      polyline: route.overview_polyline.points,
      bounds: route.bounds,
      legs: route.legs,
      distance: route.legs[0].distance,
      duration: route.legs[0].duration,
      steps: route.legs[0].steps.map(step => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance.text,
        duration: step.duration.text
      }))
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo ruta:', error);
    return null;
  }
};

export const validateApiKey = async () => {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ Google Maps API Key no configurada');
    return false;
  }
  
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=La%20Paz,%20Bolivia&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'REQUEST_DENIED') {
      console.error('❌ API Key inválida o sin permisos');
      return false;
    }
    
    console.log('✅ Google Maps API Key válida');
    return true;
    
  } catch (error) {
    console.error('❌ Error validando API Key:', error);
    return false;
  }
};
