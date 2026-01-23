# 🗄️ Base de Datos - La Cantina del Charro

## 📊 Configuración Firebase
```
URL: https://cantinadelcharro-default-rtdb.firebaseio.com/
Proyecto: cantinadelcharro
```

## 👥 Tabla: users

### Estructura JSON:
```json
{
  "users": {
    "[firebase_uid]": {
      "email": "string",
      "name": "string",
      "role": "admin|reponedor|repartidor|customer",
      "phone": "string",
      "age": "number",
      "preferences": {
        "favoriteCategory": "string",
        "notifications": "boolean"
      },
      "createdAt": "ISO_string",
      "lastLogin": "ISO_string|null",
      "isActive": "boolean"
    }
  }
}
```

## 🎭 Sistema de Roles

### 👑 Administrador (admin)
- **Permisos:** Acceso completo al sistema
- **Funciones:** 
  - Gestionar usuarios
  - Gestionar productos
  - Ver reportes
  - Gestionar inventario
  - Gestionar entregas

### 📦 Reponedor (reponedor)
- **Permisos:** Gestión de inventario
- **Funciones:**
  - Gestionar inventario
  - Ver productos
  - Actualizar stock

### 🚚 Repartidor (repartidor)
- **Permisos:** Gestión de entregas
- **Funciones:**
  - Ver entregas
  - Actualizar estado de entregas
  - Ver pedidos

### 👤 Cliente (customer)
- **Permisos:** Funciones básicas de cliente
- **Funciones:**
  - Realizar pedidos
  - Ver menú
  - Rastrear pedidos

## 🌱 Usuarios por Defecto (Seeders)

### 1. Administrador
- **Email:** tilufido97@gmail.com
- **Contraseña:** 123456
- **Nombre:** Usuario Tilufido
- **Rol:** admin 👑

### 2. Repartidor
- **Email:** pintocalvettyadrianchristian@gmail.com
- **Contraseña:** 123456
- **Nombre:** Adrian Christian
- **Rol:** repartidor 🚚

### 3. Reponedor
- **Email:** reponedor@cantinadelcharro.com
- **Contraseña:** 123456
- **Nombre:** Carlos Reponedor
- **Rol:** reponedor 📦

### 4. Cliente
- **Email:** cliente@cantinadelcharro.com
- **Contraseña:** 123456
- **Nombre:** María Cliente
- **Rol:** customer 👤

## 📝 Sistema de Logging

### Categorías de Logs:
- **AUTH:** Autenticación y autorización
- **SEEDER:** Creación de usuarios por defecto
- **SYSTEM:** Eventos del sistema
- **UI:** Interacciones de usuario

### Niveles de Log:
- **INFO** ℹ️: Información general
- **SUCCESS** ✅: Operaciones exitosas
- **WARNING** ⚠️: Advertencias
- **ERROR** ❌: Errores
- **DEBUG** 🔍: Información de depuración

## 🚀 Cómo Usar

### 1. Primera vez:
```bash
npx expo start -c
```

### 2. En la app:
1. Presiona "🌱 Crear Usuarios de Prueba"
2. Selecciona un usuario de prueba (Admin, Repartidor, etc.)
3. Presiona "🚀 Iniciar Sesión"

### 3. Verificar logs:
- Abre la consola del navegador o terminal
- Verás logs detallados de cada operación
- Formato: `[TIMESTAMP] [CATEGORÍA] Mensaje`

## 🔍 Verificación en Firebase

### Authentication:
1. Ve a Firebase Console
2. Authentication > Users
3. Verifica que los usuarios fueron creados

### Realtime Database:
1. Ve a Firebase Console  
2. Realtime Database
3. Verifica estructura en `/users/[uid]`

## 📊 Ejemplo de Log de Login Exitoso:
```
=== 2024-01-15T10:30:00.000Z ===
✅ [AUTH] Login exitoso para: tilufido97@gmail.com
📊 Datos: {
  "email": "tilufido97@gmail.com",
  "role": "admin", 
  "uid": "abc123xyz"
}
================================
```

## 🛠️ Troubleshooting

### Error: "Usuario no encontrado"
- Ejecuta el seeder primero
- Verifica que Firebase esté configurado correctamente

### Error: "Error de conexión"
- Verifica conexión a internet
- Revisa configuración de Firebase

### Logs no aparecen:
- Abre DevTools en el navegador
- Revisa la pestaña Console