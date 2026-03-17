// src/screens/games/PokerTableScreen.js
// ✅ v5 - Lógica de turnos CORRECTA + indicador de mano + vasos visuales

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Animated, Platform, StatusBar, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { listenToRoom, updateGameState, assignShot } from '../../services/roomService';
import { getCurrentUser } from '../../services/authService';
import { createDeck, shuffle } from '../../utils/games/cardDeck';
import { evaluateHand } from '../../utils/games/pokerLogic';
import { CardComponent, EmptyCardSlot } from '../../components/poker/CardComponent';
import { PlayerAvatar } from '../../components/poker/PlayerAvatar';

const { width } = Dimensions.get('window');
const CHIPS_START = 500;
const BB = 20;
const SB = 10;

// ── FASES ──────────────────────────────────────────────────────────────────────
const PHASES = ['preflop', 'flop', 'turn', 'river', 'showdown'];
const PHASE_LABEL = {
  dealing:  '🃏 REPARTIENDO',
  preflop:  '🔥 PRE-FLOP',
  flop:     '🃏 FLOP',
  turn:     '🃏 TURN',
  river:    '🃏 RIVER',
  showdown: '👁 SHOWDOWN',
};

// ── FUERZA DE MANO ─────────────────────────────────────────────────────────────
// rank 1-10 de pokerLogic → nombre + color + porcentaje de barra
const HAND_INFO = [
  { name: '',                color: '#888888', pct: 0   }, // índice 0 unused
  { name: 'Carta Alta',      color: '#888888', pct: 5   }, // rank 1
  { name: 'Par',             color: '#4FC3F7', pct: 18  }, // rank 2
  { name: 'Doble Par',       color: '#29B6F6', pct: 32  }, // rank 3
  { name: 'Trío',            color: '#26C6DA', pct: 45  }, // rank 4
  { name: 'Escalera',        color: '#66BB6A', pct: 58  }, // rank 5
  { name: 'Color',           color: '#AB47BC', pct: 68  }, // rank 6
  { name: 'Full House',      color: '#FF7043', pct: 78  }, // rank 7
  { name: 'Póker',           color: '#FFA726', pct: 88  }, // rank 8
  { name: 'Escalera Color',  color: '#FF6B00', pct: 95  }, // rank 9
  { name: 'Escalera Real',   color: '#FFD700', pct: 100 }, // rank 10
];

const getHandInfo = (rank) => HAND_INFO[rank] || HAND_INFO[1];

// ── SHOTS POR RANGO ────────────────────────────────────────────────────────────
const getShotRule = (rank) => {
  if (rank >= 8) return { shots: 0, everyone: true,  icon: '👑', color: '#FFD700', msg: '¡Escalera Real! Todos beben menos tú' };
  if (rank >= 6) return { shots: 1, everyone: false, icon: '🥃', color: '#FF9500', msg: 'Perdiste bien... 1 tequila' };
  if (rank >= 2) return { shots: 2, everyone: false, icon: '🥃', color: '#FF6B00', msg: 'Sin suerte esta mano. 2 mezcales' };
  return           { shots: 3, everyone: false, icon: '💀', color: '#FF3B30', msg: '¡Sin par! 3 shots de castigo ☠️' };
};

// ── HELPER: rank seguro ────────────────────────────────────────────────────────
const safeRank = (hand, community) => {
  try {
    if (!hand?.length) return 0;
    const result = evaluateHand(hand, community || []);
    return result?.rank ?? 0;
  } catch { return 0; }
};

// ══════════════════════════════════════════════════════════════════════════════
export default function PokerTableScreen({ navigation, route }) {
  const { roomCode } = route.params || {};

  // ── STATE ───────────────────────────────────────────────────────────────────
  const [user,           setUser]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [room,           setRoom]           = useState(null);
  const [phase,          setPhase]          = useState('dealing');
  const [community,      setCommunity]      = useState([]);
  const [myHand,         setMyHand]         = useState([]);
  const [allHands,       setAllHands]       = useState({});
  const [pot,            setPot]            = useState(0);
  const [myChips,        setMyChips]        = useState(CHIPS_START);
  const [myBet,          setMyBet]          = useState(0);
  const [tableBet,       setTableBet]       = useState(BB);   // apuesta máxima actual
  const [folded,         setFolded]         = useState(false);
  const [isMyTurn,       setIsMyTurn]       = useState(false);
  const [dealerUid,      setDealerUid]      = useState(null);
  const [winners,        setWinners]        = useState([]);
  const [allBets,        setAllBets]        = useState({});
  const [allChips,       setAllChips]       = useState({});
  const [myHandRank,     setMyHandRank]     = useState(null);

  // Shot screen
  const [shotScreen,     setShotScreen]     = useState(false);
  const [shotData,       setShotData]       = useState(null);

  // Animations
  const fadeIn     = useRef(new Animated.Value(0)).current;
  const potScale   = useRef(new Animated.Value(1)).current;
  const barWidth   = useRef(new Animated.Value(0)).current;

  const unsubRef   = useRef(null);
  const gsRef      = useRef(null);     // siempre apunta al gameState más reciente
  const roomRef    = useRef(null);
  const initDone   = useRef(false);

  // ── INIT ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    getCurrentUser()
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => setLoading(false));
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  // ── FIREBASE LISTENER ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomCode || !user?.uid) return;
    unsubRef.current = listenToRoom(roomCode, (data) => {
      if (!data) return;
      setRoom(data);
      roomRef.current = data;
      const gs = data.gameState;
      gsRef.current = gs;
      if (!gs) return;

      const uid = user.uid;
      setCommunity(gs.communityCards || []);
      setPot(gs.pot || 0);
      setTableBet(gs.currentBet || BB);
      setPhase(gs.phase || 'dealing');
      setIsMyTurn(gs.currentTurn === uid);
      setDealerUid(gs.dealer || null);
      setAllHands(gs.hands || {});
      setAllBets(gs.bets || {});
      setAllChips(gs.chips || {});

      if (gs.chips?.[uid] !== undefined) setMyChips(gs.chips[uid]);
      if (gs.bets?.[uid]  !== undefined) setMyBet(gs.bets[uid]);
      if (gs.foldedPlayers?.includes(uid)) setFolded(true);
      if (gs.winner) setWinners([gs.winner]);

      // Actualizar mi mano
      if (gs.hands?.[uid]) {
        const hand = gs.hands[uid];
        setMyHand(hand);
        // Calcular fuerza de mano en tiempo real
        const cc = gs.communityCards || [];
        if (cc.length > 0) {
          const rank = safeRank(hand, cc);
          setMyHandRank(rank);
          animateBar(rank);
        } else {
          setMyHandRank(null);
        }
      }
    });
  }, [roomCode, user?.uid]);

  // ── HOST INICIA JUEGO ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!room || !user || initDone.current) return;
    const phase = room.gameState?.phase;
    if (room.host !== user.uid) return;
    if (phase && phase !== 'dealing') return;
    console.log('DEAL CHECK:', {
      hasRoom: !!room,
      hasUser: !!user,
      isHost: room?.host === user?.uid,
      initDone: initDone.current,
      phase: room?.gameState?.phase,
      roomHost: room?.host,
      userUid: user?.uid
    });
    initDone.current = true;
    dealCards();
  }, [room, user]);

  // ── DEAL CARDS ──────────────────────────────────────────────────────────────
  const dealCards = async () => {
    console.log('DEAL CARDS INICIANDO...');
    console.log('roomCode:', roomCode);
    const r = roomRef.current;
    console.log('roomRef.current:', r ? 'existe' : 'null');
    if (!r) {
      console.error('DEAL CARDS: roomRef.current es null');
      return;
    }
    console.log('r.players:', r.players);
    const deck = shuffle(createDeck());
    console.log('deck creado, length:', deck.length);
    const uids = Object.keys(r.players || {});
    console.log('DEAL CARDS: jugadores:', uids);

    const hands = {};
    const chips = {};
    uids.forEach((uid, i) => {
      hands[uid] = [deck[i * 2], deck[i * 2 + 1]];
      chips[uid] = r.players[uid]?.chips || CHIPS_START;
    });
    console.log('hands y chips creados');

    // Blinds
    const sb = uids[1 % uids.length];
    const bb = uids[2 % uids.length];
    chips[sb] = Math.max(0, chips[sb] - SB);
    chips[bb] = Math.max(0, chips[bb] - BB);
    console.log('blinds aplicados');

    const startIdx = uids.length * 2;
    const communityDeck = deck.slice(startIdx, startIdx + 5);

    const gameStateData = {
      phase:          'preflop',
      hands,
      chips,
      communityCards: [],
      communityDeck,
      pot:            SB + BB,
      currentBet:     BB,
      currentTurn:    uids[0],
      dealer:         uids[0],
      foldedPlayers:  [],
      bets:           { [sb]: SB, [bb]: BB },
      acted:          [],
    };

    console.log('DEAL CARDS: Llamando updateGameState...');
    console.log('ROOMCODE:', roomCode);
    console.log('GAMESTATE A ENVIAR:', JSON.stringify({
      phase: 'preflop',
      potSize: SB + BB,
      uidsCount: uids.length
    }));
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout después de 10 segundos')), 10000)
      );
      
      await Promise.race([
        updateGameState(roomCode, gameStateData),
        timeoutPromise
      ]);
      
      console.log('DEAL CARDS EXITOSO');
    } catch(e) {
      console.error('DEAL CARDS ERROR:', e.message);
      console.error('DEAL CARDS ERROR STACK:', e.stack);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // ── ANIMACIONES ─────────────────────────────────────────────────────────────
  const pulsePot = () => {
    Animated.sequence([
      Animated.spring(potScale, { toValue: 1.35, useNativeDriver: true, speed: 25 }),
      Animated.spring(potScale, { toValue: 1,    useNativeDriver: true, speed: 14 }),
    ]).start();
  };

  const animateBar = (rank) => {
    const pct = HAND_INFO[rank]?.pct || 0;
    Animated.timing(barWidth, {
      toValue: pct / 100,
      duration: 600,
      useNativeDriver: false,
    }).start();
  };

  // ── ACCIÓN GENÉRICA ─────────────────────────────────────────────────────────
  const doAction = async (betDelta, isFold = false) => {
    const gs = gsRef.current;
    const r  = roomRef.current;
    if (!gs || !r || !user) return;

    const uid  = user.uid;
    const uids = Object.keys(r.players);

    // Calcular nuevo estado
    const addToPot = Math.min(betDelta, myChips);
    const newMyChips = myChips - addToPot;
    const newMyBet   = isFold ? myBet : myBet + addToPot;
    const newPot     = (gs.pot || 0) + addToPot;
    const newBets    = { ...(gs.bets || {}), [uid]: newMyBet };
    const newChips   = { ...(gs.chips || {}), [uid]: newMyChips };
    const newFolded  = isFold
      ? [...(gs.foldedPlayers || []), uid]
      : (gs.foldedPlayers || []);

    // ✅ Registrar que este jugador actuó
    const newActed = [...new Set([...(gs.acted || []), uid])];

    // Nuevo bet level de la mesa
    const newTableBet = isFold
      ? gs.currentBet || BB
      : Math.max(gs.currentBet || BB, newMyBet);

    const updatedGs = {
      ...gs,
      pot:           newPot,
      bets:          newBets,
      chips:         newChips,
      currentBet:    newTableBet,
      foldedPlayers: newFolded,
      acted:         newActed,
    };

    pulsePot();

    // Activos después de la acción
    const active = uids.filter(u => !newFolded.includes(u));

    // Solo queda 1 → showdown
    if (active.length <= 1) {
      await updateGameState(roomCode, updatedGs);
      return handleShowdown(updatedGs);
    }

    // ✅ CONDICIÓN CORRECTA PARA AVANZAR FASE:
    // Todos los activos actuaron Y todas sus apuestas son iguales (o están all-in)
    const allActed = active.every(u => newActed.includes(u));
    const allEqual = active.every(u =>
      (newBets[u] || 0) >= newTableBet || (newChips[u] || 0) === 0
    );

    if (allActed && allEqual) {
      // Avanzar a siguiente fase
      await updateGameState(roomCode, updatedGs);
      return advancePhase(updatedGs);
    }

    // Siguiente turno
    const activeIdx = active.indexOf(uid);
    const nextUid   = active[(activeIdx + 1) % active.length];

    await updateGameState(roomCode, { ...updatedGs, currentTurn: nextUid });
  };

  // ── ACCIONES DEL JUGADOR ────────────────────────────────────────────────────
  const handleFold = async () => {
    if (!isMyTurn || folded) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setFolded(true);
    await doAction(0, true);
    await assignShot(roomCode, user.uid, user.uid, 'Fold cobarde 🐔', 1);
  };

  const handleCall = async () => {
    if (!isMyTurn || folded) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const toCall = Math.min(tableBet - myBet, myChips);
    await doAction(toCall);
  };

  const handleRaise = async (amount) => {
    if (!isMyTurn || folded) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const toAdd = Math.min((tableBet - myBet) + amount, myChips);
    await doAction(toAdd);
  };

  const handleAllIn = async () => {
    if (!isMyTurn || folded || myChips <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await doAction(myChips);
  };

  // ── AVANZAR FASE ─────────────────────────────────────────────────────────────
  const advancePhase = async (gs) => {
    const r = roomRef.current;
    if (!r) return;

    const phaseIdx  = PHASES.indexOf(gs.phase);
    const nextPhase = PHASES[phaseIdx + 1] || 'showdown';

    if (nextPhase === 'showdown') {
      return handleShowdown(gs);
    }

    const cd = gs.communityDeck || [];
    const newCommunity =
      nextPhase === 'flop'  ? cd.slice(0, 3) :
      nextPhase === 'turn'  ? cd.slice(0, 4) :
      nextPhase === 'river' ? cd.slice(0, 5) :
      gs.communityCards || [];

    const active   = Object.keys(r.players).filter(u => !(gs.foldedPlayers || []).includes(u));
    const firstUid = active[0];

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await updateGameState(roomCode, {
      ...gs,
      phase:          nextPhase,
      communityCards: newCommunity,   // ✅ revelar cartas
      currentBet:     0,
      bets:           {},
      currentTurn:    firstUid,
      acted:          [],             // ✅ resetear quién actuó
    });
  };

  // ── SHOWDOWN ─────────────────────────────────────────────────────────────────
  const handleShowdown = async (gs) => {
    const r = roomRef.current;
    if (!r) return;

    const uids   = Object.keys(r.players);
    const active = uids.filter(u => !(gs.foldedPlayers || []).includes(u));
    if (active.length === 0) return;

    // Revelar todas las comunitarias
    const finalComm = gs.communityDeck?.slice(0, 5) || gs.communityCards || [];

    // Determinar ganador
    let bestRank = -1, winnerUid = active[0], winnerHandName = '';
    active.forEach(uid => {
      const rank = safeRank(gs.hands?.[uid], finalComm);
      if (rank > bestRank) {
        bestRank = rank;
        winnerUid = uid;
        try { winnerHandName = evaluateHand([...(gs.hands[uid] || []), ...finalComm])?.name || ''; } catch {}
      }
    });

    setWinners([winnerUid]);
    setPhase('showdown');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Dar pot al ganador
    const newChips = { ...(gs.chips || {}) };
    newChips[winnerUid] = (newChips[winnerUid] || CHIPS_START) + (gs.pot || 0);
    if (winnerUid === user?.uid) setMyChips(newChips[winnerUid]);

    await updateGameState(roomCode, {
      ...gs,
      phase:          'showdown',
      winner:         winnerUid,
      winnerHandName,
      chips:          newChips,
      communityCards: finalComm,
    });

    // Calcular shots para todos los perdedores
    const losers = active
      .filter(uid => uid !== winnerUid)
      .map(uid => {
        const rank = safeRank(gs.hands?.[uid], finalComm);
        const rule = getShotRule(rank);
        let handName = '';
        try { handName = evaluateHand([...(gs.hands[uid] || []), ...finalComm])?.name || ''; } catch {}
        assignShot(roomCode, winnerUid, uid, rule.msg, rule.shots);
        return {
          uid,
          name:     r.players[uid]?.name || 'Jugador',
          handName,
          shots:    rule.shots,
          icon:     rule.icon,
          color:    rule.color,
          msg:      rule.msg,
        };
      });

    if (losers.length > 0) {
      setTimeout(() => {
        setShotData({
          winner: {
            uid:      winnerUid,
            name:     r.players[winnerUid]?.name || 'Ganador',
            handName: winnerHandName,
          },
          losers,
        });
        setShotScreen(true);
      }, 1400);
    }
  };

  // ── NUEVA MANO ───────────────────────────────────────────────────────────────
  const handleNewHand = async () => {
    initDone.current = false;
    setPhase('dealing'); setMyHand([]); setCommunity([]);
    setFolded(false); setWinners([]); setMyBet(0);
    setTableBet(BB); setPot(0); setMyHandRank(null);
    setAllBets({}); setShotScreen(false); setShotData(null);
    barWidth.setValue(0);
    await updateGameState(roomCode, null);
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  if (loading || !room) {
    return (
      <View style={s.loader}>
        <Text style={{ fontSize: 48 }}>🃏</Text>
        <Text style={s.loaderText}>Cargando mesa...</Text>
      </View>
    );
  }

  const players    = Object.values(room.players || {});
  const me         = players.find(p => p.uid === user?.uid);
  const others     = players.filter(p => p.uid !== user?.uid);
  const top        = others.slice(0, 3);
  const sideLeft   = others.slice(3, 5);
  const sideRight  = others.slice(5, 7);
  const toCall     = Math.max(0, tableBet - myBet);
  const gs         = gsRef.current;
  const handInfo   = myHandRank !== null ? getHandInfo(myHandRank) : null;
  const barColor   = handInfo?.color || '#888';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#040D04','#081508','#040D04']} style={StyleSheet.absoluteFill} />

      {/* ══ MESA OVAL ══ */}
      <View style={s.tableShell}>
        <LinearGradient colors={['#3D1E00','#5C3000','#3D1E00']} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['#0B3B0B','#093009','#0B3B0B']} style={s.felt} />
        {/* Brillo central */}
        <View style={s.feltGlow} />
        {/* Línea decorativa */}
        <View style={s.feltRing} />
      </View>

      <Animated.View style={[s.layout, { opacity: fadeIn }]}>

        {/* ══ OPONENTES ARRIBA ══ */}
        <View style={s.topRow}>
          {top.map(p => (
            <OpponentSlot
              key={p.uid} p={p} gs={gs} allHands={allHands}
              allChips={allChips} allBets={allBets}
              winners={winners} dealerUid={dealerUid}
            />
          ))}
          {top.length === 0 && (
            <View style={s.emptySlot}>
              <Text style={s.emptySlotText}>Esperando jugadores...</Text>
            </View>
          )}
        </View>

        {/* ══ LATERALES ══ */}
        {sideLeft.map(p => (
          <View key={p.uid} style={[s.sideSlot, s.sideLeft]}>
            <OpponentSlot p={p} gs={gs} allHands={allHands} allChips={allChips} allBets={allBets} winners={winners} dealerUid={dealerUid} small />
          </View>
        ))}
        {sideRight.map((p, i) => (
          <View key={p.uid} style={[s.sideSlot, s.sideRight, { top: `${32 + i * 22}%` }]}>
            <OpponentSlot p={p} gs={gs} allHands={allHands} allChips={allChips} allBets={allBets} winners={winners} dealerUid={dealerUid} small />
          </View>
        ))}

        {/* ══ CENTRO ══ */}
        <View style={s.center}>

          {/* POZO */}
          <Animated.View style={[s.potWrap, { transform: [{ scale: potScale }] }]}>
            <LinearGradient colors={['#1A0800','#2C1200']} style={s.potInner}>
              <Text style={s.potLabel}>POZO</Text>
              <View style={s.potRow}>
                <Text style={s.potChip}>🪙</Text>
                <Text style={s.potAmt}>{pot.toLocaleString()}</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* FASE */}
          <LinearGradient colors={['#000','#111']} style={s.phasePill}>
            <Text style={s.phaseText}>{PHASE_LABEL[phase] || phase}</Text>
          </LinearGradient>

          {/* CARTAS COMUNITARIAS */}
          <View style={s.communityRow}>
            {[0,1,2,3,4].map(i =>
              community[i]
                ? <CardComponent key={i} card={community[i]} faceUp size="sm" animated />
                : <EmptyCardSlot key={i} size="sm" />
            )}
          </View>

          {/* APUESTAS EN MESA por jugador */}
          <View style={s.betsRow}>
            {Object.entries(allBets).map(([uid, bet]) =>
              bet > 0 ? (
                <View key={uid} style={s.betChip}>
                  <Text style={s.betChipText}>{bet}🪙</Text>
                </View>
              ) : null
            )}
          </View>
        </View>

        {/* ══ MI ZONA ══ */}
        <View style={s.myZone}>

          {/* INDICADOR DE FUERZA DE MANO */}
          {handInfo && phase !== 'showdown' && (
            <View style={s.handStrengthWrap}>
              <View style={s.handStrengthRow}>
                <Text style={[s.handName, { color: barColor }]}>{handInfo.name}</Text>
                <Text style={[s.handPct, { color: barColor }]}>{handInfo.pct}%</Text>
              </View>
              <View style={s.barBg}>
                <Animated.View style={[
                  s.barFill,
                  {
                    backgroundColor: barColor,
                    width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  }
                ]} />
              </View>
            </View>
          )}

          {/* MIS CARTAS */}
          <View style={s.myCards}>
            {myHand.length > 0
              ? myHand.map((card, i) => (
                  <CardComponent key={i} card={card} faceUp={!folded} size="lg" animated />
                ))
              : [0,1].map(i => <EmptyCardSlot key={i} size="lg" />)
            }
          </View>

          {/* MI AVATAR */}
          {me && (
            <PlayerAvatar
              player={{ ...me, chips: myChips, currentBet: myBet }}
              size="md"
              isCurrentTurn={isMyTurn}
              isWinner={winners.includes(user?.uid)}
              isFolded={folded}
              isDealer={dealerUid === user?.uid}
              showChips showShots
            />
          )}

          {/* ══ BOTONES DE ACCIÓN ══ */}
          {phase !== 'showdown' && !folded && (
            <View style={s.actions}>

              {/* FOLD */}
              <TouchableOpacity
                style={[s.actionBtn, s.foldStyle, !isMyTurn && s.dim]}
                onPress={handleFold} disabled={!isMyTurn} activeOpacity={0.82}
              >
                <Text style={s.foldTxt}>FOLD</Text>
                <Text style={s.actionSub}>+1🥃</Text>
              </TouchableOpacity>

              {/* CHECK / CALL */}
              <TouchableOpacity
                style={[s.actionBtn, s.gradStyle, !isMyTurn && s.dim]}
                onPress={handleCall} disabled={!isMyTurn} activeOpacity={0.82}
              >
                <LinearGradient
                  colors={isMyTurn ? ['#FF9500','#FF6B00'] : ['#2A2A2A','#1A1A1A']}
                  style={s.gradInner}
                >
                  <Text style={[s.actionTxt, !isMyTurn && s.dimTxt]}>
                    {toCall === 0 ? 'CHECK' : 'VER'}
                  </Text>
                  <Text style={[s.actionSub, !isMyTurn && s.dimSub]}>
                    {toCall === 0 ? 'GRATIS' : `${toCall}🪙`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* RAISE */}
              <TouchableOpacity
                style={[s.actionBtn, s.gradStyle, !isMyTurn && s.dim]}
                onPress={() => handleRaise(BB * 2)} disabled={!isMyTurn} activeOpacity={0.82}
              >
                <LinearGradient
                  colors={isMyTurn ? ['#FFB800','#FF8C00'] : ['#2A2A2A','#1A1A1A']}
                  style={s.gradInner}
                >
                  <Text style={[s.actionTxt, !isMyTurn && s.dimTxt]}>SUBIR</Text>
                  <Text style={[s.actionSub, !isMyTurn && s.dimSub]}>{BB * 2}🪙</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* ALL IN */}
              <TouchableOpacity
                style={[s.actionBtn, s.allInStyle, (!isMyTurn || myChips <= 0) && s.dim]}
                onPress={handleAllIn} disabled={!isMyTurn || myChips <= 0} activeOpacity={0.82}
              >
                <Text style={s.allInTxt}>ALL{'\n'}IN</Text>
                <Text style={s.actionSub}>☠️</Text>
              </TouchableOpacity>

            </View>
          )}

          {/* ESPERANDO */}
          {!isMyTurn && !folded && phase !== 'showdown' && (
            <View style={s.waitBar}>
              <Text style={s.waitTxt}>⏳ Esperando tu turno...</Text>
            </View>
          )}

          {/* FOLDED */}
          {folded && phase !== 'showdown' && (
            <View style={[s.waitBar, { borderColor: '#FF3B3022' }]}>
              <Text style={[s.waitTxt, { color: '#FF3B3060' }]}>🃏 Te retiraste esta mano</Text>
            </View>
          )}

          {/* NUEVA MANO */}
          {phase === 'showdown' && (
            <TouchableOpacity style={s.newHandBtn} onPress={handleNewHand} activeOpacity={0.85}>
              <LinearGradient colors={['#FFB800','#FF6B00']} style={s.newHandInner}>
                <Text style={s.newHandTxt}>🃏 NUEVA MANO</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

        </View>
      </Animated.View>

      {/* ══ WINNER FLASH ══ */}
      {phase === 'showdown' && winners.length > 0 && !shotScreen && (
        <View style={s.winOverlay} pointerEvents="none">
          <Text style={winners[0] === user?.uid ? s.winTxt : s.loseTxt}>
            {winners[0] === user?.uid ? '🏆 ¡GANASTE!' : '💀 PERDISTE'}
          </Text>
          {gs?.winnerHandName ? (
            <View style={s.winHandBadge}>
              <Text style={s.winHandTxt}>{gs.winnerHandName}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* ══ PANTALLA DE SHOTS ══ */}
      {shotScreen && shotData && (
        <ShotScreen
          data={shotData}
          onDone={() => setShotScreen(false)}
          onNewHand={handleNewHand}
          isMe={uid => uid === user?.uid}
        />
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: Slot de oponente
// ══════════════════════════════════════════════════════════════════════════════
function OpponentSlot({ p, gs, allHands, allChips, allBets, winners, dealerUid, small }) {
  const isFoldedP  = (gs?.foldedPlayers || []).includes(p.uid);
  const isMyTurnP  = gs?.currentTurn === p.uid;
  const chips      = allChips[p.uid] ?? p.chips ?? 500;
  const bet        = allBets[p.uid] || 0;
  const size       = small ? 'xs' : 'sm';

  return (
    <View style={s.oppSlot}>
      <PlayerAvatar
        player={{ ...p, chips, currentBet: bet }}
        size={size}
        isCurrentTurn={isMyTurnP}
        isWinner={winners.includes(p.uid)}
        isFolded={isFoldedP}
        isDealer={dealerUid === p.uid}
        showChips showShots
      />
      {/* Cartas del oponente */}
      <View style={s.oppCards}>
        {[0, 1].map(i => (
          <CardComponent
            key={i}
            card={allHands[p.uid]?.[i]}
            faceUp={gs?.phase === 'showdown' && !isFoldedP}
            size="xs"
            animated
          />
        ))}
      </View>
      {/* Apuesta actual sobre la mesa */}
      {bet > 0 && (
        <View style={s.oppBetBadge}>
          <Text style={s.oppBetTxt}>{bet}🪙</Text>
        </View>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: Pantalla de Shots épica
// ══════════════════════════════════════════════════════════════════════════════
function ShotScreen({ data, onDone, onNewHand, isMe }) {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[s.shotScreen, { opacity: fadeAnim }]}>
      <LinearGradient colors={['#060000','#120000','#060000']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={s.shotScroll}
        showsVerticalScrollIndicator={false}
        bounces={Platform.OS === 'ios'}
      >
        {/* GANADOR */}
        <View style={s.shotWinner}>
          <Text style={s.shotWinnerIcon}>🏆</Text>
          <Text style={s.shotWinnerName}>{data.winner.name}</Text>
          {data.winner.handName ? (
            <View style={s.shotWinnerBadge}>
              <Text style={s.shotWinnerBadgeTxt}>{data.winner.handName}</Text>
            </View>
          ) : null}
          <Text style={s.shotWinnerSub}>¡NO BEBE NADA! 😎</Text>
        </View>

        <View style={s.shotDivider}>
          <View style={s.shotDivLine} /><Text style={s.shotDivTxt}>PERDEDORES</Text><View style={s.shotDivLine} />
        </View>

        {/* CADA PERDEDOR */}
        {data.losers.map((loser) => (
          <Animated.View
            key={loser.uid}
            style={[s.loserCard, { borderColor: loser.color + '55', transform: [{ translateY: slideAnim }] }]}
          >
            <LinearGradient colors={['#140000','#0A0000']} style={StyleSheet.absoluteFill} />

            <View style={s.loserTop}>
              <Text style={s.loserIcon}>{loser.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.loserName}>{loser.name} {isMe(loser.uid) ? '(Tú)' : ''}</Text>
                {loser.handName ? <Text style={s.loserHand}>{loser.handName}</Text> : null}
                <Text style={[s.loserMsg, { color: loser.color }]}>{loser.msg}</Text>
              </View>
            </View>

            {/* ✅ VASOS VISUALES */}
            {loser.shots > 0 && (
              <View style={s.glassRow}>
                {Array.from({ length: loser.shots }).map((_, gi) => (
                  <GlassIcon key={gi} delay={gi * 180} color={loser.color} />
                ))}
              </View>
            )}

            {/* BADGE CANTIDAD */}
            <View style={[s.shotBadge, { borderColor: loser.color + '60', backgroundColor: loser.color + '18' }]}>
              <Text style={[s.shotBadgeNum, { color: loser.color }]}>{loser.shots}</Text>
              <Text style={[s.shotBadgeLbl, { color: loser.color }]}>
                {loser.shots === 1 ? 'SHOT' : 'SHOTS'}
              </Text>
            </View>
          </Animated.View>
        ))}

        {/* BOTONES */}
        <TouchableOpacity style={s.drinkBtn} onPress={onDone} activeOpacity={0.85}>
          <LinearGradient colors={['#CC0000','#990000']} style={s.drinkBtnInner}>
            <Text style={s.drinkBtnTxt}>🤘 ¡TODOS BEBIERON! 🤘</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={s.newHandSmall} onPress={onNewHand} activeOpacity={0.85}>
          <Text style={s.newHandSmallTxt}>🃏 Nueva mano</Text>
        </TouchableOpacity>

      </ScrollView>
    </Animated.View>
  );
}

// Vaso animado individual
function GlassIcon({ delay, color }) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: 1, duration: 700, delay, useNativeDriver: false,
    }).start();
  }, []);
  const fillH = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '65%'] });
  return (
    <View style={s.glass}>
      <View style={s.glassCup}>
        <Animated.View style={[s.glassLiquid, { height: fillH, backgroundColor: color }]} />
      </View>
      <View style={[s.glassStem, { backgroundColor: color + '80' }]} />
      <View style={[s.glassBase, { backgroundColor: color + '60' }]} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ESTILOS
// ══════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#040D04' },
  loader: { flex: 1, backgroundColor: '#040D04', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loaderText: { color: '#FFB800', fontSize: 16, fontWeight: '700' },

  // Mesa oval
  tableShell: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: Platform.OS === 'ios' ? 92 : 56,
    bottom: Platform.OS === 'ios' ? 185 : 220,
    borderRadius: 999,
    overflow: 'hidden',
    elevation: 0,
    zIndex: -1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 22,
  },
  felt: { position: 'absolute', top: 9, left: 9, right: 9, bottom: 9, borderRadius: 999 },
  feltGlow: {
    position: 'absolute', top: '20%', left: '15%', right: '15%', bottom: '20%',
    borderRadius: 999, backgroundColor: 'rgba(15,60,15,0.35)',
  },
  feltRing: {
    position: 'absolute', top: 14, left: 14, right: 14, bottom: 14,
    borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,184,0,0.08)',
  },

  layout: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 26,
    paddingHorizontal: 4,
    justifyContent: 'space-between',
  },

  // TOP ROW
  topRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 12, minHeight: 108,
  },
  emptySlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptySlotText: { color: '#FFFFFF20', fontSize: 11 },

  oppSlot: { alignItems: 'center', gap: 3, position: 'relative' },
  oppCards: { flexDirection: 'row', gap: 2 },
  oppBetBadge: {
    backgroundColor: '#FFB80022', borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 1, borderColor: '#FFB80040',
    marginTop: 2,
  },
  oppBetTxt: { color: '#FFB800', fontSize: 9, fontWeight: '800' },

  // SIDES
  sideSlot: { position: 'absolute', zIndex: 5, top: '30%' },
  sideLeft:  { left: 0 },
  sideRight: { right: 0 },

  // CENTER
  center: { alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
  potWrap: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: '#FFB800', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55, shadowRadius: 12, elevation: 8,
  },
  potInner: {
    paddingHorizontal: 24, paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#FFB80035', borderRadius: 18,
  },
  potLabel: { color: '#FFB80065', fontSize: 8, letterSpacing: 4, fontWeight: '800' },
  potRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  potChip: { fontSize: 18 },
  potAmt:  { color: '#FFB800', fontSize: 28, fontWeight: '900' },
  phasePill: {
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 5,
    borderWidth: 1, borderColor: '#FFB80020',
  },
  phaseText: { color: '#FFB800', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  communityRow: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  betsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  betChip: {
    backgroundColor: '#FFB80015', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: '#FFB80030',
  },
  betChipText: { color: '#FFB80090', fontSize: 10, fontWeight: '700' },

  // MY ZONE
  myZone: { alignItems: 'center', gap: 7, paddingBottom: Platform.OS === 'ios' ? 22 : 8 },

  // HAND STRENGTH
  handStrengthWrap: {
    width: '88%', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12,
    padding: 10, borderWidth: 1, borderColor: '#FFFFFF10',
  },
  handStrengthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  handName: { fontSize: 13, fontWeight: '800' },
  handPct:  { fontSize: 11, fontWeight: '700' },
  barBg: {
    height: 7, backgroundColor: '#FFFFFF15', borderRadius: 4, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },

  myCards: { flexDirection: 'row', gap: 12 },

  // ACTIONS
  actions: { flexDirection: 'row', gap: 5, paddingHorizontal: 8, width: '100%' },
  actionBtn: { flex: 1, borderRadius: 14, overflow: 'hidden', elevation: 4 },
  gradStyle: { flex: 1.3 },
  gradInner: { paddingVertical: 13, alignItems: 'center' },
  actionTxt: { color: '#000', fontSize: 13, fontWeight: '900' },
  actionSub: { color: 'rgba(255,255,255,0.5)', fontSize: 9, marginTop: 1 },
  dimTxt: { color: '#555' },
  dimSub: { color: '#444' },
  foldStyle: {
    backgroundColor: 'rgba(255,59,48,0.1)', borderWidth: 1.5, borderColor: '#FF3B30',
    paddingVertical: 13, alignItems: 'center',
  },
  foldTxt: { color: '#FF3B30', fontSize: 13, fontWeight: '900' },
  allInStyle: {
    backgroundColor: 'rgba(120,0,0,0.2)', borderWidth: 1.5, borderColor: '#CC0000',
    paddingVertical: 13, alignItems: 'center',
  },
  allInTxt: { color: '#FF5555', fontSize: 11, fontWeight: '900', textAlign: 'center' },
  dim: { opacity: 0.36 },

  waitBar: {
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 24,
    borderWidth: 1, borderColor: '#FFB80015',
    width: '100%', alignItems: 'center',
  },
  waitTxt: { color: '#FFFFFF40', fontSize: 14 },

  newHandBtn: { borderRadius: 16, overflow: 'hidden', width: '90%', elevation: 6 },
  newHandInner: { paddingVertical: 16, alignItems: 'center' },
  newHandTxt: { color: '#000', fontSize: 18, fontWeight: '900', letterSpacing: 1 },

  // WINNER OVERLAY
  winOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center', zIndex: 60,
  },
  winTxt: {
    color: '#FFD700', fontSize: 46, fontWeight: '900',
    textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30,
  },
  loseTxt: {
    color: '#FF3B30', fontSize: 46, fontWeight: '900',
    textShadowColor: '#FF3B30', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30,
  },
  winHandBadge: {
    marginTop: 10, backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: '#FFD70040',
  },
  winHandTxt: { color: '#FFD700', fontSize: 18, fontWeight: '800' },

  // SHOT SCREEN
  shotScreen: { ...StyleSheet.absoluteFillObject, zIndex: 200 },
  shotScroll: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 64 : 44,
    paddingHorizontal: 18, paddingBottom: 44, gap: 14,
  },
  shotWinner: {
    alignItems: 'center', gap: 7, padding: 22,
    backgroundColor: 'rgba(255,215,0,0.07)', borderRadius: 20,
    borderWidth: 2, borderColor: '#FFD70035',
  },
  shotWinnerIcon: { fontSize: 56 },
  shotWinnerName: { color: '#FFD700', fontSize: 24, fontWeight: '900' },
  shotWinnerBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: '#FFD70040',
  },
  shotWinnerBadgeTxt: { color: '#FFD700', fontSize: 14, fontWeight: '700' },
  shotWinnerSub: { color: '#34C759', fontSize: 16, fontWeight: '800', letterSpacing: 1 },

  shotDivider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shotDivLine: { flex: 1, height: 1, backgroundColor: '#FF3B3030' },
  shotDivTxt: { color: '#FF3B3070', fontSize: 13, fontWeight: '800', letterSpacing: 3 },

  loserCard: {
    borderRadius: 18, borderWidth: 1.5, overflow: 'hidden', padding: 16, gap: 12,
  },
  loserTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  loserIcon: { fontSize: 36 },
  loserName: { color: '#FFF', fontSize: 17, fontWeight: '900' },
  loserHand: { color: '#FFFFFF70', fontSize: 12, marginTop: 2 },
  loserMsg:  { fontSize: 12, fontWeight: '600', marginTop: 3 },

  // VASOS
  glassRow: { flexDirection: 'row', gap: 14, justifyContent: 'center', flexWrap: 'wrap' },
  glass: { alignItems: 'center', gap: 2 },
  glassCup: {
    width: 30, height: 42, borderWidth: 2, borderColor: '#FFB800',
    borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end',
    backgroundColor: 'rgba(255,184,0,0.06)',
  },
  glassLiquid: { width: '100%' },
  glassStem: { width: 4, height: 8, borderRadius: 2 },
  glassBase: { width: 22, height: 4, borderRadius: 2 },

  shotBadge: {
    flexDirection: 'row', alignItems: 'baseline', gap: 6,
    alignSelf: 'center', borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 8,
  },
  shotBadgeNum: { fontSize: 38, fontWeight: '900' },
  shotBadgeLbl: { fontSize: 14, fontWeight: '800' },

  drinkBtn: { borderRadius: 18, overflow: 'hidden', elevation: 8 },
  drinkBtnInner: { paddingVertical: 18, alignItems: 'center' },
  drinkBtnTxt: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 },

  newHandSmall: { alignItems: 'center', paddingVertical: 12 },
  newHandSmallTxt: { color: '#FFB80070', fontSize: 15, fontWeight: '700' },
});
