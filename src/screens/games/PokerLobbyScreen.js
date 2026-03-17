// src/screens/games/PokerLobbyScreen.js
// ✅ v4: QR real con react-native-qrcode-svg + auto-join al escanear

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, Animated, Dimensions,
  ActivityIndicator, Share, ScrollView, Platform,
  KeyboardAvoidingView, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg'; // ✅ QR real

import {
  createRoom, joinRoom, listenToRoom, leaveRoom, startGame,
} from '../../services/roomService';
import { getCurrentUser } from '../../services/authService';
import { PlayerAvatar } from '../../components/poker/PlayerAvatar';

const { width, height } = Dimensions.get('window');

export default function PokerLobbyScreen({ navigation, route }) {
  const gameType = route?.params?.gameType || 'poker';

  const [mode, setMode] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [drinkBet, setDrinkBet] = useState({ amount: 1, unit: 'shot', label: '1 Shot' }); // ✅ Apuesta de tragos

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scanFeedbackAnim = useRef(new Animated.Value(0)).current;
  const unsubRef = useRef(null);

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u);
      setUserLoading(false);
    }).catch(() => setUserLoading(false));

    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  if (userLoading) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={{ fontSize: 52 }}>💀</Text>
        <ActivityIndicator color="#FFB800" size="large" style={{ marginTop: 16 }} />
        <Text style={styles.loadingText}>Entrando a la cantina...</Text>
      </View>
    );
  }

  // ── CREAR ───────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!user?.uid) return Alert.alert('💀', 'Sesión no encontrada. Reinicia la app.');
    setLoading(true);
    try {
      const { roomCode: code } = await createRoom(gameType);
      setRoomCode(code);
      setMode('create');
      subscribeToRoom(code);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── UNIRSE ──────────────────────────────────────────────────────────────────
  const handleJoin = async (overrideCode) => {
    const code = (overrideCode || inputCode).trim().toUpperCase();
    if (!code) return Alert.alert('💀', 'Ingresa el código de sala');
    if (!user?.uid) return Alert.alert('💀', 'Sesión no encontrada.');
    setLoading(true);
    try {
      await joinRoom(code);
      setRoomCode(code);
      setMode('join');
      subscribeToRoom(code);
    } catch (e) {
      Alert.alert('Error 💀', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── QR SCANNER ──────────────────────────────────────────────────────────────
  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        return Alert.alert('📷 Cámara requerida',
          'Necesitamos acceso a la cámara para escanear el QR.',
          [{ text: 'Entendido' }]
        );
      }
    }
    setScanned(false);
    setScanSuccess(false);
    setShowScanner(true);
  };

  // ✅ Auto-join al escanear
  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    const code = data?.trim().toUpperCase();
    // ✅ Acepta: CHARRO-AB12, MEZCAL-XXXX, TEQUILA-XXXX, CANTINA-XXXX, etc.
    const isValid = /^[A-Z]{4,8}-[A-Z0-9]{4}$/.test(code);

    if (!isValid) {
      Alert.alert('QR inválido 💀', 'Este QR no es de una sala válida.', [
        { text: 'Reintentar', onPress: () => setScanned(false) }
      ]);
      return;
    }

    setScanSuccess(true);
    Animated.timing(scanFeedbackAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    setTimeout(async () => {
      setShowScanner(false);
      setScanSuccess(false);
      if (!user?.uid) return;
      setLoading(true);
      try {
        await joinRoom(code);
        setRoomCode(code);
        setMode('join');
        subscribeToRoom(code);
      } catch (e) {
        Alert.alert('Error 💀', e.message);
        setScanned(false);
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  // ── SALA ────────────────────────────────────────────────────────────────────
  const subscribeToRoom = (code) => {
    unsubRef.current = listenToRoom(code, (data) => {
      if (!data) return;
      setRoom(data);
      if (data.status === 'playing') {
        navigation.replace(
          gameType === 'poker' ? 'PokerTable' : 'BlackjackTable',
          { roomCode: code }
        );
      }
    });
  };

  const handleStart = async () => {
    const count = Object.keys(room?.players || {}).length;
    if (count < 2) return Alert.alert('💀', 'Necesitas al menos 2 jugadores');
    
    // ✅ Guardar apuesta de tragos en Firebase
    const { update } = await import('firebase/database');
    const { ref } = await import('firebase/database');
    const { database } = await import('../../config/firebase');
    
    try {
      await update(ref(database, `cantina_rooms/${roomCode}/bets_drinks/${user.uid}`), drinkBet);
    } catch (e) {
      console.warn('Error guardando apuesta de tragos:', e);
    }
    
    await startGame(roomCode);
  };

  const handleShare = () => Share.share({
    message: `🤠 ¡Únete a La Cantina del Charro!\nCódigo: ${roomCode}`,
  });

  const handleLeave = async () => {
    if (user?.uid && roomCode) await leaveRoom(roomCode, user.uid);
    if (unsubRef.current) unsubRef.current();
    setMode(null); setRoom(null); setRoomCode(''); setInputCode('');
  };

  // ── QR SCANNER PANTALLA ─────────────────────────────────────────────────────
  if (showScanner) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar barStyle="light-content" />
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.scanOverlay}>
          <Text style={styles.scanTitle}>📷 Escanear QR</Text>
          <View style={[styles.scanFrame, scanSuccess && { borderColor: '#34C759' }]}>
            <View style={[styles.corner, styles.cTL]} />
            <View style={[styles.corner, styles.cTR]} />
            <View style={[styles.corner, styles.cBL]} />
            <View style={[styles.corner, styles.cBR]} />
            {scanSuccess && (
              <Animated.View style={{ opacity: scanFeedbackAnim, alignItems: 'center' }}>
                <Text style={{ fontSize: 52 }}>✅</Text>
                <Text style={styles.successText}>¡Uniéndome!</Text>
              </Animated.View>
            )}
          </View>
          <Text style={styles.scanHint}>
            {scanSuccess ? '⚡ Entrando a la sala...' : 'Apunta al QR del anfitrión'}
          </Text>
          {!scanSuccess && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowScanner(false)}>
              <Text style={styles.cancelText}>CANCELAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const players = room ? Object.values(room.players || {}) : [];
  const isHost = room?.host === user?.uid;

  // ── MENÚ INICIAL ────────────────────────────────────────────────────────────
  if (!mode) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#0A0A0A', '#1a0505', '#0A0A0A']} style={StyleSheet.absoluteFill} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.menuScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.menuInner, { opacity: fadeAnim }]}>
              <Text style={styles.skull}>💀</Text>
              <Text style={styles.title}>LA CANTINA{'\n'}DEL CHARRO</Text>
              <Text style={styles.subtitle}>
                {gameType === 'poker' ? '🃏 TEXAS HOLD\'EM' : '🎰 BLACKJACK'}
              </Text>

              <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading} activeOpacity={0.85}>
                <LinearGradient colors={['#FFB800', '#FF6B00']} style={styles.createInner}>
                  {loading ? <ActivityIndicator color="#000" /> :
                    <><Ionicons name="add-circle" size={22} color="#000" /><Text style={styles.createText}>CREAR MESA</Text></>
                  }
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divRow}>
                <View style={styles.divLine} /><Text style={styles.divLabel}>o únete</Text><View style={styles.divLine} />
              </View>

              <View style={styles.joinRow}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="CHARRO-1234"
                  placeholderTextColor="#444"
                  value={inputCode}
                  onChangeText={t => setInputCode(t.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={14}
                  returnKeyType="go"
                  onSubmitEditing={() => handleJoin()}
                />
                <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin()} disabled={loading} activeOpacity={0.85}>
                  {loading ? <ActivityIndicator color="#FFB800" size="small" /> : <Text style={styles.joinText}>IR</Text>}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.qrBtn} onPress={openScanner} activeOpacity={0.85}>
                <Ionicons name="qr-code-outline" size={22} color="#FFB800" />
                <Text style={styles.qrText}>ESCANEAR QR → ENTRAR AUTOMÁTICO</Text>
              </TouchableOpacity>

              <Text style={styles.userHint}>
                {user?.displayName || user?.firstName
                  ? `🤠  ${user.displayName || user.firstName}`
                  : user?.phoneNumber ? `📱  ${user.phoneNumber}` : ''}
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ── LOBBY ───────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0A0A', '#1a0505', '#0A0A0A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.lobbyScroll} showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <View style={styles.lobbyHeader}>
            <TouchableOpacity onPress={handleLeave} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="arrow-back" size={26} color="#FFB800" />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.codeLbl}>CÓDIGO DE SALA</Text>
              <Text style={styles.codeVal}>{roomCode}</Text>
            </View>
            <TouchableOpacity onPress={handleShare} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="share-social-outline" size={24} color="#FFB800" />
            </TouchableOpacity>
          </View>

          {/* QR CODE REAL ✅ */}
          <View style={styles.qrContainer}>
            <Text style={styles.qrContainerTitle}>
              {isHost ? '📲 Muestra este QR a tus amigos' : '🔒 Sala: ' + roomCode}
            </Text>

            {/* QR generado con el código de sala */}
            <View style={styles.qrWrapper}>
              <QRCode
                value={roomCode}
                size={160}
                backgroundColor="#FFFFFF"
                color="#0A0A0A"
              />
            </View>

            <Text style={styles.qrCodeBelow}>{roomCode}</Text>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-social" size={16} color="#000" />
              <Text style={styles.shareBtnText}>COMPARTIR CÓDIGO</Text>
            </TouchableOpacity>
          </View>

          {/* JUGADORES */}
          <Text style={styles.playersTitle}>JUGADORES ({players.length}/8)</Text>
          <View style={styles.playersGrid}>
            {players.map(p => (
              <View key={p.uid} style={styles.playerCell}>
                <PlayerAvatar
                  player={{ ...p, avatarId: p.avatarId || 'pistolero' }}
                  size="sm" showChips showShots={false}
                />
                {p.isHost && <View style={styles.hostTag}><Text style={styles.hostTagTxt}>HOST</Text></View>}
              </View>
            ))}
            {players.length < 2 && Array.from({ length: 2 - players.length }).map((_, i) => (
              <View key={`e${i}`} style={[styles.playerCell, { opacity: 0.2 }]}>
                <Text style={{ fontSize: 36 }}>👤</Text>
                <Text style={{ color: '#fff', fontSize: 9, marginTop: 4 }}>Esperando</Text>
              </View>
            ))}
          </View>

          {/* ✅ APUESTA DE TRAGOS */}
          <View style={styles.drinkBetSection}>
            <Text style={styles.drinkBetTitle}>🍺 TU APUESTA</Text>
            <Text style={styles.drinkBetSubtitle}>Si pierdes o haces FOLD, bebes esto:</Text>
            <View style={styles.drinkBetButtons}>
              <TouchableOpacity
                style={[styles.drinkBetBtn, drinkBet.unit === 'glass' && styles.drinkBetBtnActive]}
                onPress={() => setDrinkBet({ amount: 0.5, unit: 'glass', label: 'Medio Vaso' })}
                activeOpacity={0.7}
              >
                <Text style={styles.drinkBetEmoji}>🥛</Text>
                <Text style={[styles.drinkBetLabel, drinkBet.unit === 'glass' && styles.drinkBetLabelActive]}>
                  Medio Vaso
                </Text>
                <Text style={styles.drinkBetAmount}>0.5x</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drinkBetBtn, drinkBet.unit === 'shot' && styles.drinkBetBtnActive]}
                onPress={() => setDrinkBet({ amount: 1, unit: 'shot', label: '1 Shot' })}
                activeOpacity={0.7}
              >
                <Text style={styles.drinkBetEmoji}>🥃</Text>
                <Text style={[styles.drinkBetLabel, drinkBet.unit === 'shot' && styles.drinkBetLabelActive]}>
                  1 Shot
                </Text>
                <Text style={styles.drinkBetAmount}>1x</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drinkBetBtn, drinkBet.unit === 'bottle' && styles.drinkBetBtnActive]}
                onPress={() => setDrinkBet({ amount: 3, unit: 'bottle', label: '1 Botella' })}
                activeOpacity={0.7}
              >
                <Text style={styles.drinkBetEmoji}>🍾</Text>
                <Text style={[styles.drinkBetLabel, drinkBet.unit === 'bottle' && styles.drinkBetLabelActive]}>
                  1 Botella
                </Text>
                <Text style={styles.drinkBetAmount}>3x</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.drinkBetCurrent}>
              <Text style={styles.drinkBetCurrentLabel}>Apuesta actual:</Text>
              <Text style={styles.drinkBetCurrentValue}>{drinkBet.label}</Text>
            </View>
          </View>

          {/* STATUS */}
          <View style={styles.statusBox}>
            {players.length < 2 ? (
              <View style={styles.statusRow}>
                <ActivityIndicator color="#FFB800" size="small" />
                <Text style={styles.statusTxt}>Esperando jugadores... ({players.length}/2)</Text>
              </View>
            ) : (
              <Text style={styles.statusReady}>✅ ¡Listos! ({players.length} jugadores)</Text>
            )}
          </View>

          {/* ACCIONES */}
          <View style={styles.actions}>
            {isHost ? (
              <TouchableOpacity
                style={[styles.startBtn, players.length < 2 && { opacity: 0.4 }]}
                onPress={handleStart} disabled={players.length < 2} activeOpacity={0.85}
              >
                <LinearGradient
                  colors={players.length >= 2 ? ['#FFB800', '#FF6B00'] : ['#2C2C2C', '#1C1C1C']}
                  style={styles.startInner}
                >
                  <Text style={[styles.startText, players.length < 2 && { color: '#555' }]}>
                    {players.length >= 2 ? '🃏 ¡INICIAR PARTIDA!' : '⏳ ESPERANDO...'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.guestWait}>
                <ActivityIndicator color="#FFB800" size="small" />
                <Text style={styles.guestWaitTxt}>El anfitrión iniciará la partida...</Text>
              </View>
            )}
            <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
              <Text style={styles.leaveTxt}>← Salir de la sala</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#FFB800', fontSize: 15, marginTop: 12, fontWeight: '600' },

  menuScroll: { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 48, justifyContent: 'center', minHeight: height },
  menuInner: { alignItems: 'center', gap: 14, width: '100%' },
  skull: { fontSize: 72, marginBottom: 4 },
  title: {
    color: '#FFB800', fontSize: Platform.OS === 'ios' ? 34 : 30, fontWeight: '900',
    textAlign: 'center', letterSpacing: 4,
    textShadowColor: '#FF6B00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18,
  },
  subtitle: { color: '#FFFFFF70', fontSize: 14, letterSpacing: 5, marginBottom: 6 },
  createBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', elevation: 6 },
  createInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  createText: { color: '#000', fontSize: 17, fontWeight: '900', letterSpacing: 2 },
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  divLine: { flex: 1, height: 1, backgroundColor: '#FFB80022' },
  divLabel: { color: '#FFB80055', fontSize: 13 },
  joinRow: { flexDirection: 'row', gap: 8, width: '100%' },
  codeInput: {
    flex: 1, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#FFB80040', borderRadius: 14,
    paddingVertical: Platform.OS === 'ios' ? 16 : 13, paddingHorizontal: 14,
    color: '#FFB800', fontSize: 16, fontWeight: '700', letterSpacing: 2, textAlign: 'center',
  },
  joinBtn: {
    backgroundColor: '#FFB80018', borderWidth: 1.5, borderColor: '#FFB800',
    borderRadius: 14, paddingHorizontal: 18, justifyContent: 'center', minWidth: 70, alignItems: 'center',
  },
  joinText: { color: '#FFB800', fontWeight: '900', fontSize: 15 },
  qrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFB80010', borderWidth: 1, borderColor: '#FFB80040',
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, width: '100%', justifyContent: 'center',
  },
  qrText: { color: '#FFB800', fontWeight: '700', fontSize: 12 },
  userHint: { color: '#FFFFFF35', fontSize: 12, textAlign: 'center' },

  // Scanner
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 20, backgroundColor: 'rgba(0,0,0,0.55)' },
  scanTitle: { color: '#FFB800', fontSize: 20, fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  scanFrame: { width: 240, height: 240, position: 'relative', alignItems: 'center', justifyContent: 'center', borderColor: '#FFB800' },
  corner: { position: 'absolute', width: 48, height: 48, borderColor: '#FFB800', borderWidth: 4, borderRadius: 5 },
  cTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  cTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  cBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  cBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  successText: { color: '#34C759', fontSize: 18, fontWeight: '900', marginTop: 8 },
  scanHint: { color: '#FFF', fontSize: 15, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  cancelBtn: { backgroundColor: '#FF3B30', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  cancelText: { color: '#FFF', fontWeight: '900', fontSize: 15 },

  // Lobby
  lobbyScroll: { flexGrow: 1, paddingBottom: 48 },
  lobbyHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 16, paddingBottom: 16,
  },
  codeLbl: { color: '#FFFFFF40', fontSize: 9, letterSpacing: 3, fontWeight: '700' },
  codeVal: { color: '#FFB800', fontSize: 20, fontWeight: '900', letterSpacing: 3 },

  // QR Container
  qrContainer: {
    alignItems: 'center', gap: 12, marginHorizontal: 24, marginBottom: 20,
    padding: 20, backgroundColor: 'rgba(255,184,0,0.06)',
    borderWidth: 1, borderColor: '#FFB80025', borderRadius: 20,
  },
  qrContainerTitle: { color: '#FFB800', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  qrWrapper: {
    padding: 12, backgroundColor: '#FFFFFF', borderRadius: 12,
    elevation: 8, shadowColor: '#FFB800', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 12,
  },
  qrCodeBelow: { color: '#FFB800', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFB800', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20,
  },
  shareBtnText: { color: '#000', fontWeight: '900', fontSize: 13 },

  playersTitle: { color: '#FFB80070', fontSize: 11, fontWeight: '700', letterSpacing: 4, textAlign: 'center', marginBottom: 14 },
  playersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, paddingHorizontal: 20, marginBottom: 20 },
  playerCell: { alignItems: 'center', gap: 4, minWidth: 72 },
  hostTag: { backgroundColor: '#FFB800', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  hostTagTxt: { color: '#000', fontSize: 8, fontWeight: '900' },
  statusBox: { paddingHorizontal: 20, marginBottom: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,184,0,0.05)', borderRadius: 12, padding: 14, justifyContent: 'center' },
  statusTxt: { color: '#FFFFFF55', fontSize: 13, flexShrink: 1 },
  statusReady: { color: '#34C759', fontSize: 14, fontWeight: '700', textAlign: 'center', backgroundColor: 'rgba(52,199,89,0.08)', borderRadius: 12, padding: 14 },
  actions: { paddingHorizontal: 20, gap: 10 },
  startBtn: { borderRadius: 16, overflow: 'hidden', elevation: 6 },
  startInner: { paddingVertical: 20, alignItems: 'center' },
  startText: { color: '#000', fontSize: 19, fontWeight: '900', letterSpacing: 1 },
  guestWait: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, backgroundColor: 'rgba(255,184,0,0.05)', borderRadius: 16 },
  guestWaitTxt: { color: '#FFFFFF55', fontSize: 14 },
  leaveBtn: { alignItems: 'center', paddingVertical: 12 },
  leaveTxt: { color: '#FF3B3065', fontSize: 14 },

  // ✅ Drink Bet Section
  drinkBetSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    backgroundColor: 'rgba(255,184,0,0.08)',
    borderWidth: 1.5,
    borderColor: '#FFB80030',
    borderRadius: 16,
    gap: 12,
  },
  drinkBetTitle: {
    color: '#FFB800',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  drinkBetSubtitle: {
    color: '#FFFFFF60',
    fontSize: 12,
    textAlign: 'center',
  },
  drinkBetButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  drinkBetBtn: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 2,
    borderColor: '#FFB80020',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  drinkBetBtnActive: {
    backgroundColor: 'rgba(255,184,0,0.15)',
    borderColor: '#FFB800',
  },
  drinkBetEmoji: {
    fontSize: 32,
  },
  drinkBetLabel: {
    color: '#FFFFFF50',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  drinkBetLabelActive: {
    color: '#FFB800',
  },
  drinkBetAmount: {
    color: '#FFFFFF30',
    fontSize: 9,
    fontWeight: '600',
  },
  drinkBetCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFB80020',
  },
  drinkBetCurrentLabel: {
    color: '#FFFFFF50',
    fontSize: 12,
  },
  drinkBetCurrentValue: {
    color: '#FFB800',
    fontSize: 14,
    fontWeight: '900',
  },
});
