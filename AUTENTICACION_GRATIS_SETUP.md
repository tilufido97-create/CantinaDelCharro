# 🔐 CONFIGURACIÓN DE AUTENTICACIÓN GRATUITA - PASO A PASO

## ✅ IMPLEMENTACIÓN COMPLETADA

He implementado autenticación **100% GRATUITA** con:
1. ✅ **Google Sign-In** (método principal, sin límites)
2. ✅ **Firebase Phone Auth** (alternativa, gratis hasta 10K/mes)

---

## 📋 PASO 1: CONFIGURAR FIREBASE CONSOLE

### A. Habilitar Phone Authentication

1. Ve a: https://console.firebase.google.com
2. Selecciona tu proyecto: **"la-cantina-del-charro"**
3. Menú izquierdo → **Authentication** → **Sign-in method**
4. Busca **"Phone"** en la lista
5. Click en **"Phone"** → **"Enable"** → **"Save"**

✅ **¡Listo!** Firebase ya tiene SMS configurados.

---

### B. Habilitar Google Sign-In

1. En la misma página (**Sign-in method**)
2. Busca **"Google"** en la lista
3. Click en **"Google"** → **"Enable"**
4. Ingresa:
   - **Project support email:** tu email (ej: admin@lacantinaelcharro.com)
   - **Project public-facing name:** "La Cantina del Charro"
5. Click **"Save"**

✅ **¡Listo!** Google Sign-In habilitado.

---

## 📋 PASO 2: OBTENER WEB CLIENT ID

### Opción A: Desde Firebase Console (MÁS FÁCIL)

1. En Firebase Console, ve a **Project Settings** (⚙️ arriba izquierda)
2. Baja hasta **"Your apps"**
3. Busca la sección **"Web app"** o **"SDK setup and configuration"**
4. Copia el **"Web client ID"** que aparece en el código de configuración

Se ve así:
```
authDomain: "la-cantina-del-charro.firebaseapp.com",
```

El Web Client ID es algo como:
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

### Opción B: Desde Google Cloud Console

1. Ve a: https://console.cloud.google.com
2. Selecciona tu proyecto
3. Menú → **APIs & Services** → **Credentials**
4. Busca **"Web client (auto created by Google Service)"**
5. Copia el **Client ID**

---

## 📋 PASO 3: CONFIGURAR EN EL CÓDIGO

### A. Actualizar authService.js

Abre el archivo:
```
/src/services/authService.js
```

Busca la línea 15:
```javascript
const WEB_CLIENT_ID = 'TU_WEB_CLIENT_ID_AQUI.apps.googleusercontent.com';
```

Reemplaza con tu Web Client ID real:
```javascript
const WEB_CLIENT_ID = '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com';
```

✅ **¡Listo!** Código configurado.

---

## 📋 PASO 4: INSTALAR DEPENDENCIAS

Ejecuta estos comandos en tu terminal:

```bash
# Google Sign-In
npx expo install @react-native-google-signin/google-signin

# Expo Auth Session (para reCAPTCHA en Phone Auth)
npx expo install expo-auth-session expo-crypto

# Verificar que Firebase esté instalado
npx expo install firebase
```

Espera a que termine la instalación.

---

## 📋 PASO 5: CONFIGURAR app.json

Abre `app.json` y agrega la configuración de Google Sign-In:

```json
{
  "expo": {
    "name": "La Cantina del Charro",
    "slug": "la-cantina-del-charro",
    "version": "1.0.0",
    "android": {
      "package": "com.lacantinaelcharro.app",
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.lacantinaelcharro.app",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "plugins": [
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

---

## 📋 PASO 6: DESCARGAR ARCHIVOS DE CONFIGURACIÓN

### Para Android:

1. En Firebase Console → **Project Settings**
2. Baja hasta **"Your apps"**
3. Si no tienes app Android:
   - Click **"Add app"** → **"Android"**
   - **Android package name:** `com.lacantinaelcharro.app`
   - **App nickname:** "La Cantina del Charro"
   - Click **"Register app"**
4. Descarga **google-services.json**
5. Coloca el archivo en la raíz del proyecto:
   ```
   /google-services.json
   ```

### Para iOS:

1. En Firebase Console → **Project Settings**
2. Si no tienes app iOS:
   - Click **"Add app"** → **"iOS"**
   - **iOS bundle ID:** `com.lacantinaelcharro.app`
   - **App nickname:** "La Cantina del Charro"
   - Click **"Register app"**
3. Descarga **GoogleService-Info.plist**
4. Coloca el archivo en la raíz del proyecto:
   ```
   /GoogleService-Info.plist
   ```

---

## 📋 PASO 7: PROBAR LA AUTENTICACIÓN

### A. Limpiar cache y reiniciar:

```bash
npx expo start -c
```

### B. Probar Google Sign-In:

1. Abre la app en Expo Go
2. En WelcomeScreen, presiona **"Continuar con Google"**
3. Selecciona tu cuenta de Google
4. Debe autenticar en 2-3 segundos
5. Navega a la app principal

**Si funciona:** ✅ ¡Perfecto!

**Si da error:**
- Verifica que el Web Client ID esté correcto
- Verifica que Google Sign-In esté habilitado en Firebase
- Revisa la consola para ver el error específico

### C. Probar Phone Authentication:

1. En WelcomeScreen, presiona **"Continuar con Teléfono"**
2. Ingresa tu número: `+591 7654 3210`
3. Presiona **"Continuar"**
4. Espera el SMS (10-30 segundos)
5. Ingresa el código de 6 dígitos
6. Debe autenticar correctamente

**Si funciona:** ✅ ¡Perfecto!

**Si no llega SMS:**
- Verifica que Phone Auth esté habilitado en Firebase
- Verifica que el número tenga el formato correcto (+591...)
- Revisa la consola de Firebase para ver si hay errores

---

## 🐛 TROUBLESHOOTING

### Error: "Google Sign-In failed"

**Causa:** Web Client ID incorrecto o no configurado

**Solución:**
1. Verifica que copiaste el Web Client ID correcto
2. Debe terminar en `.apps.googleusercontent.com`
3. Reinicia la app: `npx expo start -c`

---

### Error: "Play Services not available"

**Causa:** Google Play Services no instalado (solo Android)

**Solución:**
1. Instala Google Play Services en tu dispositivo
2. O prueba en un dispositivo diferente
3. O usa Phone Authentication en su lugar

---

### Error: "SMS not received"

**Causa:** Límite de SMS alcanzado o número inválido

**Solución:**
1. Verifica el formato: `+591 7654 3210`
2. Espera 1-2 minutos (a veces tarda)
3. Revisa Firebase Console → Authentication → Users
4. Si ves el usuario, el SMS se envió

---

### Error: "Invalid verification code"

**Causa:** Código incorrecto o expirado

**Solución:**
1. Verifica que ingresaste el código correcto
2. Los códigos expiran en 5 minutos
3. Solicita un nuevo código

---

## 💰 COSTOS

### Google Sign-In:
- ✅ **$0 USD** - Siempre gratis
- ✅ **Sin límites** - Usuarios ilimitados
- ✅ **Sin configuración adicional**

### Firebase Phone Auth:
- ✅ **Gratis:** Primeros 10,000 verificaciones/mes
- 💵 **Después:** $0.01 USD por verificación

**Ejemplo:**
- 1,000 usuarios/mes = **$0 USD**
- 5,000 usuarios/mes = **$0 USD**
- 15,000 usuarios/mes = **$50 USD**

---

## 📊 ESTADÍSTICAS DE USO

Para ver cuántas verificaciones has usado:

1. Firebase Console → **Authentication**
2. Tab **"Usage"**
3. Verás:
   - Phone verifications este mes
   - Google sign-ins (no cuenta para límite)
   - Usuarios activos

---

## 🎯 RECOMENDACIONES

### Para empezar:
1. ✅ Usa **Google Sign-In** como método principal
2. ✅ Ofrece **Phone Auth** como alternativa
3. ✅ Monitorea el uso en Firebase Console

### Cuando crezcas:
- Si llegas a 10K verificaciones/mes → Considera pagar Firebase
- O migra a Twilio WhatsApp (más caro pero mejor UX)
- O mantén Google Sign-In como principal (siempre gratis)

---

## ✅ CHECKLIST FINAL

Antes de lanzar, verifica:

- [ ] Firebase Phone Auth habilitado
- [ ] Google Sign-In habilitado
- [ ] Web Client ID configurado en authService.js
- [ ] google-services.json descargado (Android)
- [ ] GoogleService-Info.plist descargado (iOS)
- [ ] Dependencias instaladas
- [ ] app.json configurado
- [ ] Google Sign-In probado y funciona
- [ ] Phone Auth probado y funciona
- [ ] SMS llegan correctamente
- [ ] Códigos verifican correctamente

---

## 📞 SOPORTE

Si tienes problemas:

1. **Revisa la consola** - Los errores aparecen ahí
2. **Verifica Firebase Console** - Revisa Authentication → Users
3. **Limpia cache** - `npx expo start -c`
4. **Reinstala dependencias** - `npm install`
5. **Revisa este documento** - Paso a paso

---

## 🎉 ¡LISTO!

Tu app ahora tiene autenticación **100% GRATUITA** con:
- ✅ Google Sign-In (instantáneo, sin límites)
- ✅ Firebase Phone Auth (SMS gratis hasta 10K/mes)
- ✅ Seguro y confiable
- ✅ Usado por millones de apps

**¡Disfruta tu autenticación gratis!** 🍺💀🤠
