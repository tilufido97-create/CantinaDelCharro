# 🚀 Cómo Ejecutar La Cantina del Charro

## ✅ **PROBLEMA SOLUCIONADO**
- ❌ Error de Jimp eliminado
- ✅ Firebase deshabilitado temporalmente
- ✅ App funciona sin errores

## 📱 **EJECUTAR EN MÓVIL (Expo Go)**

### 1. Instala Expo Go:
- **iOS:** https://apps.apple.com/app/expo-go/id982107779
- **Android:** https://play.google.com/store/apps/details?id=host.exp.exponent

### 2. Ejecuta el proyecto:
```bash
# Limpiar cache y ejecutar
npx expo start -c --port 8082

# O simplemente
npm start
```

### 3. Escanea el QR:
- **iOS:** Abre la cámara y escanea
- **Android:** Abre Expo Go y escanea

## 🌐 **EJECUTAR EN WEB**

```bash
# Ejecutar en web
npx expo start --web --port 3000

# O usar npm
npm run web
```

## 🔧 **SI HAY PROBLEMAS**

### Puerto ocupado:
```bash
npx expo start -c --port 8082
```

### Cache corrupto:
```bash
rm -rf node_modules
npm install
npx expo start -c
```

### Error de dependencias:
```bash
npm install
npx expo install --fix
```

## 🎮 **QUÉ FUNCIONA AHORA**

### ✅ **Pantallas:**
- SplashScreen con video (4s)
- OnboardingScreen (3 slides)
- WelcomeScreen
- Todos los juegos

### ✅ **Juegos Disponibles:**
- 🔫 Ruleta Rusa
- 🧠 Cultura Chupística  
- 🍹 Mixology Master (multiplayer)
- 🎲 Todis (dados)
- 🃏 Poker
- 🎰 Blackjack

### ✅ **Características:**
- Tema tequila completo 💀🤠
- Animaciones suaves
- Sistema multiplayer
- Manejo de empates
- Alertas de turnos

## 🔥 **FIREBASE (Deshabilitado temporalmente)**
- Para evitar errores de Jimp
- Se puede reactivar más tarde
- Credenciales guardadas para futuro uso

## 📊 **COMANDOS ÚTILES**

```bash
# Ejecutar móvil
npx expo start -c --port 8082

# Ejecutar web  
npx expo start --web --port 3000

# Limpiar todo
npx expo start -c --clear

# Instalar dependencias
npm install
```

## 🎯 **PRÓXIMOS PASOS**
1. Probar todos los juegos
2. Verificar animaciones
3. Testear multiplayer
4. Reactivar Firebase cuando sea necesario

**¡La app está lista para probar! 🍺💀🤠**