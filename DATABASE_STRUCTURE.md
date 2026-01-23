# 🗄️ Estructura de Base de Datos - Firebase Realtime Database

## 📊 URL de la Base de Datos
```
https://cantinadelcharro-default-rtdb.firebaseio.com/
```

## 👥 Tabla: users

### Estructura JSON:
```json
{
  "users": {
    "[uid_firebase_auth]": {
      "email": "string",
      "name": "string",
      "role": "admin|customer|delivery",
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

### Ejemplo de Datos:
```json
{
  "users": {
    "abc123xyz": {
      "email": "tilufido97@gmail.com",
      "name": "Usuario Tilufido",
      "role": "admin",
      "phone": "+52 123 456 7890",
      "age": 25,
      "preferences": {
        "favoriteCategory": "tequila",
        "notifications": true
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "lastLogin": "2024-01-15T14:25:30.000Z",
      "isActive": true
    },
    "def456uvw": {
      "email": "pintocalvettyadrianchristian@gmail.com",
      "name": "Adrian Christian",
      "role": "customer",
      "phone": "+52 098 765 4321",
      "age": 28,
      "preferences": {
        "favoriteCategory": "mezcal",
        "notifications": true
      },
      "createdAt": "2024-01-15T11:00:00.000Z",
      "lastLogin": "2024-01-15T15:10:45.000Z",
      "isActive": true
    }
  }
}
```

## 🔐 Usuarios por Defecto (Seeders)

### Usuario 1 - Admin
- **Email:** tilufido97@gmail.com
- **Contraseña:** 123456
- **Rol:** admin
- **Nombre:** Usuario Tilufido

### Usuario 2 - Cliente
- **Email:** pintocalvettyadrianchristian@gmail.com
- **Contraseña:** 123456
- **Rol:** customer
- **Nombre:** Adrian Christian

## 🚀 Cómo Usar

1. **Crear usuarios por defecto:**
   - Presiona el botón "🌱 Crear Usuarios Test" en la pantalla de login
   - Esto ejecutará el seeder automáticamente

2. **Login rápido:**
   - Presiona "Admin" para llenar credenciales de administrador
   - Presiona "Cliente" para llenar credenciales de cliente
   - Luego presiona "Iniciar Sesión"

3. **Verificar en Firebase Console:**
   - Ve a: https://console.firebase.google.com/
   - Selecciona el proyecto "cantinadelcharro"
   - Ve a "Realtime Database" para ver los datos
   - Ve a "Authentication" para ver los usuarios creados

## 📝 Notas Importantes

- Los UIDs son generados automáticamente por Firebase Auth
- La estructura users/[uid] permite acceso directo por usuario autenticado
- Los roles disponibles son: admin, customer, delivery
- Las contraseñas están hasheadas automáticamente por Firebase Auth
- lastLogin se actualiza en cada login exitoso