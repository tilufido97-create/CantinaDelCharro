export const GOAL_PERIODS = {
  DAILY: 'diaria',
  WEEKLY: 'semanal',
  MONTHLY: 'mensual'
};

export const DISTRIBUTION_CATEGORIES = {
  REINVERSION: 'reinversion',
  SALARIOS: 'salarios',
  PROFIT_NETO: 'profitNeto'
};

export const DEFAULT_DISTRIBUTION = {
  reinversion: 40,
  salarios: 30,
  profitNeto: 30
};

export const DEFAULT_GOALS = {
  diaria: 1000,
  semanal: 7000,
  mensual: 30000
};

export const calculateProfitByPeriod = (transactions, period) => {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      break;
    default:
      startDate = new Date(0);
  }
  
  const filtered = transactions.filter(t => new Date(t.fecha) >= startDate);
  const ingresos = filtered.filter(t => t.tipo === 'ingreso_venta').reduce((sum, t) => sum + t.monto, 0);
  const gastos = filtered.filter(t => t.tipo.startsWith('gasto_')).reduce((sum, t) => sum + t.monto, 0);
  
  return {
    ingresos,
    gastos,
    profit: ingresos - gastos,
    transacciones: filtered.length
  };
};

export const calculateGoalProgress = (transactions, goal, period) => {
  const { profit } = calculateProfitByPeriod(transactions, period);
  const percentage = goal > 0 ? (profit / goal) * 100 : 0;
  
  return {
    actual: profit,
    porcentaje: parseFloat(percentage.toFixed(2)),
    alcanzada: profit >= goal,
    faltante: Math.max(0, goal - profit)
  };
};

export const distributeProfit = (profitAmount, distribution) => {
  return {
    reinversion: (profitAmount * distribution.reinversion) / 100,
    salarios: (profitAmount * distribution.salarios) / 100,
    profitNeto: (profitAmount * distribution.profitNeto) / 100
  };
};

export const calculateBreakEven = (transactions) => {
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.fecha);
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    return date >= monthAgo;
  });
  
  const gastosOperativos = monthTransactions
    .filter(t => t.tipo === 'gasto_operativos')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const gastosSalarios = monthTransactions
    .filter(t => t.tipo === 'gasto_salarios')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const costosFijos = gastosOperativos + gastosSalarios;
  
  const ingresos = monthTransactions
    .filter(t => t.tipo === 'ingreso_venta')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const gastos = monthTransactions
    .filter(t => t.tipo.startsWith('gasto_'))
    .reduce((sum, t) => sum + t.monto, 0);
  
  const margen = ingresos > 0 ? ((ingresos - gastos) / ingresos) * 100 : 0;
  const breakEvenPoint = margen > 0 ? costosFijos / (margen / 100) : 0;
  
  const promedioDiario = ingresos / 30;
  const diasNecesarios = promedioDiario > 0 ? Math.ceil(breakEvenPoint / promedioDiario) : 0;
  
  return {
    costosFijos,
    margen: parseFloat(margen.toFixed(2)),
    breakEvenPoint: parseFloat(breakEvenPoint.toFixed(2)),
    diasNecesarios,
    ventasActuales: ingresos,
    alcanzado: ingresos >= breakEvenPoint
  };
};

export const calculateProfitMargin = (ingresos, gastos) => {
  if (ingresos === 0) return 0;
  return parseFloat((((ingresos - gastos) / ingresos) * 100).toFixed(2));
};

export const calculateROI = (inversion, ganancia) => {
  if (inversion === 0) return 0;
  return parseFloat((((ganancia - inversion) / inversion) * 100).toFixed(2));
};

export const projectFutureProfit = (transactions, days) => {
  const last30Days = transactions.filter(t => {
    const date = new Date(t.fecha);
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    return date >= monthAgo;
  });
  
  const { profit } = calculateProfitByPeriod(last30Days, 'month');
  const promedioDiario = profit / 30;
  
  return {
    proyeccion: promedioDiario * days,
    promedioDiario,
    dias: days
  };
};

export const identifyTopExpenseCategories = (transactions) => {
  const gastos = transactions.filter(t => t.tipo.startsWith('gasto_'));
  const grouped = {};
  
  gastos.forEach(t => {
    if (!grouped[t.categoria]) {
      grouped[t.categoria] = { total: 0, count: 0 };
    }
    grouped[t.categoria].total += t.monto;
    grouped[t.categoria].count++;
  });
  
  return Object.entries(grouped)
    .map(([categoria, data]) => ({ categoria, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
};

export const calculateDailyAverage = (transactions, metric) => {
  const last30Days = transactions.filter(t => {
    const date = new Date(t.fecha);
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    return date >= monthAgo;
  });
  
  let total = 0;
  
  if (metric === 'ingresos') {
    total = last30Days.filter(t => t.tipo === 'ingreso_venta').reduce((sum, t) => sum + t.monto, 0);
  } else if (metric === 'gastos') {
    total = last30Days.filter(t => t.tipo.startsWith('gasto_')).reduce((sum, t) => sum + t.monto, 0);
  } else if (metric === 'profit') {
    const ingresos = last30Days.filter(t => t.tipo === 'ingreso_venta').reduce((sum, t) => sum + t.monto, 0);
    const gastos = last30Days.filter(t => t.tipo.startsWith('gasto_')).reduce((sum, t) => sum + t.monto, 0);
    total = ingresos - gastos;
  }
  
  return total / 30;
};

export const comparePeriods = (transactions, period1, period2) => {
  const data1 = calculateProfitByPeriod(transactions, period1);
  const data2 = calculateProfitByPeriod(transactions, period2);
  
  const diferencia = data1.profit - data2.profit;
  const porcentual = data2.profit !== 0 ? (diferencia / data2.profit) * 100 : 0;
  
  return {
    periodo1: data1,
    periodo2: data2,
    diferencia,
    porcentual: parseFloat(porcentual.toFixed(2)),
    mejoro: diferencia > 0
  };
};

export const detectTrends = (transactions, days = 30) => {
  const filtered = transactions.filter(t => {
    const date = new Date(t.fecha);
    const now = new Date();
    const daysAgo = new Date(now);
    daysAgo.setDate(daysAgo.getDate() - days);
    return date >= daysAgo;
  });
  
  const firstHalf = filtered.slice(0, Math.floor(filtered.length / 2));
  const secondHalf = filtered.slice(Math.floor(filtered.length / 2));
  
  const profit1 = calculateProfitByPeriod(firstHalf, 'custom').profit;
  const profit2 = calculateProfitByPeriod(secondHalf, 'custom').profit;
  
  const diferencia = profit2 - profit1;
  const porcentaje = profit1 !== 0 ? (diferencia / profit1) * 100 : 0;
  
  let tendencia = 'estable';
  if (porcentaje > 10) tendencia = 'creciente';
  else if (porcentaje < -10) tendencia = 'decreciente';
  
  return {
    tendencia,
    porcentaje: parseFloat(porcentaje.toFixed(2)),
    prediccion: profit2 + diferencia
  };
};

export const calculateSeasonality = (transactions) => {
  const byDay = {};
  
  transactions.forEach(t => {
    if (t.tipo === 'ingreso_venta') {
      const date = new Date(t.fecha);
      const day = date.getDay();
      if (!byDay[day]) byDay[day] = 0;
      byDay[day] += t.monto;
    }
  });
  
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const sorted = Object.entries(byDay)
    .map(([day, total]) => ({ dia: days[day], total }))
    .sort((a, b) => b.total - a.total);
  
  return {
    mejorDia: sorted[0],
    peorDia: sorted[sorted.length - 1],
    patron: sorted
  };
};
