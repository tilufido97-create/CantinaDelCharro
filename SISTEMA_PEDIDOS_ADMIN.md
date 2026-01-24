# 📦 SISTEMA DE GESTIÓN DE PEDIDOS - PANEL ADMIN

## 🎯 FLUJO DE ESTADOS IMPLEMENTADO

### Estados del Pedido

1. **🟠 Pedido Realizado** (`pendiente`)
   - Cliente confirma su pedido
   - Aparece en panel admin automáticamente
   - Acciones: → Preparando Pedido | Cancelar

2. **🔵 Preparando Pedido** (`preparando`)
   - Admin marca que está preparando el pedido
   - Acciones: 
     - Si es PICKUP → Esperando Recojo
     - Si es DELIVERY → Esperando Delivery
     - Cancelar

3. **🟢 Esperando Recojo** (`listo_pickup`)
   - Para pedidos de recojo en local
   - Cliente debe pasar a recoger
   - Acciones: → Entregado | Cancelar

4. **🟣 Esperando Delivery** (`listo_delivery`)
   - Para pedidos con delivery
   - Esperando que delivery recoja el pedido
   - Acciones: → En Camino | Cancelar

5. **🟡 En Camino** (`en_camino`)
   - Delivery está llevando el pedido
   - Acciones: → Entregado | Cancelar

6. **✅ Entregado** (`entregado`)
   - Pedido completado exitosamente
   - Estado final

7. **❌ Cancelado** (`cancelado`)
   - Pedido cancelado (stock restaurado automáticamente)
   - Estado final

---

## 📱 INTERFAZ DEL PANEL ADMIN

### Vista Principal

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Buscar pedidos...              🔄 Actualizar     │
├─────────────────────────────────────────────────────┤
│ [Nuevos: 3] [Preparando: 2] [En Camino: 1] [Hoy: 8]│
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ #ORDER_20250119_001    🟠 Pedido Realizado   │  │
│  │ 19 ene, 14:30                                │  │
│  │                                              │  │
│  │ 👤 Juan Pérez                                │  │
│  │ 📍 Av. Arce 2450, Sopocachi                  │  │
│  │                                              │  │
│  │ 3 productos                      Bs 85.00    │  │
│  │                                              │  │
│  │ [Preparando Pedido]  [Cancelar]              │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ #ORDER_20250119_002    🔵 Preparando Pedido  │  │
│  │ 19 ene, 15:15                                │  │
│  │                                              │  │
│  │ 👤 María López                               │  │
│  │ 🏪 Recojo en Local                           │  │
│  │                                              │  │
│  │ 2 productos                      Bs 45.00    │  │
│  │                                              │  │
│  │ [Esperando Recojo]  [Cancelar]               │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Características de las Tarjetas

- **Número de pedido** visible y destacado
- **Estado actual** con color e icono
- **Información del cliente** (nombre registrado en app)
- **Tipo de entrega** (delivery con dirección o pickup)
- **Detalle de productos** (cantidad)
- **Total del pedido**
- **Botones de acción** según estado actual

---

## 🔄 SINCRONIZACIÓN EN TIEMPO REAL

### Firebase Realtime Database

- ✅ Pedidos se actualizan automáticamente sin recargar
- ✅ Múltiples admins pueden ver cambios al instante
- ✅ Cliente ve actualizaciones de estado en su app
- ✅ Historial completo de cambios de estado

### Estructura en Firebase

```json
{
  "orders": {
    "ORDER_20250119_001": {
      "orderId": "ORDER_20250119_001",
      "orderNumber": "20250119_001",
      "customerName": "Juan Pérez",
      "customerPhone": "+59170123456",
      "deliveryType": "delivery",
      "deliveryAddress": {
        "zona": "Sopocachi",
        "street": "Av. Arce 2450",
        "reference": "Edificio azul"
      },
      "items": [
        {
          "productId": "prod_001",
          "name": "Cerveza Paceña",
          "quantity": 6,
          "price": 10
        }
      ],
      "subtotal": 60,
      "deliveryCost": 15,
      "total": 75,
      "paymentMethod": "cash",
      "status": "pendiente",
      "createdAt": "2025-01-19T14:30:00.000Z",
      "statusHistory": [
        {
          "status": "pendiente",
          "label": "Pedido Realizado",
          "timestamp": "2025-01-19T14:30:00.000Z"
        }
      ]
    }
  }
}
```

---

## 🎨 DISEÑO Y UX

### Colores de Estados

- 🟠 **Pendiente**: `#FF9500` (Naranja)
- 🔵 **Preparando**: `#007AFF` (Azul)
- 🟢 **Listo Pickup**: `#34C759` (Verde)
- 🟣 **Listo Delivery**: `#5856D6` (Morado)
- 🟡 **En Camino**: `#FFB800` (Dorado)
- ✅ **Entregado**: `#30D158` (Verde brillante)
- ❌ **Cancelado**: `#FF3B30` (Rojo)

### Iconos

- `receipt-outline`: Pedido realizado
- `restaurant-outline`: Preparando
- `checkmark-circle-outline`: Listo pickup
- `bicycle-outline`: Listo delivery
- `navigate-outline`: En camino
- `checkmark-done-outline`: Entregado
- `close-circle-outline`: Cancelado

---

## 🔧 FUNCIONALIDADES

### Filtros Rápidos

- **Nuevos**: Pedidos en estado `pendiente`
- **Preparando**: Pedidos en estado `preparando`
- **En Camino**: Pedidos en estado `en_camino`
- **Hoy**: Todos los pedidos del día actual

### Búsqueda

- Por número de pedido
- Por nombre de cliente
- Búsqueda en tiempo real

### Acciones

- **Cambiar estado**: Botones contextuales según estado actual
- **Cancelar pedido**: Restaura stock automáticamente
- **Ver detalles**: Modal con información completa (próximamente)

---

## 📊 VALIDACIONES

### Al Cambiar Estado

- ✅ Solo se muestran estados válidos según flujo
- ✅ Confirmación al cancelar pedido
- ✅ Registro en historial con timestamp

### Al Cancelar

- ✅ Restaura stock de todos los productos
- ✅ Re-habilita productos que quedaron sin stock
- ✅ Marca pedido como cancelado
- ✅ Registro en historial

---

## 🚀 PRÓXIMAS MEJORAS

1. **Modal de Detalles**
   - Ver productos completos
   - Ver historial de estados
   - Información de pago
   - Datos de contacto

2. **Asignación de Delivery**
   - Lista de deliveries disponibles
   - Asignar delivery a pedido
   - Tracking de delivery

3. **Notificaciones**
   - Sonido al recibir nuevo pedido
   - Badge con contador de pendientes
   - Notificaciones push

4. **Estadísticas**
   - Tiempo promedio de preparación
   - Pedidos por hora
   - Productos más vendidos

5. **Impresión**
   - Imprimir ticket de pedido
   - Imprimir resumen del día

---

## 🧪 CÓMO PROBAR

### 1. Crear Pedido desde App Móvil

```bash
# En la app móvil
1. Agregar productos al carrito
2. Ir a Checkout
3. Seleccionar delivery o pickup
4. Confirmar pedido
```

### 2. Ver en Panel Admin

```bash
# En el navegador web
1. Ir a http://localhost:19006
2. Login como admin
3. Ir a "Pedidos"
4. Ver pedido aparecer automáticamente
```

### 3. Cambiar Estados

```bash
1. Click en botón "Preparando Pedido"
2. Observar cambio de color y estado
3. Ver nuevos botones de acción
4. Continuar flujo hasta "Entregado"
```

### 4. Cancelar Pedido

```bash
1. Click en botón "Cancelar"
2. Confirmar cancelación
3. Verificar que stock se restauró
4. Ver pedido marcado como cancelado
```

---

## 📝 NOTAS TÉCNICAS

### Compatibilidad Web

- Usa `Platform.OS === 'web'` para detectar plataforma
- `window.alert()` en web, `Alert.alert()` en móvil
- `window.confirm()` en web para confirmaciones

### Performance

- Listener de Firebase se limpia al desmontar componente
- Filtros se aplican en cliente (rápido)
- Búsqueda en tiempo real sin lag

### Seguridad

- Solo admins autenticados pueden acceder
- Validaciones en cliente y servidor
- Historial inmutable de cambios

---

**Sistema de Pedidos: COMPLETO Y FUNCIONAL** 🚀💀🤠
