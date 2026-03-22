// src/screens/games/PokerLobbyScreen.js
// ✅ v6 - HOST configura tope de tragos, invitados solo ven

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, Animated, Dimensions,
  ActivityIndicator, Share, ScrollView, Platform,
  KeyboardAvoidingView, SafeAreaView, StatusBar, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { ref, update } from 'firebase/database';
import { database } from '../../config/firebase';

import {
  createRoom, joinRoom, listenToRoom, leaveRoom, startGame,
} from '../../services/roomService';
import { getCurrentUser } from '../../services/authService';
import { PlayerAvatar, AvatarSelector } from '../../components/poker/PlayerAvatar';

const { width, height } = Dimensions.get('window');

// ── CATEGORÍAS DE BEBIDAS ─────────────────────────────────────────────────────
const DRINK_CATEGORIES = [
  {
    id: 'shot',
    name: 'Shot / Tequila / Mezcal',
    icon: '🥃',
    color: '#FF6B00',
    unit: 'shot',
    maxLabel: 'shots máx',
    levels: [
      { label: '½ Shot',   value: 0.5,  display: '½',  pct: 25  },
      { label: '1 Shot',   value: 1.0,  display: '1',  pct: 50  },
      { label: '1½ Shots', value: 1.5,  display: '1½', pct: 75  },
      { label: '2 Shots',  value: 2.0,  display: '2',  pct: 100 },
    ],
  },
  {
    id: 'beer_bottle',
    name: 'Cerveza Botella',
    icon: '🍺',
    color: '#F59E0B',
    unit: 'botella',
    maxLabel: '% de botella máx',
    levels: [
      { label: '25%', value: 0.25, display: '¼', pct: 25  },
      { label: '50%', value: 0.5,  display: '½', pct: 50  },
      { label: '75%', value: 0.75, display: '¾', pct: 75  },
      { label: '100%', value: 1.0, display: '1', pct: 100 },
    ],
  },
  {
    id: 'beer_can',
    name: 'Cerveza Lata',
    icon: '🥫',
    color: '#10B981',
    unit: 'lata',
    maxLabel: '% de lata máx',
    levels: [
      { label: '25%', value: 0.25, display: '¼', pct: 25  },
      { label: '50%', value: 0.5,  display: '½', pct: 50  },
      { label: '75%', value: 0.75, display: '¾', pct: 75  },
      { label: '100%', value: 1.0, display: '1', pct: 100 },
    ],
  },
  {
    id: 'liquor',
    name: 'Licor / Ron / Whisky',
    icon: '🍾',
    color: '#8B5CF6',
    unit: 'copa',
    maxLabel: '% de copa máx',
    levels: [
      { label: '25%', value: 0.25, display: '¼', pct: 25  },
      { label: '50%', value: 0.5,  display: '½', pct: 50  },
      { label: '75%', value: 0.75, display: '¾', pct: 75  },
      { label: '100%', value: 1.0, display: '1', pct: 100 },
    ],
  },
];

const LEGAL_TEXT = `⚠️ AVISO LEGAL - LEE ANTES DE JUGAR

La Cantina del Charro es una aplicación de entretenimiento para adultos mayores de 18 años.

• Este juego NO promueve el consumo excesivo de alcohol.
• Las apuestas son simbólicas y de libre acuerdo entre los participantes.
• Cada jugador es RESPONSABLE de su propio consumo.
• No conduzcas bajo los efectos del alcohol.
• Si tienes problemas con el alcohol, busca ayuda profesional.
• Los desarrolladores NO son responsables por el consumo de los usuarios.
• Juega con moderación y respeta tus límites.

RECOMENDACIÓN: Máximo 1 shot o ½ botella por partida completa.

Al presionar "ACEPTO" confirmas que:
✓ Eres mayor de 18 años
✓ Juegas de forma responsable
✓ Conoces tus límites de consumo`;

// ── COMPONENTE: Vaso visual animado ──────────────────────────────────────────
function DrinkGlass({ pct, color, size = 40 }) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: pct / 100, duration: 600, useNativeDriver: false,
    }).start();
  }, [pct]);
  const h = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '90%'] });
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <View style={[gs.glassBody, { width: size * 0.7, height: size, borderColor: color }]}>
        <Animated.View style={[gs.glassLiquid, { height: h, backgroundColor: color + 'CC' }]} />
        {pct > 0 && <View style={[gs.glassBubble, { backgroundColor: color + '60' }]} />}
      </View>
      <View style={[gs.glassStem, { backgroundColor: color + '80' }]} />
      <View style={[gs.glassBase, { backgroundColor: color + '60', width: size * 0.55 }]} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function PokerLobbyScreen({ navigation, route }) {
  const gameType = route?.params?.gameType || 'poker';

  const [mode,           setMode]           = useState(null);
  const [roomCode,       setRoomCode]       = useState('');
  const [inputCode,      setInputCode]      = useState('');
  const [room,           setRoom]           = useState(null);
  const [user,           setUser]           = useState(null);
  const [userLoading,    setUserLoading]    = useState(true);
  const [loading,        setLoading]        = useState(false);
  const [showScanner,    setShowScanner]    = useState(false);
  const [scanned,        setScanned]        = useState(false);
  const [scanSuccess,    setScanSuccess]    = useState(false);
  const [permission,     requestPermission] = useCameraPermissions();
  const [showLegal,      setShowLegal]      = useState(false);
  const [legalAccepted,  setLegalAccepted]  = useState(false);
  const [myAvatarId,     setMyAvatarId]     = useState('pistolero');

  // Config de tragos del HOST (lo que se guarda en Firebase)
  const [drinkConfig,    setDrinkConfig]    = useState(null);
  // { categoryId, categoryName, icon, color, unit, maxLevel, maxLabel }

  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const scanFeedback = useRef(new Animated.Value(0)).current;
  const unsubRef     = useRef(null);

  useEffect(() => {
    getCurrentUser().then(u => { setUser(u); setUserLoading(false); }).catch(() => setUserLoading(false));
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  if (userLoading) {
    return (
      <View style={s.loader}>
        <Text style={{ fontSize: 52 }}>💀</Text>
        <ActivityIndicator color="#FFB800" size="large" style={{ marginTop: 16 }} />
        <Text style={s.loaderTxt}>Entrando a la cantina...</Text>
      </View>
    );
  }

  // ── CREAR ───────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!user?.uid) return Alert.alert('💀', 'Sesión no encontrada.');
    setLoading(true);
    try {
      const { roomCode: code } = await createRoom(gameType);
      setRoomCode(code);
      setMode('create');
      subscribeToRoom(code);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  // ── UNIRSE ──────────────────────────────────────────────────────────────────
  const handleJoin = async (overrideCode) => {
    const code = (overrideCode || inputCode).trim().toUpperCase();
    if (!code) return Alert.alert('💀', 'Ingresa el código');
    setLoading(true);
    try {
      await joinRoom(code);
      setRoomCode(code);
      setMode('join');
      subscribeToRoom(code);
    } catch (e) { Alert.alert('Error 💀', e.message); }
    finally { setLoading(false); }
  };

  // ── QR ──────────────────────────────────────────────────────────────────────
  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return Alert.alert('📷', 'Necesitamos acceso a la cámara.');
    }
    setScanned(false); setScanSuccess(false); setShowScanner(true);
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    const code = data?.trim().toUpperCase();
    if (!/^[A-Z]{4,8}-[A-Z0-9]{4}$/.test(code)) {
      Alert.alert('QR inválido 💀', 'Este QR no es de una sala válida.', [
        { text: 'Reintentar', onPress: () => setScanned(false) }
      ]);
      return;
    }
    setScanSuccess(true);
    Animated.timing(scanFeedback, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    setTimeout(async () => {
      setShowScanner(false); setScanSuccess(false);
      setLoading(true);
      try {
        await joinRoom(code);
        setRoomCode(code); setMode('join');
        subscribeToRoom(code);
      } catch (e) { Alert.alert('Error 💀', e.message); setScanned(false); }
      finally { setLoading(false); }
    }, 800);
  };

  // ── SALA ────────────────────────────────────────────────────────────────────
  const subscribeToRoom = (code) => {
    unsubRef.current = listenToRoom(code, (data) => {
      if (!data) return;
      setRoom(data);
      // Sincronizar config de tragos desde Firebase
      if (data.drinkConfig) setDrinkConfig(data.drinkConfig);
      if (data.status === 'playing') {
        navigation.replace(
          gameType === 'poker' ? 'PokerTable' : 'BlackjackTable',
          { roomCode: code, drinkConfig: data.drinkConfig }
        );
      }
    });
  };

  // ── GUARDAR CONFIG DE TRAGOS (solo HOST) ────────────────────────────────────
  const saveDrinkConfig = async (category, level) => {
    if (!roomCode) return;
    const config = {
      categoryId:   category.id,
      categoryName: category.name,
      icon:         category.icon,
      color:        category.color,
      unit:         category.unit,
      maxValue:     level.value,
      maxLabel:     level.label,
      maxDisplay:   level.display,
      maxPct:       level.pct,
      // Apuestas posibles: 25%, 50%, 75%, 100% del máximo
      bet25:  { value: level.value * 0.25, label: `${(level.value * 0.25).toFixed(2)} ${category.unit}`, display: '25%' },
      bet50:  { value: level.value * 0.5,  label: `${(level.value * 0.5).toFixed(2)} ${category.unit}`,  display: '50%' },
      bet75:  { value: level.value * 0.75, label: `${(level.value * 0.75).toFixed(2)} ${category.unit}`, display: '75%' },
      bet100: { value: level.value,         label: level.label,                                           display: '100%' },
    };
    setDrinkConfig(config);
    try {
      await update(ref(database, `cantina_rooms/${roomCode}`), { drinkConfig: config });
    } catch (e) { console.warn('saveDrinkConfig:', e.message); }
  };

  const handleStart = async () => {
    const count = Object.keys(room?.players || {}).length;
    if (count < 2) return Alert.alert('💀', 'Necesitas al menos 2 jugadores');
    if (!drinkConfig) return Alert.alert('🥃', 'El host debe configurar las apuestas de tragos antes de iniciar');
    await startGame(roomCode);
  };

  const handleShare = () => Share.share({
    message: `🤠 ¡Únete a La Cantina del Charro!\nCódigo: ${roomCode}`,
  });

  const handleLeave = async () => {
    if (user?.uid && roomCode) await leaveRoom(roomCode, user.uid);
    if (unsubRef.current) unsubRef.current();
    setMode(null); setRoom(null); setRoomCode(''); setInputCode('');
    setDrinkConfig(null);
  };

  // ── QR SCANNER ──────────────────────────────────────────────────────────────
  if (showScanner) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar barStyle="light-content" />
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={s.scanOverlay}>
          <Text style={s.scanTitle}>📷 Escanear QR</Text>
          <View style={[s.scanFrame, scanSuccess && { borderColor: '#34C759' }]}>
            <View style={[s.corner, s.cTL]} /><View style={[s.corner, s.cTR]} />
            <View style={[s.corner, s.cBL]} /><View style={[s.corner, s.cBR]} />
            {scanSuccess && (
              <Animated.View style={{ opacity: scanFeedback, alignItems: 'center' }}>
                <Text style={{ fontSize: 52 }}>✅</Text>
                <Text style={s.successTxt}>¡Uniéndome!</Text>
              </Animated.View>
            )}
          </View>
          <Text style={s.scanHint}>{scanSuccess ? '⚡ Entrando...' : 'Apunta al QR'}</Text>
          {!scanSuccess && (
            <TouchableOpacity style={s.cancelBtn} onPress={() => setShowScanner(false)}>
              <Text style={s.cancelTxt}>CANCELAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const players = room ? Object.values(room.players || {}) : [];
  const isHost  = room?.host === user?.uid;

  // ── MENÚ INICIAL ────────────────────────────────────────────────────────────
  if (!mode) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#0A0A0A','#1a0505','#0A0A0A']} style={StyleSheet.absoluteFill} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={s.menuScroll} keyboardShouldPersistTaps="handled">
            <Animated.View style={[s.menuInner, { opacity: fadeAnim }]}>
              <Text style={s.skull}>💀</Text>
              <Text style={s.title}>LA CANTINA{'\n'}DEL CHARRO</Text>
              <Text style={s.subtitle}>{gameType === 'poker' ? "🃏 TEXAS HOLD'EM" : '🎰 BLACKJACK'}</Text>
              <TouchableOpacity style={s.createBtn} onPress={handleCreate} disabled={loading} activeOpacity={0.85}>
                <LinearGradient colors={['#FFB800','#FF6B00']} style={s.createInner}>
                  {loading ? <ActivityIndicator color="#000" /> :
                    <><Ionicons name="add-circle" size={22} color="#000" /><Text style={s.createTxt}>CREAR MESA</Text></>}
                </LinearGradient>
              </TouchableOpacity>
              <View style={s.divRow}>
                <View style={s.divLine} /><Text style={s.divLbl}>o únete</Text><View style={s.divLine} />
              </View>
              <View style={s.joinRow}>
                <TextInput
                  style={s.codeInput} placeholder="CHARRO-1234" placeholderTextColor="#444"
                  value={inputCode} onChangeText={t => setInputCode(t.toUpperCase())}
                  autoCapitalize="characters" maxLength={14} returnKeyType="go"
                  onSubmitEditing={() => handleJoin()}
                />
                <TouchableOpacity style={s.joinBtn} onPress={() => handleJoin()} disabled={loading} activeOpacity={0.85}>
                  {loading ? <ActivityIndicator color="#FFB800" size="small" /> : <Text style={s.joinTxt}>IR</Text>}
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={s.qrBtn} onPress={openScanner} activeOpacity={0.85}>
                <Ionicons name="qr-code-outline" size={22} color="#FFB800" />
                <Text style={s.qrTxt}>ESCANEAR QR → ENTRAR AUTOMÁTICO</Text>
              </TouchableOpacity>
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
      <LinearGradient colors={['#0A0A0A','#1a0505','#0A0A0A']} style={StyleSheet.absoluteFill} />

      {/* MODAL AVISO LEGAL - BLOQUEANTE */}
      <Modal visible={showLegal} transparent animationType="slide" onRequestClose={() => {}}>
        <View style={s.legalOverlay}>
          <View style={s.legalModal}>
            <LinearGradient colors={['#1A0000','#0A0000']} style={StyleSheet.absoluteFill} />
            <ScrollView style={{ marginBottom: 16 }} showsVerticalScrollIndicator={false}>
              <Text style={s.legalTitle}>⚠️ AVISO LEGAL</Text>
              <Text style={s.legalText}>{LEGAL_TEXT}</Text>
            </ScrollView>
            <TouchableOpacity style={s.legalAcceptBtn}
              onPress={() => { setLegalAccepted(true); setShowLegal(false); }} activeOpacity={0.85}>
              <LinearGradient colors={['#34C759','#28A745']} style={s.legalAcceptInner}>
                <Text style={s.legalAcceptTxt}>✓ ACEPTO Y JUEGO CON RESPONSABILIDAD</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.lobbyScroll} showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <View style={s.header}>
            <TouchableOpacity onPress={handleLeave} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="arrow-back" size={26} color="#FFB800" />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={s.codeLbl}>CÓDIGO DE SALA</Text>
              <Text style={s.codeVal}>{roomCode}</Text>
            </View>
            <TouchableOpacity onPress={handleShare} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="share-social-outline" size={24} color="#FFB800" />
            </TouchableOpacity>
          </View>

          {/* QR */}
          <View style={s.qrBox}>
            <Text style={s.qrBoxTitle}>
              {isHost ? '📲 Muestra este QR a tus amigos' : `🔒 Sala: ${roomCode}`}
            </Text>
            <View style={s.qrWrap}>
              <QRCode value={roomCode} size={150} backgroundColor="#FFFFFF" color="#0A0A0A" />
            </View>
            <Text style={s.qrCode}>{roomCode}</Text>
            <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
              <Ionicons name="share-social" size={16} color="#000" />
              <Text style={s.shareTxt}>COMPARTIR CÓDIGO</Text>
            </TouchableOpacity>
          </View>

          {/* SELECTOR DE AVATAR */}
          <View style={{marginHorizontal:16, marginBottom:16}}>
            <Text style={{color:'#FFB800',fontSize:12,fontWeight:'800',
              letterSpacing:3,textAlign:'center',marginBottom:10}}>
              🎭 ELIGE TU PERSONAJE
            </Text>
            <AvatarSelector 
              selectedId={myAvatarId} 
              onSelect={async (id) => {
                setMyAvatarId(id);
                if (roomCode && user?.uid) {
                  await update(ref(database, 
                    `cantina_rooms/${roomCode}/players/${user.uid}`), 
                    {avatarId: id});
                }
              }} 
            />
          </View>

          {/* JUGADORES */}
          <Text style={s.sectionLbl}>JUGADORES ({players.length}/8)</Text>
          <View style={s.playersGrid}>
            {players.map(p => (
              <View key={p.uid} style={s.playerCell}>
                <PlayerAvatar
                  player={{ ...p, avatarId: p.avatarId || 'pistolero' }}
                  size="sm" showChips showShots={false}
                />
                {p.isHost && <View style={s.hostTag}><Text style={s.hostTagTxt}>HOST</Text></View>}
              </View>
            ))}
            {players.length < 2 && Array.from({ length: 2 - players.length }).map((_, i) => (
              <View key={`e${i}`} style={[s.playerCell, { opacity: 0.2 }]}>
                <Text style={{ fontSize: 36 }}>👤</Text>
                <Text style={{ color: '#fff', fontSize: 9, marginTop: 4 }}>Esperando</Text>
              </View>
            ))}
          </View>

          {/* ══ CONFIGURACIÓN DE TRAGOS ══ */}
          <View style={s.drinkSection}>
            <View style={s.drinkHeaderRow}>
              <Text style={s.drinkTitle}>🥃 APUESTAS DE TRAGOS</Text>
              <TouchableOpacity onPress={() => setShowLegal(true)} style={s.legalTag}>
                <Text style={s.legalTagTxt}>⚠️ Aviso legal</Text>
              </TouchableOpacity>
            </View>

            {/* HOST: configurar tope */}
            {isHost && (
              <>
                {!legalAccepted ? (
                  <TouchableOpacity style={s.legalPrompt} onPress={() => setShowLegal(true)} activeOpacity={0.85}>
                    <LinearGradient colors={['#1A0A00','#2A1000']} style={s.legalPromptInner}>
                      <Text style={{ fontSize: 32 }}>⚠️</Text>
                      <Text style={s.legalPromptTxt}>Como anfitrión debes leer y aceptar{'\n'}el aviso legal primero</Text>
                      <Text style={s.legalPromptCta}>LEER AVISO LEGAL →</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <>
                    <Text style={s.drinkSubtitle}>
                      Elige el tipo de bebida y el TOPE MÁXIMO que se podrá apostar:
                    </Text>

                    {DRINK_CATEGORIES.map(cat => {
                      const isSelected = drinkConfig?.categoryId === cat.id;
                      return (
                        <View key={cat.id} style={[s.catCard, isSelected && { borderColor: cat.color + '80' }]}>
                          <LinearGradient colors={['#181818','#0A0A0A']} style={StyleSheet.absoluteFill} />

                          {/* Header categoría */}
                          <View style={s.catTop}>
                            <Text style={s.catIcon}>{cat.icon}</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={[s.catName, { color: cat.color }]}>{cat.name}</Text>
                              <Text style={s.catSubtitle}>Tope máximo por partida</Text>
                            </View>
                          </View>

                          {/* Niveles */}
                          <View style={s.levelsRow}>
                            {cat.levels.map(level => {
                              const sel = isSelected && drinkConfig?.maxValue === level.value;
                              return (
                                <TouchableOpacity
                                  key={level.label}
                                  style={[s.levelBtn, { borderColor: cat.color + '50' }, sel && { backgroundColor: cat.color, borderColor: cat.color }]}
                                  onPress={() => saveDrinkConfig(cat, level)}
                                  activeOpacity={0.82}
                                >
                                  {/* Vaso visual */}
                                  <DrinkGlass pct={sel ? level.pct : 0} color={sel ? '#000' : cat.color} size={36} />
                                  <Text style={[s.levelLbl, sel && { color: '#000' }]}>{level.label}</Text>
                                  <Text style={[s.levelPct, sel && { color: '#000000AA' }]}>{level.display}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}

                    {/* RESUMEN CONFIG */}
                    {drinkConfig && (
                      <View style={[s.configSummary, { borderColor: drinkConfig.color + '60' }]}>
                        <LinearGradient colors={[drinkConfig.color + '20', drinkConfig.color + '08']} style={StyleSheet.absoluteFill} />
                        <Text style={s.configIcon}>{drinkConfig.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={s.configTitle}>Tope configurado:</Text>
                          <Text style={[s.configValue, { color: drinkConfig.color }]}>
                            {drinkConfig.maxLabel} de {drinkConfig.categoryName}
                          </Text>
                          <Text style={s.configRules}>
                            Las apuestas serán: 25% · 50% · 75% · 100% de este tope{'\n'}
                            FOLD → 25% del tope{'\n'}
                            ALL IN → 100% del tope (máximo)
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={s.moderationBox}>
                      <Text style={s.moderationTxt}>
                        🛡️ Recomendación: No superar 1 shot o ½ botella por partida.
                        Juega con moderación y responsabilidad.
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}

            {/* INVITADO: ver la config del host */}
            {!isHost && (
              <View style={s.guestDrinkView}>
                {drinkConfig ? (
                  <>
                    <Text style={s.guestDrinkTitle}>El anfitrión configuró:</Text>
                    <View style={[s.guestDrinkCard, { borderColor: drinkConfig.color + '60' }]}>
                      <LinearGradient colors={[drinkConfig.color + '15', '#0A0A0A']} style={StyleSheet.absoluteFill} />
                      <Text style={{ fontSize: 44 }}>{drinkConfig.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.guestDrinkName, { color: drinkConfig.color }]}>
                          {drinkConfig.categoryName}
                        </Text>
                        <Text style={s.guestDrinkMax}>
                          Tope máximo: {drinkConfig.maxLabel}
                        </Text>
                        <Text style={s.guestDrinkBets}>
                          Apuestas posibles:{'\n'}
                          • 25% → {drinkConfig.bet25?.label}{'\n'}
                          • 50% → {drinkConfig.bet50?.label}{'\n'}
                          • 75% → {drinkConfig.bet75?.label}{'\n'}
                          • MÁXIMO → {drinkConfig.bet100?.label}
                        </Text>
                      </View>
                    </View>
                    {/* Vasos visuales del tope */}
                    <View style={s.guestGlassesRow}>
                      {[25, 50, 75, 100].map(pct => (
                        <View key={pct} style={{ alignItems: 'center', gap: 4 }}>
                          <DrinkGlass pct={pct} color={drinkConfig.color} size={42} />
                          <Text style={[s.guestGlassLbl, { color: drinkConfig.color }]}>{pct}%</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={s.drinkWaiting}>
                    <ActivityIndicator color="#FFB800" size="small" />
                    <Text style={s.drinkWaitingTxt}>El anfitrión está configurando las apuestas...</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* STATUS */}
          <View style={s.statusBox}>
            {players.length < 2 ? (
              <View style={s.statusRow}>
                <ActivityIndicator color="#FFB800" size="small" />
                <Text style={s.statusTxt}>Esperando jugadores... ({players.length}/2)</Text>
              </View>
            ) : (
              <Text style={s.statusReady}>✅ ¡Listos! ({players.length} jugadores)</Text>
            )}
          </View>

          {/* BOTONES */}
          <View style={s.actions}>
            {isHost ? (
              <TouchableOpacity
                style={[s.startBtn, (players.length < 2 || !drinkConfig) && { opacity: 0.4 }]}
                onPress={handleStart}
                disabled={players.length < 2 || !drinkConfig}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={(players.length >= 2 && drinkConfig) ? ['#FFB800','#FF6B00'] : ['#2C2C2C','#1C1C1C']}
                  style={s.startInner}
                >
                  <Text style={[s.startTxt, (players.length < 2 || !drinkConfig) && { color: '#555' }]}>
                    {players.length < 2 ? '⏳ ESPERANDO JUGADORES...' :
                     !drinkConfig ? '🥃 CONFIGURA LAS APUESTAS' :
                     '🃏 ¡INICIAR PARTIDA!'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={s.guestWait}>
                <ActivityIndicator color="#FFB800" size="small" />
                <Text style={s.guestWaitTxt}>El anfitrión iniciará la partida...</Text>
              </View>
            )}
            <TouchableOpacity style={s.leaveBtn} onPress={handleLeave}>
              <Text style={s.leaveTxt}>← Salir de la sala</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── GLASS STYLES ──────────────────────────────────────────────────────────────
const gs = StyleSheet.create({
  glassBody: { borderWidth: 2, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: 'rgba(255,255,255,0.04)' },
  glassLiquid: { width: '100%', borderRadius: 2 },
  glassBubble: { position: 'absolute', width: 5, height: 5, borderRadius: 3, top: 4, right: 4 },
  glassStem: { width: 3, height: 7, borderRadius: 2 },
  glassBase: { height: 4, borderRadius: 2 },
});

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  loader: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  loaderTxt: { color: '#FFB800', fontSize: 15, marginTop: 12, fontWeight: '600' },
  menuScroll: { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 48, justifyContent: 'center', minHeight: height },
  menuInner: { alignItems: 'center', gap: 14, width: '100%' },
  skull: { fontSize: 72 },
  title: { color: '#FFB800', fontSize: Platform.OS === 'ios' ? 34 : 30, fontWeight: '900', textAlign: 'center', letterSpacing: 4, textShadowColor: '#FF6B00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18 },
  subtitle: { color: '#FFFFFF70', fontSize: 14, letterSpacing: 5 },
  createBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', elevation: 6 },
  createInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  createTxt: { color: '#000', fontSize: 17, fontWeight: '900', letterSpacing: 2 },
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  divLine: { flex: 1, height: 1, backgroundColor: '#FFB80022' },
  divLbl: { color: '#FFB80055', fontSize: 13 },
  joinRow: { flexDirection: 'row', gap: 8, width: '100%' },
  codeInput: { flex: 1, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#FFB80040', borderRadius: 14, paddingVertical: Platform.OS === 'ios' ? 16 : 13, paddingHorizontal: 14, color: '#FFB800', fontSize: 16, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  joinBtn: { backgroundColor: '#FFB80018', borderWidth: 1.5, borderColor: '#FFB800', borderRadius: 14, paddingHorizontal: 18, justifyContent: 'center', minWidth: 70, alignItems: 'center' },
  joinTxt: { color: '#FFB800', fontWeight: '900', fontSize: 15 },
  qrBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFB80010', borderWidth: 1, borderColor: '#FFB80040', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, width: '100%', justifyContent: 'center' },
  qrTxt: { color: '#FFB800', fontWeight: '700', fontSize: 12 },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 20, backgroundColor: 'rgba(0,0,0,0.55)' },
  scanTitle: { color: '#FFB800', fontSize: 20, fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  scanFrame: { width: 240, height: 240, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 48, height: 48, borderColor: '#FFB800', borderWidth: 4, borderRadius: 5 },
  cTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  cTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  cBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  cBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  successTxt: { color: '#34C759', fontSize: 18, fontWeight: '900', marginTop: 8 },
  scanHint: { color: '#FFF', fontSize: 15, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  cancelBtn: { backgroundColor: '#FF3B30', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  cancelTxt: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  lobbyScroll: { flexGrow: 1, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 16, paddingBottom: 16 },
  codeLbl: { color: '#FFFFFF40', fontSize: 9, letterSpacing: 3, fontWeight: '700' },
  codeVal: { color: '#FFB800', fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  qrBox: { alignItems: 'center', gap: 12, marginHorizontal: 24, marginBottom: 20, padding: 20, backgroundColor: 'rgba(255,184,0,0.06)', borderWidth: 1, borderColor: '#FFB80025', borderRadius: 20 },
  qrBoxTitle: { color: '#FFB800', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  qrWrap: { padding: 12, backgroundColor: '#FFFFFF', borderRadius: 12, elevation: 8 },
  qrCode: { color: '#FFB800', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFB800', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  shareTxt: { color: '#000', fontWeight: '900', fontSize: 13 },
  sectionLbl: { color: '#FFB80070', fontSize: 11, fontWeight: '700', letterSpacing: 4, textAlign: 'center', marginBottom: 14 },
  playersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, paddingHorizontal: 20, marginBottom: 20 },
  playerCell: { alignItems: 'center', gap: 4, minWidth: 72 },
  hostTag: { backgroundColor: '#FFB800', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  hostTagTxt: { color: '#000', fontSize: 8, fontWeight: '900' },
  drinkSection: { marginHorizontal: 16, marginBottom: 20, gap: 12 },
  drinkHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drinkTitle: { color: '#FFB800', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  legalTag: { backgroundColor: 'rgba(255,59,48,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#FF3B3040' },
  legalTagTxt: { color: '#FF3B30', fontSize: 10, fontWeight: '700' },
  drinkSubtitle: { color: '#FFFFFF60', fontSize: 12 },
  legalPrompt: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#FF3B3030' },
  legalPromptInner: { padding: 20, alignItems: 'center', gap: 8 },
  legalPromptTxt: { color: '#FFFFFF80', fontSize: 13, textAlign: 'center' },
  legalPromptCta: { color: '#FFB800', fontSize: 14, fontWeight: '900' },
  catCard: { borderRadius: 16, borderWidth: 1.5, borderColor: '#FFFFFF10', overflow: 'hidden', padding: 14, gap: 12 },
  catTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: { fontSize: 28 },
  catName: { fontSize: 15, fontWeight: '800' },
  catSubtitle: { color: '#FFFFFF50', fontSize: 11, marginTop: 2 },
  levelsRow: { flexDirection: 'row', gap: 8 },
  levelBtn: { flex: 1, alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 12, padding: 10, backgroundColor: 'rgba(255,255,255,0.03)' },
  levelLbl: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  levelPct: { color: '#FFFFFF60', fontSize: 9 },
  configSummary: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden', padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  configIcon: { fontSize: 36 },
  configTitle: { color: '#FFFFFF60', fontSize: 11 },
  configValue: { fontSize: 17, fontWeight: '900', marginTop: 2 },
  configRules: { color: '#FFFFFF50', fontSize: 11, marginTop: 8, lineHeight: 18 },
  moderationBox: { backgroundColor: 'rgba(52,199,89,0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#34C75930' },
  moderationTxt: { color: '#34C759', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  guestDrinkView: { gap: 12 },
  guestDrinkTitle: { color: '#FFFFFF60', fontSize: 12 },
  guestDrinkCard: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden', padding: 16, flexDirection: 'row', gap: 12 },
  guestDrinkName: { fontSize: 16, fontWeight: '900' },
  guestDrinkMax: { color: '#FFFFFF80', fontSize: 13, marginTop: 4, fontWeight: '700' },
  guestDrinkBets: { color: '#FFFFFF50', fontSize: 11, marginTop: 8, lineHeight: 18 },
  guestGlassesRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingVertical: 8 },
  guestGlassLbl: { fontSize: 11, fontWeight: '700' },
  drinkWaiting: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: 'rgba(255,184,0,0.05)', borderRadius: 12 },
  drinkWaitingTxt: { color: '#FFFFFF55', fontSize: 13, flex: 1 },
  statusBox: { paddingHorizontal: 20, marginBottom: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,184,0,0.05)', borderRadius: 12, padding: 14, justifyContent: 'center' },
  statusTxt: { color: '#FFFFFF55', fontSize: 13, flexShrink: 1 },
  statusReady: { color: '#34C759', fontSize: 14, fontWeight: '700', textAlign: 'center', backgroundColor: 'rgba(52,199,89,0.08)', borderRadius: 12, padding: 14 },
  actions: { paddingHorizontal: 20, gap: 10 },
  startBtn: { borderRadius: 16, overflow: 'hidden', elevation: 6 },
  startInner: { paddingVertical: 20, alignItems: 'center' },
  startTxt: { color: '#000', fontSize: 17, fontWeight: '900', letterSpacing: 1 },
  guestWait: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, backgroundColor: 'rgba(255,184,0,0.05)', borderRadius: 16 },
  guestWaitTxt: { color: '#FFFFFF55', fontSize: 14 },
  leaveBtn: { alignItems: 'center', paddingVertical: 12 },
  leaveTxt: { color: '#FF3B3065', fontSize: 14 },
  legalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  legalModal: { borderRadius: 24, overflow: 'hidden', padding: 24, maxHeight: height * 0.85, borderWidth: 1, borderColor: '#FF3B3040' },
  legalTitle: { color: '#FF3B30', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 16, letterSpacing: 2 },
  legalText: { color: '#FFFFFF80', fontSize: 13, lineHeight: 22 },
  legalAcceptBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  legalAcceptInner: { paddingVertical: 16, alignItems: 'center' },
  legalAcceptTxt: { color: '#000', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  legalDeclineBtn: { alignItems: 'center', paddingVertical: 12 },
  legalDeclineTxt: { color: '#FFFFFF40', fontSize: 14 },
});
