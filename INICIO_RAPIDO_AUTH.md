# 🚀 INICIO RÁPIDO - AUTENTICACIÓN GRATIS (5 MINUTOS)

## ✅ YA ESTÁ IMPLEMENTADO EN EL CÓDIGO

Solo necesitas **configurar Firebase** y **obtener el Web Client ID**.

---

## 📋 3 PASOS SIMPLES

### PASO 1: HABILITAR EN FIREBASE (2 minutos)

```
1. Abre: https://console.firebase.google.com
2. Selecciona: "la-cantina-del-charro"
3. Ve a: Authentication → Sign-in method
4. Habilita: "Phone" → Enable → Save
5. Habilita: "Google" → Enable → Save
```

✅ **¡Listo!** Firebase configurado.

---

### PASO 2: OBTENER WEB CLIENT ID (1 minuto)

```
1. En Firebase Console
2. Ve a: Project Settings (⚙️)
3. Baja hasta: "Your apps"
4. Copia el "Web client ID"
```

Se ve así:
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

---

### PASO 3: PEGAR EN EL CÓDIGO (30 segundos)

```
1. Abre: /src/services/authService.js
2. Busca línea 15:
   const WEB_CLIENT_ID = 'TU_WEB_CLIENT_ID_AQUI...';
3. Reemplaza con tu Web Client ID
4. Guarda el archivo
```

---

## 🎯 INSTALAR DEPENDENCIAS

```bash
npx expo install @react-native-google-signin/google-signin
npx expo install expo-auth-session expo-crypto
```

---

## 🧪 PROBAR

```bash
npx expo start -c
```

1. Abre la app
2. Presiona "Continuar con Google"
3. Selecciona tu cuenta
4. ¡Listo! Autenticado en 2 segundos ✅

---

## 📱 LO QUE VERÁS

### WelcomeScreen:

```
┌─────────────────────────────────┐
│     [Logo La Cantina]           │
│                                 │
│ "Donde el trago es ley y el    │
│  charro, leyenda"               │
│                                 │
│ ┌───────────────────────────┐  │
│ │  Continuar con Google    │  │ ← Botón principal (dorado)
│ └───────────────────────────┘  │
│      ⭐ Rápido y Gratis         │
│                                 │
│            o                    │
│                                 │
│ ┌───────────────────────────┐  │
│ │  Continuar con Teléfono  │  │ ← Alternativa (gris)
│ └───────────────────────────┘  │
│                                 │
│ ┌───────────────────────────┐  │
│ │     Soy Delivery         │  │ ← Outline
│ └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 💰 COSTOS

| Método | Costo |
|--------|-------|
| Google Sign-In | **$0 USD** (siempre) |
| Phone Auth | **$0 USD** (hasta 10K/mes) |

**Para 1,000 usuarios/mes:** $0 USD
**Para 10,000 usuarios/mes:** $0 USD
**Para 15,000 usuarios/mes:** $50 USD

---

## ✅ CHECKLIST

- [ ] Firebase Phone Auth habilitado
- [ ] Firebase Google Sign-In habilitado
- [ ] Web Client ID copiado
- [ ] Web Client ID pegado en authService.js
- [ ] Dependencias instaladas
- [ ] App probada con Google Sign-In
- [ ] App probada con Phone Auth

---

## 🐛 SI HAY PROBLEMAS

### Google Sign-In no funciona:
```
1. Verifica el Web Client ID
2. Debe terminar en .apps.googleusercontent.com
3. Reinicia: npx expo start -c
```

### SMS no llega:
```
1. Verifica el formato: +591 7654 3210
2. Espera 1-2 minutos
3. Revisa Firebase Console → Authentication
```

---

## 📞 NECESITAS AYUDA?

1. Lee: `AUTENTICACION_GRATIS_SETUP.md` (guía completa)
2. Revisa la consola (errores aparecen ahí)
3. Verifica Firebase Console

---

## 🎉 ¡ESO ES TODO!

En **5 minutos** tendrás autenticación **100% GRATUITA** funcionando.

**¡Pruébalo ahora!** 🍺💀🤠
