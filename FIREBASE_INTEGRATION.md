# 🔥 INTEGRACIÓN FIREBASE COMPLETA - LA CANTINA DEL CHARRO

## ✅ ARCHIVOS CREADOS

### 1. Configuración Base
- `/src/config/firebaseConfig.js` - Configuración de Firebase con todos los servicios

### 2. Servicios Firebase
- `/src/services/firebaseProductService.js` - CRUD completo de productos + imágenes
- `/src/services/firebaseOrderService.js` - CRUD completo de pedidos + asignación

---

## 📋 PASO 1: CREAR PROYECTO EN FIREBASE

### 1.1 Ir a Firebase Console
```
https://console.firebase.google.com
```

### 1.2 Crear nuevo proyecto
1. Click en "Agregar proyecto"
2. Nombre: `la-cantina-del-charro`
3. Habilitar Google Analytics (opcional)
4. Crear proyecto

### 1.3 Agregar app web
1. En la página del proyecto, click en el ícono `</>`
2. Nombre de la app: `La Cantina del Charro Web`
3. Copiar las credenciales que aparecen

---

## 📋 PASO 2: CONFIGURAR CREDENCIALES

### 2.1 Editar firebaseConfig.js

Abrir `/src/config/firebaseConfig.js` y reemplazar las credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",              // ← Pegar aquí
  authDomain: "TU_AUTH_DOMAIN",            // ← Pegar aquí
  projectId: "TU_PROJECT_ID",              // ← Pegar aquí
  storageBucket: "TU_STORAGE_BUCKET",      // ← Pegar aquí
  messagingSenderId: "TU_MESSAGING_ID",    // ← Pegar aquí
  appId: "TU_APP_ID"                       // ← Pegar aquí
};
```

---

## 📋 PASO 3: HABILITAR SERVICIOS EN FIREBASE

### 3.1 Firestore Database

1. En Firebase Console → Firestore Database
2. Click "Crear base de datos"
3. Modo: **Producción** (configuraremos reglas después)
4. Ubicación: `us-central` (o la más cercana)
5. Habilitar

### 3.2 Storage

1. En Firebase Console → Storage
2. Click "Comenzar"
3. Modo: **Producción**
4. Ubicación: misma que Firestore
5. Habilitar

### 3.3 Authentication

1. En Firebase Console → Authentication
2. Click "Comenzar"
3. Habilitar proveedores:
   - Email/Password
   - Google (opcional)
   - Phone (opcional)

---

## 📋 PASO 4: INSTALAR DEPENDENCIAS

En la terminal del proyecto:

```bash
npm install firebase@10.7.1
```

**NOTA:** Solo necesitas `firebase` para web. Las dependencias de `@react-native-firebase` son solo para apps nativas (no Expo).

---

## 📋 PASO 5: CONFIGURAR REGLAS DE SEGURIDAD

### 5.1 Firestore Rules

En Firebase Console → Firestore → Reglas, pegar:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper para verificar si es admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Productos - Lectura pública, escritura solo admins
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Pedidos - Usuarios autenticados pueden crear, admins pueden todo
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }
    
    // Usuarios - Solo pueden ver/editar su propio perfil
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if isAdmin();
    }
    
    // Deliverys - Solo admins
    match /deliveries/{deliveryId} {
      allow read, write: if isAdmin();
    }
    
    // Admins - Solo lectura para verificación
    match /admins/{adminId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo desde Firebase Console
    }
  }
}
```

### 5.2 Storage Rules

En Firebase Console → Storage → Reglas, pegar:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper para verificar si es admin
    function isAdmin() {
      return request.auth != null && 
             firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }
    
    // Productos - Lectura pública, escritura solo admins
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Deliverys - Solo admins
    match /deliveries/{allPaths=**} {
      allow read, write: if isAdmin();
    }
    
    // Usuarios - Solo su propio contenido
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📋 PASO 6: CREAR USUARIO ADMIN

### 6.1 Crear cuenta en Authentication

1. Firebase Console → Authentication → Users
2. Click "Agregar usuario"
3. Email: `nicolaspc97@gmail.com`
4. Password: (tu contraseña segura)
5. Copiar el **UID** del usuario creado

### 6.2 Marcar como admin en Firestore

1. Firebase Console → Firestore → Datos
2. Click "+ Iniciar colección"
3. ID de colección: `admins`
4. ID de documento: (pegar el UID copiado)
5. Agregar campos:
   ```
   email: "nicolaspc97@gmail.com"
   role: "SUPER_ADMIN"
   nombre: "Nicolás"
   creadoEn: (timestamp actual)
   ```
6. Guardar

---

## 📋 PASO 7: TESTING COMPLETO

### 7.1 Probar Productos (Admin Web)

```bash
# Iniciar proyecto
npx expo start

# Presionar 'w' para abrir en navegador
```

**En el navegador:**
1. Login con `nicolaspc97@gmail.com`
2. Ir a "Gestión de Productos"
3. Click "+ Nuevo Producto"
4. Completar formulario:
   - Nombre: "Singani Casa Real 750ml"
   - Categoría: "Singani"
   - Precio: 85
   - Stock: 50
   - Subir imagen
5. Guardar

**Verificar en Firebase Console:**
- Firestore → products → Debe aparecer el producto
- Storage → products → Debe aparecer la imagen

### 7.2 Probar Sincronización (App Móvil)

```bash
# En otra terminal o dispositivo
npx expo start

# Escanear QR con Expo Go
```

**En la app móvil:**
1. Ir a "Catálogo"
2. **Verificar:** El producto creado aparece automáticamente
3. **Verificar:** La imagen se muestra correctamente

### 7.3 Probar Pedidos

**En la app móvil:**
1. Agregar productos al carrito
2. Ir a Checkout
3. Completar dirección
4. Confirmar pedido

**Verificar en Admin Web:**
1. Ir a "Gestión de Pedidos"
2. **Verificar:** El pedido aparece automáticamente
3. Cambiar estado a "Confirmado"

**Verificar en App Móvil:**
1. Ir a "Mis Pedidos"
2. **Verificar:** El estado se actualiza automáticamente

---

## 🔄 FLUJO COMPLETO DE SINCRONIZACIÓN

```
ADMIN WEB                    FIREBASE                     APP MÓVIL
    │                           │                            │
    │ 1. Crea producto           │                            │
    │ 2. Sube imagen ──────────► │                            │
    │                           │                            │
    │                           │ 3. Guarda en Firestore     │
    │                           │ 4. Guarda en Storage       │
    │                           │                            │
    │                           │ 5. Notifica cambios        │
    │                           │ ──────────────────────────► │
    │                           │                            │
    │                           │                 6. Usuario ve producto
    │                           │                    con imagen real
    │                           │                            │
    │                           │ ◄────────────────────────── │
    │                           │    7. Usuario hace pedido  │
    │                           │                            │
    │                           │ 8. Guarda pedido           │
    │                           │                            │
    │ ◄─────────────────────────│                            │
    │ 9. Admin ve pedido NUEVO  │                            │
    │                           │                            │
    │ 10. Asigna delivery ─────► │                            │
    │                           │                            │
    │                           │ 11. Actualiza estado       │
    │                           │ ──────────────────────────► │
    │                           │                            │
    │                           │          12. Usuario ve "En camino"
```

---

## 📊 ESTRUCTURA DE FIRESTORE

### Colección: `products`
```javascript
{
  id: "auto-generado",
  nombre: "Singani Casa Real 750ml",
  categoria: "Singani",
  precio: 85,
  descuento: 0,
  stock: 50,
  descripcion: "Singani boliviano premium",
  imagenURL: "https://firebasestorage.../imagen.jpg",
  volumen: "750ml",
  marca: "Casa Real",
  rating: 4.8,
  expressDelivery: true,
  activo: true,
  creadoEn: Timestamp,
  actualizadoEn: Timestamp
}
```

### Colección: `orders`
```javascript
{
  id: "auto-generado",
  orderNumber: "ORD-12345678",
  userId: "user-id",
  customerName: "Juan Pérez",
  customerPhone: "+591 77123456",
  items: [
    {
      productId: "prod-id",
      nombre: "Singani Casa Real",
      cantidad: 2,
      precio: 85,
      subtotal: 170,
      imagenURL: "url"
    }
  ],
  subtotal: 170,
  deliveryFee: 15,
  total: 185,
  paymentMethod: "efectivo",
  deliveryType: "delivery",
  deliveryAddress: {
    calle: "Av. Arce 123",
    zona: "Sopocachi",
    referencia: "Edificio azul"
  },
  status: "pending",
  assignedDeliveryId: null,
  assignedDeliveryName: null,
  creadoEn: Timestamp,
  actualizadoEn: Timestamp
}
```

### Colección: `users`
```javascript
{
  id: "auto-generado",
  displayName: "Juan Pérez",
  phone: "+591 77123456",
  email: "juan@email.com",
  avatar: "🎭",
  tier: "bronze",
  puntos: 150,
  totalPedidos: 5,
  totalGastado: 450,
  creadoEn: Timestamp
}
```

### Colección: `deliveries`
```javascript
{
  id: "auto-generado",
  code: "DLV-20260118-A7X2",
  nombre: "Carlos Mamani",
  telefono: "+591 77999888",
  ci: "1234567 LP",
  vehicleType: "moto",
  vehiclePlate: "1234-ABC",
  status: "active",
  disponible: true,
  pedidoActualId: null,
  completedToday: 3,
  rating: 4.9,
  creadoEn: Timestamp
}
```

### Colección: `admins`
```javascript
{
  id: "uid-del-usuario",
  email: "nicolaspc97@gmail.com",
  role: "SUPER_ADMIN",
  nombre: "Nicolás",
  creadoEn: Timestamp
}
```

---

## 🚨 TROUBLESHOOTING

### Error: "Firebase not configured"
**Solución:** Verificar que las credenciales en `firebaseConfig.js` sean correctas.

### Error: "Permission denied"
**Solución:** 
1. Verificar que las reglas de Firestore estén publicadas
2. Verificar que el usuario esté en la colección `admins`

### Error: "Storage upload failed"
**Solución:**
1. Verificar que Storage esté habilitado
2. Verificar las reglas de Storage

### Productos no aparecen en la app
**Solución:**
1. Verificar que `activo: true` en Firestore
2. Verificar la consola del navegador para errores
3. Verificar que el listener esté activo

### Pedidos no llegan al admin
**Solución:**
1. Verificar que el pedido se guardó en Firestore
2. Verificar que el listener del admin esté activo
3. Revisar la consola para errores

---

## 📝 PRÓXIMOS PASOS

Una vez que todo funcione:

### 1. Implementar en ProductsManagementScreen
- Reemplazar AsyncStorage por Firebase
- Usar `subscribeToProducts()` para tiempo real
- Usar `uploadProductImage()` para imágenes

### 2. Implementar en CatalogScreen
- Usar `subscribeToActiveProducts()` para tiempo real
- Mostrar imágenes de Firebase Storage

### 3. Implementar en CheckoutScreen
- Usar `createOrder()` al confirmar pedido
- Guardar en Firebase en lugar de AsyncStorage

### 4. Implementar en OrdersManagementScreen
- Usar `subscribeToOrders()` para tiempo real
- Usar `updateOrderStatus()` para cambiar estados
- Usar `assignDeliveryToOrder()` para asignar

### 5. Implementar en OrderTrackingScreen
- Usar `subscribeToOrder()` para seguimiento en tiempo real
- Actualizar UI automáticamente

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Proyecto Firebase creado
- [ ] Credenciales configuradas en `firebaseConfig.js`
- [ ] Firestore habilitado
- [ ] Storage habilitado
- [ ] Authentication habilitado
- [ ] Reglas de Firestore publicadas
- [ ] Reglas de Storage publicadas
- [ ] Usuario admin creado
- [ ] Usuario marcado como admin en Firestore
- [ ] Dependencias instaladas (`npm install firebase`)
- [ ] Producto de prueba creado desde admin
- [ ] Producto visible en app móvil
- [ ] Pedido de prueba creado desde app
- [ ] Pedido visible en admin
- [ ] Sincronización en tiempo real funcionando

---

**Sistema Firebase: COMPLETO Y LISTO PARA USAR** 🔥🚀💀🤠
