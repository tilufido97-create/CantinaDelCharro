export const VEHICLE_TYPES = {
  MOTO: 'moto',
  AUTO: 'auto',
  PICKUP: 'pickup'
};

export const VEHICLE_STATUS = {
  ACTIVE: 'activo',
  MAINTENANCE: 'mantenimiento',
  INACTIVE: 'inactivo'
};

export const FUEL_TYPES = {
  GASOLINA_ESPECIAL: 'gasolinaEspecial',
  GASOLINA_PREMIUM: 'gasolinaPremium',
  DIESEL: 'diesel',
  GNV: 'gnv'
};

export const DEFAULT_OPERATING_COSTS = {
  combustibles: {
    gasolinaEspecial: 3.74,
    gasolinaPremium: 4.86,
    diesel: 3.72,
    gnv: 1.50
  },
  lubricantes: {
    aceiteMotor: 45,
    aceiteTransmision: 50,
    liquidoFreno: 35,
    refrigerante: 25,
    cambioAceiteKM: 5000
  },
  mantenimiento: {
    revisionMenor: 150,
    revisionMayor: 800,
    cambioLlantas: 1200,
    afinamiento: 350
  },
  depreciacion: {
    moto: 0.05,
    auto: 0.08,
    pickup: 0.10
  },
  salarios: {
    salarioBaseMensual: 2500,
    comisionPorPedido: 5,
    comisionPorcentaje: 15,
    bonoDistanciaLarga: 10
  },
  pricing: {
    margenGananciaMinimo: 50,
    precioMinimoDelivery: 5,
    factorMultiplicador: 2.5,
    redondearA: 5
  },
  ultimaActualizacion: new Date().toISOString()
};

export const calculateVehicleCostPerKM = (vehicle, operatingCosts) => {
  const fuelType = vehicle.tipoCombustible || 'gasolinaEspecial';
  const fuelPrice = operatingCosts.combustibles[fuelType];
  const fuelCostPerKM = fuelPrice / vehicle.rendimientoKmLitro;
  
  const oilCostPerChange = operatingCosts.lubricantes.aceiteMotor * 4;
  const oilChangeInterval = operatingCosts.lubricantes.cambioAceiteKM;
  const oilCostPerKM = oilCostPerChange / oilChangeInterval;
  
  const maintenanceCostPerKM = 
    (operatingCosts.mantenimiento.revisionMenor / 5000) +
    (operatingCosts.mantenimiento.revisionMayor / 15000);
  
  const depreciationCostPerKM = operatingCosts.depreciacion[vehicle.tipo];
  
  const totalCostPerKM = 
    fuelCostPerKM + 
    oilCostPerKM + 
    maintenanceCostPerKM + 
    depreciationCostPerKM;
  
  return {
    costoCombustiblePorKM: parseFloat(fuelCostPerKM.toFixed(3)),
    costoAceitePorKM: parseFloat(oilCostPerKM.toFixed(3)),
    costoMantenimientoPorKM: parseFloat(maintenanceCostPerKM.toFixed(3)),
    costoDepreciacionPorKM: parseFloat(depreciationCostPerKM.toFixed(3)),
    costoTotalPorKM: parseFloat(totalCostPerKM.toFixed(3))
  };
};

export const calculateDeliveryPrice = (distanceKM, vehicle, operatingCosts) => {
  const costs = calculateVehicleCostPerKM(vehicle, operatingCosts);
  const operatingCost = costs.costoTotalPorKM * distanceKM;
  
  const pricing = operatingCosts.pricing;
  let clientPrice = operatingCost * pricing.factorMultiplicador;
  
  if (clientPrice < pricing.precioMinimoDelivery) {
    clientPrice = pricing.precioMinimoDelivery;
  }
  
  const roundTo = pricing.redondearA;
  clientPrice = Math.ceil(clientPrice / roundTo) * roundTo;
  
  const profit = clientPrice - operatingCost;
  const profitMargin = (profit / clientPrice) * 100;
  
  const deliveryCommission = 
    operatingCosts.salarios.comisionPorPedido +
    (clientPrice * operatingCosts.salarios.comisionPorcentaje / 100);
  
  const deliveryBonus = distanceKM > 7 ? operatingCosts.salarios.bonoDistanciaLarga : 0;
  const totalDelivery = deliveryCommission + deliveryBonus;
  const businessProfit = clientPrice - operatingCost - totalDelivery;
  
  return {
    distanceKM,
    operatingCost: parseFloat(operatingCost.toFixed(2)),
    clientPrice: parseFloat(clientPrice.toFixed(2)),
    profit: parseFloat(profit.toFixed(2)),
    profitMargin: parseFloat(profitMargin.toFixed(1)),
    distribution: {
      operatingCost: parseFloat(operatingCost.toFixed(2)),
      operatingPercent: parseFloat(((operatingCost / clientPrice) * 100).toFixed(1)),
      deliveryPay: parseFloat(totalDelivery.toFixed(2)),
      deliveryPercent: parseFloat(((totalDelivery / clientPrice) * 100).toFixed(1)),
      deliveryBreakdown: {
        commission: parseFloat(deliveryCommission.toFixed(2)),
        bonus: parseFloat(deliveryBonus.toFixed(2))
      },
      businessProfit: parseFloat(businessProfit.toFixed(2)),
      businessPercent: parseFloat(((businessProfit / clientPrice) * 100).toFixed(1))
    }
  };
};

export const selectOptimalVehicle = (distanceKM, availableVehicles, operatingCosts) => {
  let category;
  if (distanceKM <= 3) category = 'short';
  else if (distanceKM <= 7) category = 'medium';
  else category = 'long';
  
  const analysis = availableVehicles.map(vehicle => {
    const costs = calculateVehicleCostPerKM(vehicle, operatingCosts);
    const operatingCost = costs.costoTotalPorKM * distanceKM;
    const estimatedTime = (distanceKM / vehicle.velocidadPromedioKmH) * 60;
    
    let score = 0;
    if (category === 'short') {
      score = (vehicle.velocidadPromedioKmH * 0.7) - (operatingCost * 0.3);
    } else if (category === 'medium') {
      score = (vehicle.velocidadPromedioKmH * 0.5) - (operatingCost * 0.5);
    } else {
      score = (vehicle.rendimientoKmLitro * 0.7) - (operatingCost * 0.3);
    }
    
    return {
      vehicle,
      operatingCost,
      estimatedTime: Math.round(estimatedTime),
      score,
      efficiency: vehicle.rendimientoKmLitro
    };
  });
  
  analysis.sort((a, b) => b.score - a.score);
  
  const optimal = analysis[0];
  const pricing = calculateDeliveryPrice(distanceKM, optimal.vehicle, operatingCosts);
  
  return {
    recommended: optimal.vehicle,
    category,
    estimatedTime: optimal.estimatedTime,
    pricing,
    alternatives: analysis.slice(1, 3).map(a => ({
      vehicle: a.vehicle,
      estimatedTime: a.estimatedTime,
      pricing: calculateDeliveryPrice(distanceKM, a.vehicle, operatingCosts)
    }))
  };
};

export const calculateFleetStatistics = (vehicles) => {
  if (!vehicles || vehicles.length === 0) {
    return {
      total: 0,
      active: 0,
      maintenance: 0,
      inactive: 0,
      totalKMToday: 0,
      totalOrdersToday: 0,
      totalRevenueToday: 0,
      avgEfficiency: 0,
      avgCostPerKM: 0
    };
  }
  
  const stats = vehicles.reduce((acc, v) => {
    acc.total++;
    if (v.estado === 'activo') acc.active++;
    if (v.estado === 'mantenimiento') acc.maintenance++;
    if (v.estado === 'inactivo') acc.inactive++;
    
    acc.totalKMToday += v.kmRecorridosHoy || 0;
    acc.totalOrdersToday += v.pedidosHoy || 0;
    acc.totalRevenueToday += v.ingresosHoy || 0;
    acc.totalKM += v.kmRecorridos || 0;
    acc.totalOrders += v.pedidosCompletados || 0;
    acc.totalRevenue += v.ingresosTotales || 0;
    
    acc.efficiencySum += v.consumoPromedioReal || v.rendimientoKmLitro;
    acc.costSum += v.costoTotalPorKM || 0;
    
    return acc;
  }, {
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
    totalKMToday: 0,
    totalOrdersToday: 0,
    totalRevenueToday: 0,
    totalKM: 0,
    totalOrders: 0,
    totalRevenue: 0,
    efficiencySum: 0,
    costSum: 0
  });
  
  stats.avgEfficiency = parseFloat((stats.efficiencySum / stats.total).toFixed(1));
  stats.avgCostPerKM = parseFloat((stats.costSum / stats.total).toFixed(3));
  stats.avgKMPerVehicle = Math.round(stats.totalKM / stats.total);
  
  return stats;
};

export const validatePlate = (plate) => {
  const regex = /^[A-Z]{2,3}-\d{4}$/;
  return regex.test(plate);
};

export const checkMaintenanceDue = (vehicle) => {
  const kmSinceLastMaintenance = 
    vehicle.kmRecorridos - (vehicle.kmUltimoMantenimiento || 0);
  
  const kmUntilNext = vehicle.proximoMantenimiento - kmSinceLastMaintenance;
  
  return {
    isDue: kmUntilNext <= 0,
    isNear: kmUntilNext <= 500 && kmUntilNext > 0,
    kmRemaining: kmUntilNext,
    message: kmUntilNext <= 0 
      ? 'Mantenimiento vencido' 
      : `Faltan ${kmUntilNext} km`
  };
};

export const formatCurrency = (amount) => {
  return `Bs ${amount.toFixed(2)}`;
};

export const generateVehicleId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `VEH-${timestamp}-${random}`;
};
