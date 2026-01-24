# 🔥 CONFIGURACIÓN RÁPIDA DE FIREBASE

## ✅ YA ESTÁ INTEGRADO EN EL CÓDIGO

He integrado Firebase en:
- ✅ **CatalogScreen** - Productos en tiempo real
- ✅ **CheckoutScreen** - Pedidos guardados en Firebase

## 📋 SOLO NECESITAS 3 PASOS

### PASO 1: Crear Proyecto Firebase (5 minutos)

1. Ve a: https://console.firebase.google.com
2. Click en "Agregar proyecto"
3. Nombre: `la-cantina-del-charro`
4. Desactiva Google Analytics (opcional)
5. Click "Crear proyecto"

### PASO 2: Obtener Credenciales (2 minutos)

1. En tu proyecto, click en el ícono **</>** (Web)
2. Nombre de la app: `La Cantina Web`
3. **COPIA** el código que aparece (firebaseConfig)
4. Click "Continuar a la consola"

### PASO 3: Pegar Credenciales (1 minuto)

Abre el archivo:
```
src/config/firebaseConfig.js
```

Reemplaza estas líneas (líneas 8-14):
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

Con tus credenciales reales de Firebase.

---

## 🚀 HABILITAR SERVICIOS (5 minutos)

### Firestore Database

1. En Firebase Console → **Firestore Database**
2. Click "Crear base de datos"
3. Modo: **Producción**
4. Ubicación: `us-central` (o la más cercana)
5. Click "Habilitar"

### Storage

1. En Firebase Console → **Storage**
2. Click "Comenzar"
3. Modo: **Producción**
4. Click "Listo"

### Authentication

1. En Firebase Console → **Authentication**
2. Click "Comenzar"
3. Pestaña "Sign-in method"
4. Habilitar "Correo electrónico/contraseña"
5. Guardar

---

## 🔒 CONFIGURAR REGLAS DE SEGURIDAD (3 minutos)

### Reglas de Firestore

1. Firebase Console → **Firestore** → **Reglas**
2. **REEMPLAZA TODO** con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Productos - Lectura pública
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Solo desde admin
    }
    
    // Pedidos - Cualquiera puede crear
    match /orders/{orderId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false; // Solo desde admin
    }
    
    // Usuarios
    match /users/{userId} {
      allow read, write: if true;
    }
    
    // Deliverys
    match /deliveries/{deliveryId} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publicar"

### Reglas de Storage

1. Firebase Console → **Storage** → **Reglas**
2. **REEMPLAZA TODO** con esto:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. Click "Publicar"

---

## ✅ PROBAR QUE FUNCIONA

### 1. Instalar dependencia

```bash
npm install firebase@10.7.1
```

### 2. Iniciar proyecto

```bash
npx expo start
```

### 3. Probar en la app móvil

1. Abre la app en Expo Go
2. Ve a "Catálogo"
3. **Deberías ver en la consola:**
   ```
   🔥 Cargando productos desde Firebase...
   ✅ X productos recibidos de Firebase
   ```

### 4. Hacer un pedido de prueba

1. Agrega productos al carrito
2. Ve a Checkout
3. Completa la dirección
4. Confirma el pedido
5. **Deberías ver en la consola:**
   ```
   🔥 Guardando pedido en Firebase...
   ✅ Pedido guardado en Firebase: [ID]
   ```

### 5. Verificar en Firebase Console

1. Ve a Firestore Database
2. Deberías ver la colección `orders`
3. Con tu pedido guardado

---

## 🎉 ¡LISTO!

Si ves los mensajes de consola y el pedido en Firestore, **¡Firebase está funcionando!**

### ¿Qué hace ahora?

- ✅ **CatalogScreen** carga productos de Firebase en tiempo real
- ✅ **CheckoutScreen** guarda pedidos en Firebase
- ✅ Si Firebase falla, usa AsyncStorage como backup
- ✅ Todo sincronizado automáticamente

---

## 🐛 SI ALGO NO FUNCIONA

### Error: "Firebase not configured"
**Solución:** Verifica que pegaste las credenciales correctamente en `firebaseConfig.js`

### Error: "Permission denied"
**Solución:** Verifica que publicaste las reglas de Firestore y Storage

### No aparecen productos
**Solución:** 
1. Verifica que Firestore esté habilitado
2. Revisa la consola del navegador/terminal para errores
3. Por ahora usa AsyncStorage (el sistema tiene fallback automático)

---

## 📝 PRÓXIMOS PASOS

Una vez que Firebase funcione:

1. **Crear productos desde el admin** (próxima integración)
2. **Ver pedidos en tiempo real en el admin** (próxima integración)
3. **Subir imágenes de productos** (próxima integración)

Por ahora, el sistema funciona con:
- ✅ Productos: Firebase (si está configurado) o AsyncStorage
- ✅ Pedidos: Firebase (si está configurado) o AsyncStorage
- ✅ Sincronización automática cuando Firebase esté listo

---

**¿Necesitas ayuda? Avísame y te guío paso a paso.** 🚀
