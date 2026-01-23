export const calculateDailyKPIs = (orders, transactions, targetDate) => {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const dayOrders = orders.filter(order => {
    const orderDate = new Date(order.fecha || order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === target.getTime();
  });

  const completedOrders = dayOrders.filter(o => o.estado === 'completado' || o.status === 'delivered');
  const ventas = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  const dayTransactions = transactions.filter(t => {
    const tDate = new Date(t.fecha);
    tDate.setHours(0, 0, 0, 0);
    return tDate.getTime() === target.getTime();
  });

  const ingresos = dayTransactions
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const gastos = dayTransactions
    .filter(t => t.tipo !== 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);

  const profit = ingresos - gastos;
  const ticketPromedio = completedOrders.length > 0 ? ventas / completedOrders.length : 0;

  return {
    ventas,
    profit,
    pedidos: dayOrders.length,
    pedidosCompletados: completedOrders.length,
    ticketPromedio,
    ingresos,
    gastos
  };
};

export const comparePeriods = (current, previous) => {
  const calculateChange = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  return {
    ventasCambio: calculateChange(current.ventas, previous.ventas),
    ventasDiff: current.ventas - previous.ventas,
    profitCambio: calculateChange(current.profit, previous.profit),
    profitDiff: current.profit - previous.profit,
    pedidosCambio: calculateChange(current.pedidos, previous.pedidos),
    pedidosDiff: current.pedidos - previous.pedidos,
    ticketPromedioCambio: calculateChange(current.ticketPromedio, previous.ticketPromedio),
    ticketPromedioDiff: current.ticketPromedio - previous.ticketPromedio
  };
};

export const generateTimelineData = (orders, transactions, days = 30) => {
  const timeline = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const kpis = calculateDailyKPIs(orders, transactions, date);
    
    timeline.push({
      fecha: date.toISOString().split('T')[0],
      fechaLabel: `${date.getDate()} ${date.toLocaleDateString('es-BO', { month: 'short' })}`,
      ingresos: kpis.ingresos,
      gastos: kpis.gastos,
      profit: kpis.profit,
      pedidos: kpis.pedidos
    });
  }
  
  return timeline;
};

export const calculateTopProducts = (orders, limit = 5) => {
  const productMap = {};
  
  orders
    .filter(o => o.estado === 'completado' || o.status === 'delivered')
    .forEach(order => {
      (order.productos || order.items || []).forEach(item => {
        if (!productMap[item.id]) {
          productMap[item.id] = {
            id: item.id,
            nombre: item.nombre || item.name,
            categoria: item.categoria || item.category || 'Sin categoría',
            cantidadVendida: 0,
            ingresos: 0
          };
        }
        productMap[item.id].cantidadVendida += item.cantidad || item.quantity || 1;
        productMap[item.id].ingresos += (item.precio || item.price || 0) * (item.cantidad || item.quantity || 1);
      });
    });

  const products = Object.values(productMap);
  const totalIngresos = products.reduce((sum, p) => sum + p.ingresos, 0);
  
  return products
    .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
    .slice(0, limit)
    .map(p => ({
      ...p,
      porcentaje: totalIngresos > 0 ? (p.ingresos / totalIngresos) * 100 : 0
    }));
};

export const calculatePeakHours = (orders) => {
  const hourCounts = Array(24).fill(0);
  
  orders.forEach(order => {
    const date = new Date(order.fecha || order.createdAt);
    const hour = date.getHours();
    hourCounts[hour]++;
  });

  const promedio = hourCounts.reduce((sum, count) => sum + count, 0) / 24;
  
  return hourCounts.map((pedidos, hora) => ({
    hora,
    pedidos,
    esPico: pedidos > promedio
  }));
};

export const calculateConversionRate = (users, orders) => {
  if (!users || users.length === 0) return 0;
  const usersWithOrders = new Set(orders.map(o => o.clienteId || o.userId)).size;
  return (usersWithOrders / users.length) * 100;
};

export const detectAnomalies = (timelineData) => {
  if (timelineData.length < 7) return [];
  
  const values = timelineData.map(d => d.profit);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  );
  
  return timelineData
    .filter(d => Math.abs(d.profit - mean) > stdDev * 2)
    .map(d => ({
      fecha: d.fecha,
      profit: d.profit,
      tipo: d.profit > mean ? 'alto' : 'bajo'
    }));
};

export const predictNextDayRevenue = (timelineData) => {
  if (timelineData.length < 7) return 0;
  
  const recent = timelineData.slice(-7);
  const avg = recent.reduce((sum, d) => sum + d.ingresos, 0) / recent.length;
  
  return Math.round(avg);
};
