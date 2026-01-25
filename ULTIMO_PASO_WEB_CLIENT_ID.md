# 🎯 ÚLTIMO PASO - OBTENER TU WEB CLIENT ID

## ✅ YA HICE POR TI:

1. ✅ Actualicé firebaseConfig.js con tu App ID
2. ✅ Instalé @react-native-google-signin/google-signin
3. ✅ Instalé expo-auth-session y expo-crypto
4. ✅ Configuré authService.js

---

## 📋 SOLO TE FALTA 1 COSA: WEB CLIENT ID

### OPCIÓN 1: Desde Firebase Console (MÁS FÁCIL)

1. Ve a: https://console.firebase.google.com
2. Selecciona: "la-cantina-del-charro"
3. Click en ⚙️ **Project Settings** (arriba izquierda)
4. Baja hasta la sección **"Your apps"**
5. Busca tu app web: **"CantinaDelCharro"**
6. Click en **"Config"** o **"SDK setup and configuration"**
7. Verás algo como esto:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "la-cantina-del-charro.firebaseapp.com",
  projectId: "la-cantina-del-charro",
  // ... más líneas
};
```

8. **IMPORTANTE:** Busca una línea que diga algo como:
   - `clientId` o
   - `oauth_client` o
   - Puede estar en una sección separada llamada **"OAuth 2.0 Client IDs"**

9. El Web Client ID se ve así:
```
981284006966-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
```

---

### OPCIÓN 2: Desde Google Cloud Console (ALTERNATIVA)

1. Ve a: https://console.cloud.google.com
2. Selecciona tu proyecto: "la-cantina-del-charro"
3. Menú (☰) → **APIs & Services** → **Credentials**
4. Busca en la lista: **"Web client (auto created by Google Service)"**
5. Click en el nombre
6. Copia el **"Client ID"**

Se ve así:
```
981284006966-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
```

---

## 📝 PEGAR EN EL CÓDIGO

Una vez que tengas el Web Client ID:

1. Abre: `/src/services/authService.js`
2. Busca la línea 11:
```javascript
const WEB_CLIENT_ID = '981284006966-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com';
```

3. Reemplaza las X con tu Web Client ID real:
```javascript
const WEB_CLIENT_ID = '981284006966-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com';
```

4. Guarda el archivo

---

## 🚀 PROBAR

```bash
npx expo start -c
```

1. Abre la app en Expo Go
2. Presiona "Continuar con Google"
3. Selecciona tu cuenta
4. ¡Debe funcionar! ✅

---

## 🔑 TAMBIÉN NECESITAS: API KEY DE FIREBASE

En el archivo `/src/config/firebaseConfig.js` línea 9, necesitas reemplazar:

```javascript
apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
```

Con tu API Key real que está en Firebase Console → Project Settings → General:

```javascript
apiKey: "AIzaSy...", // Tu API Key real
```

---

## 📸 DÓNDE ENCONTRAR TODO (VISUAL)

### En Firebase Console:

```
Firebase Console
└── Project Settings (⚙️)
    └── General (tab)
        └── Your apps
            └── CantinaDelCharro (Web)
                ├── App ID: 1:981284006966:web:31295364d9d1967dabbc97 ✅ (ya lo tengo)
                ├── API Key: AIzaSy... ← NECESITAS ESTO
                └── Web Client ID: 981284006966-xxx.apps.googleusercontent.com ← Y ESTO
```

---

## ✅ CHECKLIST FINAL

- [ ] Obtener API Key de Firebase Console
- [ ] Pegar API Key en firebaseConfig.js línea 9
- [ ] Obtener Web Client ID de Firebase Console
- [ ] Pegar Web Client ID en authService.js línea 11
- [ ] Guardar ambos archivos
- [ ] Ejecutar: npx expo start -c
- [ ] Probar Google Sign-In
- [ ] ¡Funciona! 🎉

---

## 🐛 SI NO ENCUENTRAS EL WEB CLIENT ID

**No te preocupes**, puedes usar **solo Phone Authentication** por ahora:

1. En WelcomeScreen, usa solo "Continuar con Teléfono"
2. Firebase Phone Auth ya está configurado
3. Funciona sin necesitar Web Client ID
4. Puedes agregar Google Sign-In después

---

## 📞 NECESITAS AYUDA?

Si no encuentras el Web Client ID, dime y te ayudo a:
1. Crearlo desde cero en Google Cloud Console
2. O configurar solo Phone Auth sin Google Sign-In

---

**¡Casi listo!** Solo falta copiar esos 2 valores y estarás funcionando. 🍺💀🤠
