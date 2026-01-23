# 🔥 Configurar Reglas de Firebase Realtime Database

## ❌ **PROBLEMA:** Permission denied

## ✅ **SOLUCIÓN:**

### 1. Ve a Firebase Console:
https://console.firebase.google.com/project/cantinadelcharro/database/cantinadelcharro-default-rtdb/rules

### 2. Cambia las reglas a:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 3. Haz clic en "Publicar"

## ⚠️ **IMPORTANTE:**
- Estas reglas son SOLO para desarrollo
- En producción usar reglas de seguridad apropiadas

## 🔐 **Reglas de producción (para más tarde):**
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "products": {
      ".read": true,
      ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "orders": {
      "$orderId": {
        ".read": "data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "game_scores": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## 🚀 **Después de cambiar las reglas:**
```bash
npm start
```