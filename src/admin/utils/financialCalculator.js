export const TRANSACTION_CATEGORIES = {
  VENTAS: 'ventas',
  INVENTARIO: 'inventario',
  SALARIOS: 'salarios',
  OPERATIVOS: 'operativos',
  OTROS: 'otros'
};

export const TRANSACTION_TYPES = {
  INGRESO: 'ingreso_venta',
  GASTO_INVENTARIO: 'gasto_inventario',
  GASTO_SALARIOS: 'gasto_salarios',
  GASTO_OPERATIVOS: 'gasto_operativos',
  GASTO_OTROS: 'gasto_otros'
};

export const PERIOD_FILTERS = {
  TODAY: 'hoy',
  WEEK: 'semana',
  MONTH: 'mes',
  ALL: 'todos'
};

export const calculateProfitMargin = (ingresos, gastos) => {
  if (ingresos === 0) return 0;
  const profit = ingresos - gastos;
  return parseFloat(((profit / ingresos) * 100).toFixed(2));
};

export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return `Bs ${num.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const calculateDailyAverage = (transactions, days) => {
  if (days === 0) return { ingresosPromedio: 0, gastosPromedio: 0, profitPromedio: 0 };
  
  const ingresos = transactions.filter(t => t.tipo === TRANSACTION_TYPES.INGRESO).reduce((sum, t) => sum + t.monto, 0);
  const gastos = transactions.filter(t => t.tipo.startsWith('gasto_')).reduce((sum, t) => sum + t.monto, 0);
  
  return {
    ingresosPromedio: ingresos / days,
    gastosPromedio: gastos / days,
    profitPromedio: (ingresos - gastos) / days
  };
};

export const groupTransactionsByDate = (transactions) => {
  return transactions.reduce((acc, t) => {
    const date = new Date(t.fecha).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {});
};

export const groupTransactionsByCategory = (transactions) => {
  return transactions.reduce((acc, t) => {
    const cat = t.categoria;
    if (!acc[cat]) acc[cat] = { count: 0, total: 0, transactions: [] };
    acc[cat].count++;
    acc[cat].total += t.monto;
    acc[cat].transactions.push(t);
    return acc;
  }, {});
};

export const filterTransactionsByPeriod = (transactions, period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate;
  switch (period) {
    case PERIOD_FILTERS.TODAY:
      startDate = today;
      break;
    case PERIOD_FILTERS.WEEK:
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case PERIOD_FILTERS.MONTH:
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30);
      break;
    case PERIOD_FILTERS.ALL:
    default:
      return transactions;
  }
  
  return transactions.filter(t => new Date(t.fecha) >= startDate);
};

export const filterTransactionsByDateRange = (transactions, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return transactions.filter(t => {
    const date = new Date(t.fecha);
    return date >= start && date <= end;
  });
};

export const validateTransactionData = (data) => {
  const errors = {};
  
  if (!data.monto || parseFloat(data.monto) <= 0) {
    errors.monto = 'El monto debe ser mayor a 0';
  }
  
  if (!data.descripcion || data.descripcion.trim().length < 5) {
    errors.descripcion = 'La descripción debe tener al menos 5 caracteres';
  }
  
  if (data.descripcion && data.descripcion.length > 200) {
    errors.descripcion = 'La descripción no puede exceder 200 caracteres';
  }
  
  if (!data.categoria || !Object.values(TRANSACTION_CATEGORIES).includes(data.categoria)) {
    errors.categoria = 'Categoría inválida';
  }
  
  if (data.fecha && new Date(data.fecha) > new Date()) {
    errors.fecha = 'No puedes registrar gastos futuros';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

export const generateTransactionId = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TXN-${dateStr}-${random}`;
};

export const exportTransactionsToCSV = (transactions) => {
  const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
  const rows = transactions.map(t => [
    new Date(t.fecha).toLocaleString('es-BO'),
    t.tipo.includes('ingreso') ? 'Ingreso' : 'Gasto',
    t.categoria,
    t.descripcion,
    t.monto.toFixed(2)
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  return csv;
};
