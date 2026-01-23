import AsyncStorage from '@react-native-async-storage/async-storage';
import * as googleMapsService from './googleMapsService';
import * as fleetCalculator from '../admin/utils/fleetCalculator';

export const calculateOptimalDelivery = async (destinationAddress, orderDetails = {}) => {
  try {
    console.log('🚀 Iniciando cálculo de delivery óptimo...');
    
    let destinationCoords;
    try {
      destinationCoords = await googleMapsService.geocodeAddress(destinationAddress);
    } catch (error) {
      console.log('⚠️ No se pudo geocodificar, usando coordenadas aproximadas');
      destinationCoords = { lat: -16.52, lng: -68.12 };
    }
    
    const distanceData = await googleMapsService.calculateDistance(
      googleMapsService.STORE_LOCATION,
      destinationCoords
    );
    
    console.log(`📏 Distancia calculada: ${distanceData.distanceKM} km`);
    
    const vehiclesJson = await AsyncStorage.getItem('fleet_vehicles');
    const allVehicles = vehiclesJson ? JSON.parse(vehiclesJson) : [];
    
    const availableVehicles = allVehicles.filter(v => 
      v.estado === 'activo' && 
      (v.deliveryAsignado === null || v.deliveryAsignado === undefined)
    );
    
    if (availableVehicles.length === 0) {
      throw new Error('NO_VEHICLES_AVAILABLE');
    }
    
    console.log(`🚗 Vehículos disponibles: ${availableVehicles.length}`);
    
    const costsJson = await AsyncStorage.getItem('operating_costs');
    const operatingCosts = costsJson 
      ? JSON.parse(costsJson) 
      : fleetCalculator.DEFAULT_OPERATING_COSTS;
    
    const optimization = fleetCalculator.selectOptimalVehicle(
      distanceData.distanceKM,
      availableVehicles,
      operatingCosts
    );
    
    console.log(`✅ Vehículo seleccionado: ${optimization.recommended.marca} ${optimization.recommended.modelo}`);
    
    const pricing = optimization.pricing;
    
    let route = null;
    try {
      route = await googleMapsService.getDirectionsPolyline(
        googleMapsService.STORE_LOCATION,
        destinationCoords
      );
    } catch (error) {
      console.log('⚠️ No se pudo obtener ruta detallada');
    }
    
    const result = {
      distance: {
        km: distanceData.distanceKM,
        text: distanceData.distanceText,
        meters: distanceData.distanceMeters
      },
      
      duration: {
        minutes: distanceData.estimatedDurationMinutes,
        text: `${distanceData.estimatedDurationMinutes} minutos`,
        traffic: distanceData.estimatedDurationMinutes > distanceData.durationMinutes 
          ? 'Tráfico considerado' 
          : 'Normal'
      },
      
      vehicle: {
        id: optimization.recommended.id,
        tipo: optimization.recommended.tipo,
        marca: optimization.recommended.marca,
        modelo: optimization.recommended.modelo,
        placa: optimization.recommended.placa,
        rendimiento: optimization.recommended.rendimientoKmLitro,
        velocidad: optimization.recommended.velocidadPromedioKmH,
        capacidad: optimization.recommended.capacidadCarga
      },
      
      category: optimization.category,
      categoryText: optimization.category === 'short' 
        ? 'Distancia Corta' 
        : optimization.category === 'medium' 
        ? 'Distancia Media' 
        : 'Distancia Larga',
      
      pricing: {
        operatingCost: pricing.operatingCost,
        clientPrice: pricing.clientPrice,
        profit: pricing.profit,
        profitMargin: pricing.profitMargin,
        distribution: pricing.distribution
      },
      
      origin: {
        address: googleMapsService.STORE_LOCATION.address,
        lat: googleMapsService.STORE_LOCATION.lat,
        lng: googleMapsService.STORE_LOCATION.lng
      },
      
      destination: {
        address: destinationAddress,
        formattedAddress: destinationCoords.formattedAddress || destinationAddress,
        lat: destinationCoords.lat,
        lng: destinationCoords.lng
      },
      
      route: route,
      alternatives: optimization.alternatives,
      calculatedAt: new Date().toISOString(),
      isFallback: distanceData.isFallback || false,
      orderDetails: orderDetails
    };
    
    console.log('🎉 Cálculo completado exitosamente');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error en calculateOptimalDelivery:', error);
    throw error;
  }
};

export const getDeliveryEstimate = async (distanceKM) => {
  try {
    const vehiclesJson = await AsyncStorage.getItem('fleet_vehicles');
    const allVehicles = vehiclesJson ? JSON.parse(vehiclesJson) : [];
    const availableVehicles = allVehicles.filter(v => v.estado === 'activo');
    
    if (availableVehicles.length === 0) {
      return getDefaultEstimate(distanceKM);
    }
    
    const costsJson = await AsyncStorage.getItem('operating_costs');
    const operatingCosts = costsJson 
      ? JSON.parse(costsJson) 
      : fleetCalculator.DEFAULT_OPERATING_COSTS;
    
    const prices = availableVehicles.map(vehicle => {
      const pricing = fleetCalculator.calculateDeliveryPrice(
        distanceKM,
        vehicle,
        operatingCosts
      );
      return pricing.clientPrice;
    });
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    
    return {
      distanceKM,
      priceRange: {
        min: minPrice,
        max: maxPrice,
        average: avgPrice
      },
      priceText: minPrice === maxPrice 
        ? `Bs ${minPrice}` 
        : `Bs ${minPrice} - ${maxPrice}`,
      estimatedTime: Math.ceil((distanceKM / 35) * 60),
      isEstimate: true
    };
    
  } catch (error) {
    console.error('Error en estimación:', error);
    return getDefaultEstimate(distanceKM);
  }
};

const getDefaultEstimate = (distanceKM) => {
  let price;
  if (distanceKM <= 3) price = 5;
  else if (distanceKM <= 7) price = 10;
  else price = 15;
  
  return {
    distanceKM,
    priceRange: { min: price, max: price, average: price },
    priceText: `Bs ${price}`,
    estimatedTime: Math.ceil((distanceKM / 30) * 60),
    isEstimate: true,
    isDefault: true
  };
};

export const validateDeliveryAvailability = async () => {
  try {
    const vehiclesJson = await AsyncStorage.getItem('fleet_vehicles');
    const allVehicles = vehiclesJson ? JSON.parse(vehiclesJson) : [];
    
    const activeVehicles = allVehicles.filter(v => v.estado === 'activo');
    const availableVehicles = activeVehicles.filter(v => !v.deliveryAsignado);
    const busyVehicles = activeVehicles.filter(v => v.deliveryAsignado);
    
    return {
      available: availableVehicles.length > 0,
      totalVehicles: allVehicles.length,
      activeVehicles: activeVehicles.length,
      availableVehicles: availableVehicles.length,
      busyVehicles: busyVehicles.length,
      message: availableVehicles.length > 0
        ? `${availableVehicles.length} vehículo(s) disponible(s)`
        : 'No hay vehículos disponibles en este momento'
    };
    
  } catch (error) {
    return {
      available: false,
      message: 'Error verificando disponibilidad'
    };
  }
};
