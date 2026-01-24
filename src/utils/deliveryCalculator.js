export const VEHICLE_COSTS = {
  moto: {
    combustible: 0.80,
    aceite: 0.20,
    mantenimiento: 0.30,
    total: 1.30
  },
  auto: {
    combustible: 1.50,
    aceite: 0.30,
    mantenimiento: 0.50,
    total: 2.30
  }
};

export function calculateDeliveryFee(distanceKm) {
  // Validar que distanceKm sea un número válido
  if (!distanceKm || typeof distanceKm !== 'number' || isNaN(distanceKm)) {
    console.warn('⚠️ distanceKm inválido:', distanceKm);
    return {
      distance: 0,
      vehicle: 'moto',
      baseCost: 0,
      profit: 0,
      total: 0,
      breakdown: '🏍️ Moto • 0.0 km'
    };
  }
  
  const vehicle = distanceKm <= 3 ? 'moto' : 'auto';
  const baseCost = VEHICLE_COSTS[vehicle].total * distanceKm;
  const profit = baseCost * 0.05;
  const total = baseCost + profit;
  
  return {
    distance: parseFloat(distanceKm.toFixed(1)),
    vehicle: vehicle,
    baseCost: parseFloat(baseCost.toFixed(2)),
    profit: parseFloat(profit.toFixed(2)),
    total: Math.ceil(total),
    breakdown: `${vehicle === 'moto' ? '🏍️ Moto' : '🚗 Auto'} • ${distanceKm.toFixed(1)} km`
  };
}

export function isWithinServiceHours() {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (isBolivianHoliday(now)) {
    return {
      isOpen: true,
      message: '🎉 Servicio 24/7 por feriado',
      closesAt: null
    };
  }
  
  const isOpen = currentHour >= 19 || currentHour < 5;
  
  if (isOpen) {
    return {
      isOpen: true,
      message: '✅ Abierto ahora • Hasta las 05:00 AM',
      closesAt: '05:00 AM'
    };
  } else {
    return {
      isOpen: false,
      message: '⚠️ Cerrado temporalmente • Abrimos a las 7:00 PM',
      opensAt: '7:00 PM'
    };
  }
}

export function isBolivianHoliday(date) {
  const holidays = [
    '2025-01-01',
    '2025-01-22',
    '2025-02-19',
    '2025-04-03',
    '2025-04-04',
    '2025-05-01',
    '2025-06-19',
    '2025-06-21',
    '2025-08-06',
    '2025-11-02',
    '2025-12-25',
  ];
  
  const dateStr = date.toISOString().split('T')[0];
  return holidays.includes(dateStr);
}

export function validateMinimumOrder(subtotal, deliveryType) {
  const MINIMUM_DELIVERY = 50;
  
  if (deliveryType === 'pickup') {
    return { isValid: true };
  }
  
  if (subtotal < MINIMUM_DELIVERY) {
    return {
      isValid: false,
      message: `El monto mínimo para delivery es Bs ${MINIMUM_DELIVERY}`,
      missing: MINIMUM_DELIVERY - subtotal
    };
  }
  
  return { isValid: true };
}
