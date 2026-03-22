// src/screens/games/PokerTableScreen.js
// ✅ v6 - Pausa grupal de tragos + evaluación correcta + medidor de pozo

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Animated, Platform, StatusBar, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ref, update, onValue } from 'firebase/database';
import { database } from '../../config/firebase';

import { listenToRoom, updateGameState, assignShot, leaveRoom } from '../../services/roomService';
import { getCurrentUser } from '../../services/authService';
import { createDeck, shuffle } from '../../utils/games/cardDeck';
import { evaluateHand } from '../../utils/games/pokerLogic';
import { CardComponent, EmptyCardSlot } from '../../components/poker/CardComponent';
import { PlayerAvatar } from '../../components/poker/PlayerAvatar';

const { width: W, height: H } = Dimensions.get('window');
const isTablet = W >= 768;
const isSmallPhone = H < 700;
const BOTTOM_INSET = Platform.OS === 'ios' ? 34 : 
  (StatusBar.currentHeight || 24) + 8;
const CHIPS_START = 500;
const BB = 20;
const SB = 10;

const PHASES = ['preflop', 'flop', 'turn', 'river', 'showdown'];
const PHASE_LABEL = {
  dealing:  '🃏 REPARTIENDO',
  preflop:  '🔥 PRE-FLOP',
  flop:     '🃏 FLOP',
  turn:     '🃏 TURN',
  river:    '🃏 RIVER',
  showdown: '👁 SHOWDOWN',
};

// ── FUERZA DE MANO (rank 1-10 de pokerLogic) ─────────────────────────────────
const HAND_INFO = [
  { name: '',                color: '#888888', pct: 0   }, // 0 unused
  { name: 'Carta Alta',      color: '#888888', pct: 5   }, // 1
  { name: 'Par',             color: '#4FC3F7', pct: 18  }, // 2
  { name: 'Doble Par',       color: '#29B6F6', pct: 32  }, // 3
  { name: 'Trío',            color: '#26C6DA', pct: 45  }, // 4
  { name: 'Escalera',        color: '#66BB6A', pct: 58  }, // 5
  { name: 'Color',           color: '#AB47BC', pct: 68  }, // 6
  { name: 'Full House',      color: '#FF7043', pct: 78  }, // 7
  { name: 'Póker',           color: '#FFA726', pct: 88  }, // 8
  { name: 'Escalera Color',  color: '#FF6B00', pct: 95  }, // 9
  { name: 'Escalera Real',   color: '#FFD700', pct: 100 }, // 10
];
const getHandInfo = (rank) => HAND_INFO[Math.min(Math.max(rank ?? 0, 0), 10)];

// ── RANK SEGURO (evaluateHand recibe 2 args separados) ────────────────────────
const safeRank = (hand, community) => {
  try {
    if (!hand?.length) return 0;
    const result = evaluateHand(hand, community || []);
    if (!result) return 0;
    // Si es carta alta, usar valor de carta como decimal
    if (result.rank === 1) {
      return 1 + (result.highCard || 0) / 100;
    }
    return result.rank ?? 0;
  } catch { return 0; }
};

// ── PENALIZACIÓN DE TRAGOS según rango y config ───────────────────────────────
const getDrinkPenalty = (rank, dc, playerBet, maxBet) => {
  if (!dc) {
    if (rank >= 8) return {shots:0,everyone:true,icon:'👑',color:'#FFD700',msg:'Escalera Real'};
    if (rank >= 6) return {shots:1,icon:'🥃',color:'#FF9500',msg:'1 tequila'};
    if (rank >= 2) return {shots:2,icon:'🥃',color:'#FF6B00',msg:'2 mezcales'};
    return {shots:3,icon:'💀',color:'#FF3B30',msg:'3 shots'};
  }
  const pct = maxBet > 0 ? Math.min(playerBet / maxBet, 1.0) : 1.0;
  const drinkAmount = parseFloat((pct * dc.maxValue).toFixed(2));
  const pctLabel = Math.round(pct * 100);
  return {
    shots: drinkAmount,
    icon: dc.icon,
    color: dc.color,
    msg: `Apostaste ${pctLabel}% → bebe ${drinkAmount} ${dc.unit}`,
  };
};

// ══════════════════════════════════════════════════════════════════════════════
export default function PokerTableScreen({ navigation, route }) {
  const { roomCode, drinkConfig: routeDrinkConfig } = route.params || {};

  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [room,        setRoom]        = useState(null);
  const [drinkConfig, setDrinkConfig] = useState(routeDrinkConfig || null);
  const [phase,       setPhase]       = useState('dealing');
  const [community,   setCommunity]   = useState([]);
  const [myHand,      setMyHand]      = useState([]);
  const [allHands,    setAllHands]    = useState({});
  const [pot,         setPot]         = useState(0);
  const [myChips,     setMyChips]     = useState(CHIPS_START);
  const [myBet,       setMyBet]       = useState(0);
  const [tableBet,    setTableBet]    = useState(BB);
  const [folded,      setFolded]      = useState(false);
  const [isMyTurn,    setIsMyTurn]    = useState(false);
  const [dealerUid,   setDealerUid]   = useState(null);
  const [winners,     setWinners]     = useState([]);
  const [allBets,     setAllBets]     = useState({});
  const [allChips,    setAllChips]    = useState({});
  const [myHandRank,  setMyHandRank]  = useState(null);

  // ── PAUSA GRUPAL DE TRAGOS ────────────────────────────────────────────────
  const [drinkPause,     setDrinkPause]     = useState(false);
  const [drinkPauseData, setDrinkPauseData] = useState(null);
  // { losers: [{uid, name, shots, msg, icon, color}], confirmed: {uid: true} }

  const [shotScreen,  setShotScreen]  = useState(false);
  const [shotData,    setShotData]    = useState(null);
  const [timeLeft,    setTimeLeft]    = useState(20);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(0.5);

  const potAnim  = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  // Cálculo de tragos acumulados en el pozo
  const drinkPot = drinkConfig 
    ? drinkConfig.maxValue  // Mostrar máximo que beberá el perdedor
    : 0;

  const unsubRef  = useRef(null);
  const gsRef     = useRef(null);
  const roomRef   = useRef(null);
  const initDone  = useRef(false);

  // ── INIT ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    getCurrentUser()
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => setLoading(false));
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  // ── LISTENER ───────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('🎯 LISTENER SETUP:', { 
      roomCode, 
      userUid: user?.uid 
    });
    if (!roomCode || !user?.uid) return;
    unsubRef.current = listenToRoom(roomCode, (data) => {
      if (!data) return;
      setRoom(data);
      roomRef.current = data;
      console.log('📡 ROOM ACTUALIZADO:', 
        Object.keys(data.players || {}).length, 
        'jugadores');
      if (data.drinkConfig) setDrinkConfig(data.drinkConfig);

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

      if (gs.hands?.[uid]) {
        const hand = gs.hands[uid];
        setMyHand(hand);
        const cc = gs.communityCards || [];
        if (cc.length > 0) {
          const rank = safeRank(hand, cc);
          setMyHandRank(rank);
          animateBar(rank);
        } else { setMyHandRank(null); }
      }

      // ✅ Escuchar pausa grupal de tragos
      if (gs.drinkPause) {
        console.log('📱 DRINK PAUSE RECIBIDO:', 
          JSON.stringify((data.gameState?.drinkPause?.losers || [])
            .map(l => ({name: l.name, shots: l.shots})))
        );
        setDrinkPauseData(gs.drinkPause);
        setDrinkPause(true);
      } else {
        setDrinkPause(false);
        setDrinkPauseData(null);
      }
    });
  }, [roomCode, user?.uid]);

  // ── TEMPORIZADOR ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isMyTurn || folded || phase === 'showdown') {
      setTimeLeft(20);
      return;
    }
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Si puede hacer check (toCall===0) → check
          // Si no → fold automático
          if (tableBet <= myBet) {
            handleCall();
          } else {
            handleFold();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isMyTurn, phase, folded]);

  // ── HOST INICIA ─────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('🃏 DEAL EFFECT:', { 
      hasRoom: !!room, hasUser: !!user, 
      initDone: initDone.current,
      isHost: room?.host === user?.uid,
      phase: room?.gameState?.phase
    });
    if (!room || !user) return;
    if (initDone.current) return;
    if (room.host !== user.uid) return;
    const ph = room.gameState?.phase;
    // Solo ejecutar si NO hay gameState O si está en 'dealing'
    if (room.gameState && room.gameState.phase !== 'dealing') return;
    roomRef.current = room;
    initDone.current = true;
    dealCards();
  }, [room?.host, user?.uid, room?.gameState?.phase]);

  // ── DEAL ───────────────────────────────────────────────────────────────────
  const dealCards = async () => {
    console.log('🎴 DEAL CARDS INICIANDO...');
    const r = roomRef.current || room;
    console.log('🏠 ROOM DATA:', { 
      roomRefExists: !!roomRef.current,
      roomExists: !!room,
      rExists: !!r,
      rPlayers: r ? Object.keys(r.players || {}).length : 0
    });
    if (!r) {
      console.log('❌ No hay room data');
      return;
    }
    const uids = Object.keys(r.players);
    if (!uids.length) {
      console.log('❌ No hay jugadores');
      return;
    }
    console.log('🃏 Paso 1: shuffleDeck');
    let deck;
    try {
      deck = shuffle(createDeck());
      console.log('🃏 deck OK:', deck?.length);
    } catch(e) {
      console.error('❌ ERROR EN DECK:', e.message);
      return;
    }
    console.log('🃏 Paso 2: deck length', deck.length);
    console.log('🃏 Paso 3: uids', uids);
    const hands = {};
    const chips = {};
    uids.forEach((uid, i) => {
      hands[uid] = [deck[i * 2], deck[i * 2 + 1]];
      const currentChips = allChips[uid] || 
        r.players[uid]?.chips || CHIPS_START;
      chips[uid] = Math.max(currentChips, 0);
    });
    console.log('🃏 Paso 4: hands creadas', Object.keys(hands).length);
    const sb = uids[1 % uids.length];
    const bb = uids[2 % uids.length];
    console.log('🃏 Paso 5: sb', sb, 'bb', bb);
    chips[sb] = Math.max(0, chips[sb] - SB);
    chips[bb] = Math.max(0, chips[bb] - BB);
    const startIdx = uids.length * 2;
    const communityDeck = deck.slice(startIdx, startIdx + 5);
    console.log('🃏 Paso 6: communityDeck', communityDeck.length);
    console.log('🃏 Paso 7: llamando updateGameState...');
    try {
      await updateGameState(roomCode, {
        phase: 'preflop', hands, chips,
        communityCards: [], communityDeck,
        pot: SB + BB, currentBet: BB,
        currentTurn: uids[0], dealer: uids[0],
        foldedPlayers: [], bets: { [sb]: SB, [bb]: BB },
        acted: [bb], drinkPause: null,
      });
      console.log('DEAL CARDS EXITOSO');
    } catch(e) { console.error('DEAL CARDS ERROR:', e.message); }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // ── ANIMACIONES ─────────────────────────────────────────────────────────────
  const pulsePot = () => {
    Animated.sequence([
      Animated.spring(potAnim, { toValue: 1.35, useNativeDriver: true, speed: 25 }),
      Animated.spring(potAnim, { toValue: 1,    useNativeDriver: true, speed: 14 }),
    ]).start();
  };
  const animateBar = (rank) => {
    Animated.timing(barWidth, {
      toValue: (HAND_INFO[Math.min(rank, 10)]?.pct || 0) / 100,
      duration: 600, useNativeDriver: false,
    }).start();
  };

  // ── ACCIÓN PRINCIPAL ────────────────────────────────────────────────────────
  const doAction = async (betDelta, isFold = false) => {
    console.log('🎯 doAction INICIO', {betDelta, isFold, myChips, isMyTurn});
    const gs  = gsRef.current;
    const r   = roomRef.current;
    if (!gs || !r || !user) return;
    const uid  = user.uid;
    const uids = Object.keys(r.players);

    const addToPot   = Math.min(betDelta, myChips);
    const newMyChips = myChips - addToPot;
    const newMyBet   = isFold ? myBet : myBet + addToPot;
    const newPot     = (gs.pot || 0) + addToPot;
    const newBets    = { ...(gs.bets || {}), [uid]: newMyBet };
    const newChips   = { ...(gs.chips || {}), [uid]: newMyChips };
    const newFolded  = isFold ? [...(gs.foldedPlayers || []), uid] : (gs.foldedPlayers || []);
    const newActed   = [...new Set([...(gs.acted || []), uid])];
    const newTableBet = isFold ? (gs.currentBet || BB) : Math.max(gs.currentBet || BB, newMyBet);

    const updatedGs = {
      ...gs, pot: newPot, bets: newBets, chips: newChips,
      currentBet: newTableBet, foldedPlayers: newFolded, acted: newActed,
    };

    pulsePot();
    const active = uids.filter(u => !newFolded.includes(u));
    if (active.length <= 1) {
      console.log('🎯 doAction SALIDA: Solo 1 activo, showdown');
      await updateGameState(roomCode, updatedGs);
      return handleShowdown(updatedGs);
    }

    const allActed = active.every(u => newActed.includes(u));
    const allEqual = active.every(u => {
      const bet = newBets[u] || 0;
      const chips = newChips[u] || 0;
      return bet >= newTableBet || chips === 0;
    });

    if (allActed && allEqual) {
      console.log('🎯 doAction SALIDA: Todos actuaron y están iguales, avanzar fase');
      await updateGameState(roomCode, updatedGs);
      return advancePhase(updatedGs);
    }

    // Si el jugador hizo all-in, forzar siguiente turno
    const playerIsAllIn = newMyChips === 0 && !isFold;

    const activeIdx = active.indexOf(uid);
    const nextIdx = (activeIdx + 1) % active.length;
    const nextUid = active[nextIdx];

    // Si el jugador que sigue también está all-in,
    // buscar el siguiente que pueda actuar
    let finalNextUid = nextUid;
    for (let i = 1; i < active.length; i++) {
      const candidateIdx = (activeIdx + i) % active.length;
      const candidateUid = active[candidateIdx];
      if ((newChips[candidateUid] || 0) > 0) {
        finalNextUid = candidateUid;
        break;
      }
    }

    // Si todos están all-in → avanzar fase directamente
    const allAllIn = active.every(u => (newChips[u] || 0) === 0);
    if (allAllIn) {
      console.log('🎯 doAction SALIDA: Todos all-in, avanzar fase');
      await updateGameState(roomCode, updatedGs);
      return advancePhase(updatedGs);
    }

    console.log('🎯 doAction FINAL - nextUid:', finalNextUid, 
      'allActed:', allActed, 'allEqual:', allEqual,
      'allAllIn:', allAllIn);
    await updateGameState(roomCode, { 
      ...updatedGs, 
      currentTurn: finalNextUid 
    });
  };

  // ── ACCIONES ─────────────────────────────────────────────────────────────────
  const handleFold = async () => {
    if (!isMyTurn || folded) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setFolded(true);
    const dc = drinkConfig;
    const drinkAmount = dc?.bet25?.value || 0.5;
    const drinkLabel  = dc?.bet25?.label || '½ shot';
    await doAction(0, true);
    await assignShot(roomCode, user.uid, user.uid, `Fold - bebe: ${drinkLabel}`, drinkAmount);
    // Crear pausa grupal
    triggerDrinkPause([{
      uid: user.uid,
      name: room?.players?.[user.uid]?.name || 'Jugador',
      shots: drinkAmount,
      msg: `Hizo Fold → bebe ${drinkLabel}`,
      icon: dc?.icon || '🥃',
      color: dc?.color || '#FF6B00',
    }]);
  };

  const handleCall = async () => {
    if (!isMyTurn || folded) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const toCall = Math.min(tableBet - myBet, myChips);
    await doAction(toCall);
  };

  const handleRaise = async (pct) => {
    if (!isMyTurn || folded) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // pct = 0.5 (50% del pot) o 0.75 (75%)
    const raiseAmount = Math.max(BB * 2, Math.floor(pot * pct));
    const toAdd = Math.min((tableBet - myBet) + raiseAmount, myChips);
    await doAction(toAdd);
  };

  const handleRaiseAmount = async (pct) => {
    if (!isMyTurn || folded) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Si es 100% o más → All-In directo
    if (pct >= 1.0) {
      setShowRaiseSlider(false);
      return handleAllIn();
    }
    
    const raiseInChips = Math.floor(pct * CHIPS_START);
    const toAdd = Math.min(
      (tableBet - myBet) + raiseInChips, myChips
    );
    await doAction(toAdd);
    setShowRaiseSlider(false);
  };

  const handleAllIn = async () => {
    console.log('☠️ ALL-IN INICIANDO', {isMyTurn, folded, myChips});
    if (!isMyTurn || folded || myChips <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    console.log('☠️ ALL-IN llamando doAction con', myChips);
    await doAction(myChips);
    console.log('☠️ ALL-IN completado');
  };

  // ── PAUSA GRUPAL DE TRAGOS ────────────────────────────────────────────────
  const triggerDrinkPause = async (losers) => {
    const r = roomRef.current;
    if (!r) return;
    const pauseData = {
      losers,
      confirmed: {},
      totalPlayers: Object.keys(r.players).length,
      createdAt: Date.now(),
    };
    console.log('🥃 DRINK PAUSE LOSERS:', 
      JSON.stringify(losers.map(l => ({
        name: l.name, shots: l.shots
      })))
    );
    await updateGameState(roomCode, { ...gsRef.current, drinkPause: pauseData });
  };

  // ✅ Cada jugador confirma que bebió
  const confirmDrank = async () => {
    const gs = gsRef.current;
    if (!gs?.drinkPause || !user?.uid) return;
    const r = roomRef.current;
    const confirmed = { ...(gs.drinkPause.confirmed || {}), [user.uid]: true };
    const totalPlayers = Object.keys(r?.players || {}).length;
    const allConfirmed = Object.keys(confirmed).length >= totalPlayers;

    if (allConfirmed) {
      // Todos confirmaron → quitar pausa y continuar
      await updateGameState(roomCode, { ...gs, drinkPause: null });
    } else {
      await updateGameState(roomCode, {
        ...gs,
        drinkPause: { ...gs.drinkPause, confirmed },
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ── AVANZAR FASE ────────────────────────────────────────────────────────────
  const advancePhase = async (gs) => {
    const r = roomRef.current;
    if (!r) return;
    const phaseIdx  = PHASES.indexOf(gs.phase);
    const nextPhase = PHASES[phaseIdx + 1] || 'showdown';
    if (nextPhase === 'showdown') return handleShowdown(gs);
    const cd = gs.communityDeck || [];
    const newCommunity =
      nextPhase === 'flop'  ? cd.slice(0, 3) :
      nextPhase === 'turn'  ? cd.slice(0, 4) :
      nextPhase === 'river' ? cd.slice(0, 5) :
      gs.communityCards || [];
    const active = Object.keys(r.players).filter(u => !(gs.foldedPlayers || []).includes(u));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateGameState(roomCode, {
      ...gs, phase: nextPhase, communityCards: newCommunity,
      currentBet: 0, bets: {}, currentTurn: active[0], acted: [],
    });
  };

  // ── SHOWDOWN ──────────────────────────────────────────────────────────────
  const handleShowdown = async (gs) => {
    const r = roomRef.current;
    if (!r) return;
    const uids   = Object.keys(r.players);
    const active = uids.filter(u => !(gs.foldedPlayers || []).includes(u));
    if (active.length === 0) return;

    const finalComm = gs.communityDeck?.slice(0, 5) || gs.communityCards || [];
    let bestRank = -1, winnerUid = active[0], winnerHandName = '';
    active.forEach(uid => {
      const rank = safeRank(gs.hands?.[uid], finalComm);
      if (rank > bestRank) {
        bestRank = rank; winnerUid = uid;
        try { winnerHandName = evaluateHand(gs.hands[uid] || [], finalComm)?.name || ''; } catch {}
      }
    });

    setWinners([winnerUid]);
    setPhase('showdown');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newChips = { ...(gs.chips || {}) };
    newChips[winnerUid] = (newChips[winnerUid] || CHIPS_START) + (gs.pot || 0);
    if (winnerUid === user?.uid) setMyChips(newChips[winnerUid]);

    // Actualizar chips de jugadores en Firebase
    const playerUpdates = {};
    Object.entries(newChips).forEach(([uid, chips]) => {
      playerUpdates[uid] = { 
        ...r.players[uid], 
        chips: Math.max(chips, 0) 
      };
    });
    await update(
      ref(database, `cantina_rooms/${roomCode}/players`), 
      playerUpdates
    );

    // Calcular tragos para perdedores
    const maxBetInRound = Math.max(
      ...Object.values(gs.bets || {}).map(Number)
    );
    const losers = active
      .filter(uid => uid !== winnerUid)
      .map(uid => {
        const rank = safeRank(gs.hands?.[uid], finalComm);
        const rule = getDrinkPenalty(
          rank, drinkConfig,
          gs.bets?.[uid] || 0,
          maxBetInRound || CHIPS_START
        );
        let handName = '';
        try { handName = evaluateHand(gs.hands[uid] || [], finalComm)?.name || ''; } catch {}
        assignShot(roomCode, winnerUid, uid, rule.msg, rule.shots);
        return {
          uid, shots: rule.shots, icon: rule.icon,
          color: rule.color, msg: rule.msg, handName,
          name: r.players[uid]?.name || 'Jugador',
        };
      });

    await updateGameState(roomCode, {
      ...gs, phase: 'showdown', winner: winnerUid,
      winnerHandName, chips: newChips, communityCards: finalComm,
    });

    // ✅ Iniciar pausa grupal si hay perdedores con tragos
    if (losers.filter(l => l.shots > 0).length > 0) {
      setTimeout(() => triggerDrinkPause(losers.filter(l => l.shots > 0)), 1500);
    }
  };

  // ── NUEVA MANO ─────────────────────────────────────────────────────────────
  const handleNewHand = async () => {
    initDone.current = false;
    setPhase('dealing'); setMyHand([]); setCommunity([]);
    setFolded(false); setWinners([]); setMyBet(0);
    setTableBet(BB); setPot(0); setMyHandRank(null);
    setAllBets({}); setDrinkPause(false); setDrinkPauseData(null);
    barWidth.setValue(0);
    await updateGameState(roomCode, null);
  };

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading || !room) {
    return (
      <View style={s.loader}>
        <Text style={{ fontSize: 48 }}>🃏</Text>
        <Text style={s.loaderText}>Cargando mesa...</Text>
      </View>
    );
  }

  const players   = Object.values(room.players || {});
  const me        = players.find(p => p.uid === user?.uid);
  const others    = players.filter(p => p.uid !== user?.uid);
  const top       = others.slice(0, 3);
  const sideLeft  = others.slice(3, 5);
  const sideRight = others.slice(5, 7);
  const toCall    = Math.max(0, tableBet - myBet);
  const gs        = gsRef.current;
  const handInfo  = myHandRank !== null ? getHandInfo(myHandRank) : null;
  const barColor  = handInfo?.color || '#888';

  // % del pozo para el medidor de tragos
  const potPct = Math.min((pot / (CHIPS_START * 2)) * 100, 100);
  const drinkColor = drinkConfig?.color || '#FF6B00';

  // Confirmaciones en pausa
  const confirmedCount = Object.keys(drinkPauseData?.confirmed || {}).length;
  const totalPlayers   = players.length;
  const myConfirmed    = drinkPauseData?.confirmed?.[user?.uid];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      
      {/* BOTÓN SALIR */}
      <TouchableOpacity
        style={{
          position:'absolute',
          top: Platform.OS === 'ios' ? 52 : 28,
          left: 16,
          zIndex: 999,
          backgroundColor:'rgba(0,0,0,0.6)',
          borderRadius: 20,
          width: 36,
          height: 36,
          alignItems:'center',
          justifyContent:'center',
          borderWidth: 1,
          borderColor: 'rgba(255,184,0,0.4)',
        }}
        onPress={() => {
          Alert.alert(
            '¿Salir del juego?',
            'Si sales perderás tu progreso en esta mano.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Salir', 
                style: 'destructive',
                onPress: async () => {
                  if (unsubRef.current) unsubRef.current();
                  if (user?.uid && roomCode) {
                    await leaveRoom(roomCode, user.uid);
                  }
                  navigation.goBack();
                }
              }
            ]
          );
        }}
        activeOpacity={0.8}
      >
        <Text style={{color:'#FFB800', fontSize:18}}>←</Text>
      </TouchableOpacity>
      
      <LinearGradient colors={['#040D04','#081508','#040D04']} style={StyleSheet.absoluteFill} />

      {/* MESA */}
      <View style={s.tableShell}>
        <LinearGradient colors={['#3D1E00','#5C3000','#3D1E00']} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['#0B3B0B','#093009','#0B3B0B']} style={s.felt} />
        <View style={s.feltGlow} />
        <View style={s.feltRing} />
      </View>

      <Animated.View style={[s.layout, { opacity: fadeAnim }]}>

        {/* OPONENTES */}
        <View style={s.topRow}>
          {top.map(p => (
            <OpponentSlot key={p.uid} p={p} gs={gs} allHands={allHands}
              allChips={allChips} allBets={allBets}
              winners={winners} dealerUid={dealerUid} />
          ))}
        </View>
        {sideLeft.map(p => (
          <View key={p.uid} style={[s.sideSlot, s.sideLeft]}>
            <OpponentSlot p={p} gs={gs} allHands={allHands} allChips={allChips}
              allBets={allBets} winners={winners} dealerUid={dealerUid} small />
          </View>
        ))}
        {sideRight.map((p, i) => (
          <View key={p.uid} style={[s.sideSlot, s.sideRight, { top: `${32 + i * 22}%` }]}>
            <OpponentSlot p={p} gs={gs} allHands={allHands} allChips={allChips}
              allBets={allBets} winners={winners} dealerUid={dealerUid} small />
          </View>
        ))}

        {/* CENTRO */}
        <View style={s.center}>

          {/* POZO CON MEDIDOR */}
          <Animated.View style={[s.potWrap, { transform: [{ scale: potAnim }] }]}>
            <LinearGradient colors={['#1A0800','#2C1200']} style={s.potInner}>
              <Text style={s.potLabel}>POZO</Text>
              <View style={s.potRow}>
                <Text style={s.potDrink}>
                  {drinkConfig 
                    ? `💀 Hasta ${drinkConfig.maxValue} ${drinkConfig.unit}${drinkConfig.maxValue > 1 ? 's' : ''}`
                    : `${pot} pts`}
                </Text>
              </View>
              {drinkConfig && (
                <Text style={{color:'#FFB80060', fontSize:9, marginTop:2}}>
                  Perdedor beberá
                </Text>
              )}
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

          {/* INDICADORES COMPACTOS */}
          <View style={{
            flexDirection:'row', gap:8, 
            alignItems:'center', justifyContent:'center',
            marginTop:6, paddingHorizontal:12
          }}>
            {/* Jugadores activos */}
            <View style={{
              flexDirection:'row', alignItems:'center', gap:4,
              backgroundColor:'rgba(0,0,0,0.6)',
              borderRadius:8, paddingHorizontal:8, paddingVertical:4,
              borderWidth:1, borderColor:'#34C75930'
            }}>
              <Text style={{fontSize:10, color:'#34C759'}}>👥</Text>
              <Text style={{fontSize:10, fontWeight:'800', color:'#34C759'}}>
                {Object.keys(allChips).filter(uid => 
                  !(gs?.foldedPlayers || []).includes(uid)
                ).length}
              </Text>
            </View>

            {/* All-ins */}
            {Object.values(allChips).filter(c => c === 0).length > 0 && (
              <View style={{
                flexDirection:'row', alignItems:'center', gap:4,
                backgroundColor:'rgba(204,0,0,0.2)',
                borderRadius:8, paddingHorizontal:8, paddingVertical:4,
                borderWidth:1, borderColor:'#CC000040'
              }}>
                <Text style={{fontSize:10, color:'#FF5555'}}>☠️</Text>
                <Text style={{fontSize:10, fontWeight:'800', color:'#FF5555'}}>
                  {Object.values(allChips).filter(c => c === 0).length}
                </Text>
              </View>
            )}
          </View>

          {/* APUESTAS EN MESA */}
          {Object.values(allBets).some(b => b > 0) && (
            <View style={s.betsRow}>
              {Object.entries(allBets).map(([uid, bet]) =>
                bet > 0 ? (
                  <View key={uid} style={s.betChip}>
                    <Text style={s.betChipText}>{((bet/CHIPS_START)*100).toFixed(0)}%</Text>
                  </View>
                ) : null
              )}
            </View>
          )}
        </View>

        {/* MI ZONA */}
        <View style={s.myZone}>

          {/* INDICADOR DE MANO */}
          {myHand.length > 0 && phase !== 'showdown' && (
            <View style={s.handStrengthWrap}>
              {(() => {
                const displayInfo = (myHandRank !== null && myHandRank > 0)
                  ? (getHandInfo(Math.floor(myHandRank)) || { name: 'Carta Alta', color: '#888888', pct: 5 })
                  : { name: 'Carta Alta', color: '#888888', pct: 5 };
                const displayColor = displayInfo.color || '#888';
                return (
                  <>
                    <View style={s.handStrengthRow}>
                      <Text style={[s.handName, { color: displayColor }]}>{displayInfo.name}</Text>
                      <Text style={[s.handPct, { color: displayColor }]}>{displayInfo.pct}%</Text>
                    </View>
                    <View style={s.barBg}>
                      <Animated.View style={[s.barFill, {
                        backgroundColor: displayColor,
                        width: barWidth.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }),
                      }]} />
                    </View>
                  </>
                );
              })()}
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
              size="md" isCurrentTurn={isMyTurn}
              isWinner={winners.includes(user?.uid)}
              isFolded={folded} isDealer={dealerUid === user?.uid}
              showChips showShots
            />
          )}

          {/* ACCIONES */}
          {phase !== 'showdown' && !folded && !drinkPause && myChips > 0 && (
            <>
              {/* TEMPORIZADOR */}
              {isMyTurn && (
                <View style={{
                  width:'100%', marginBottom:6,
                  flexDirection:'row', alignItems:'center', gap:8,
                  paddingHorizontal:8
                }}>
                  <View style={{
                    flex:1, height:5, backgroundColor:'rgba(255,255,255,0.1)',
                    borderRadius:3, overflow:'hidden'
                  }}>
                    <View style={{
                      height:'100%', borderRadius:3,
                      backgroundColor: timeLeft > 10 ? '#34C759' : 
                                       timeLeft > 5  ? '#FFB800' : '#FF3B30',
                      width: `${(timeLeft/20)*100}%`
                    }} />
                  </View>
                  <Text style={{
                    color: timeLeft > 10 ? '#34C759' : 
                           timeLeft > 5  ? '#FFB800' : '#FF3B30',
                    fontSize:13, fontWeight:'900', minWidth:28
                  }}>{timeLeft}s</Text>
                </View>
              )}

              {/* ALERTA: Oponente All-In */}
              {(() => {
                const opponentAllIn = Object.entries(allChips).some(([uid, chips]) => 
                  uid !== user?.uid && chips === 0 && !(gs?.foldedPlayers || []).includes(uid)
                );
                if (opponentAllIn && isMyTurn) {
                  return (
                    <View style={{
                      backgroundColor:'rgba(204,0,0,0.15)',
                      borderRadius:12, padding:10, marginBottom:6,
                      borderWidth:1, borderColor:'#CC000040'
                    }}>
                      <Text style={{color:'#FF5555', fontSize:12, fontWeight:'800', textAlign:'center'}}>
                        ☠️ Oponente hizo ALL-IN - solo puedes VER o FOLD
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}

              <View style={s.actions}>

              {/* FOLD */}
              <TouchableOpacity
                style={[s.actionBtn, s.foldStyle, !isMyTurn && s.dim]}
                onPress={handleFold} disabled={!isMyTurn} activeOpacity={0.82}
              >
                <Text style={s.foldTxt}>FOLD</Text>
                <Text style={s.actionSub}>
                  {drinkConfig ? `Bebes ${(0.25 * drinkConfig.maxValue).toFixed(2)} ${drinkConfig.unit}` : '🥃'}
                </Text>
              </TouchableOpacity>

              {/* VER / CHECK */}
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
                    {toCall === 0 ? 'GRATIS' : (drinkConfig ? `Si pierdes: ${(((myBet + toCall)/CHIPS_START)*drinkConfig.maxValue).toFixed(2)} ${drinkConfig.unit}` : `${toCall}`)}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* SUBIR - 50% del pot */}
              {(() => {
                const opponentAllIn = Object.entries(allChips).some(([uid, chips]) => 
                  uid !== user?.uid && chips === 0 && !(gs?.foldedPlayers || []).includes(uid)
                );
                // Si oponente hizo all-in, no mostrar botón de subir
                if (opponentAllIn) return null;
                
                return showRaiseSlider ? (
                <View style={{flex:2,gap:4}}>
                  <View style={{flexDirection:'row',
                    justifyContent:'space-between',
                    paddingHorizontal:4}}>
                    <Text style={{color:'#FFB800',
                      fontSize:10,fontWeight:'800'}}>
                      {drinkConfig 
                        ? `Si pierdes: ${(raiseAmount * drinkConfig.maxValue).toFixed(2)} ${drinkConfig.unit}`
                        : `${Math.round(raiseAmount*100)}%`}
                    </Text>
                    <TouchableOpacity onPress={()=>setShowRaiseSlider(false)}>
                      <Text style={{color:'#FF3B30',fontSize:10}}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection:'row',
                    alignItems:'center',gap:6}}>
                    <TouchableOpacity
                      style={{backgroundColor:'#FFB80030',
                        borderRadius:8,padding:6}}
                      onPress={()=>setRaiseAmount(
                        Math.max(0.25, parseFloat((raiseAmount - 0.05).toFixed(2))))}>
                      <Text style={{color:'#FFB800',
                        fontWeight:'900'}}>-</Text>
                    </TouchableOpacity>
                    <View style={{flex:1,height:6,
                      backgroundColor:'rgba(255,255,255,0.1)',
                      borderRadius:3}}>
                      <View style={{
                        height:'100%',borderRadius:3,
                        backgroundColor:'#FFB800',
                        width:`${raiseAmount * 100}%`
                      }}/>
                    </View>
                    <TouchableOpacity
                      style={{backgroundColor:'#FFB80030',
                        borderRadius:8,padding:6}}
                      onPress={()=>setRaiseAmount(
                        Math.min(1.0, parseFloat((raiseAmount + 0.05).toFixed(2))))}>
                      <Text style={{color:'#FFB800',
                        fontWeight:'900'}}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: raiseAmount >= 1.0 ? '#CC0000' : '#FFB800',
                      borderRadius:10, paddingVertical:8, alignItems:'center'
                    }}
                    onPress={()=>{
                      handleRaiseAmount(raiseAmount);
                      setShowRaiseSlider(false);
                    }}
                    disabled={!isMyTurn}>
                    <Text style={{color: raiseAmount >= 1.0 ? '#FFF' : '#000',
                      fontWeight:'900',fontSize:11}}>
                      {raiseAmount >= 1.0 ? `☠️ ALL IN` : 'APOSTAR'}
                    </Text>
                    {drinkConfig && raiseAmount < 1.0 && (
                      <Text style={{color:'rgba(0,0,0,0.6)',fontSize:8,marginTop:1}}>
                        Bebes {(raiseAmount * drinkConfig.maxValue).toFixed(2)} {drinkConfig.unit}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[s.actionBtn, s.gradStyle, !isMyTurn && s.dim]}
                  onPress={() => setShowRaiseSlider(true)}
                  disabled={!isMyTurn} activeOpacity={0.82}
                >
                  <LinearGradient
                    colors={isMyTurn?['#FFB800','#FF8C00']:['#2A2A2A','#1A1A1A']}
                    style={s.gradInner}>
                    <Text style={[s.actionTxt, !isMyTurn && s.dimTxt]}>
                      SUBIR
                    </Text>
                    <Text style={[s.actionSub, !isMyTurn && s.dimSub]}>
                      {drinkConfig 
                        ? `Si pierdes: ${(0.5 * drinkConfig.maxValue).toFixed(2)} ${drinkConfig.unit}`
                        : `${BB*2}💰`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
              })()}

              {/* ALL IN */}
              {(() => {
                const opponentAllIn = Object.entries(allChips).some(([uid, chips]) => 
                  uid !== user?.uid && chips === 0 && !(gs?.foldedPlayers || []).includes(uid)
                );
                // Si oponente hizo all-in, no mostrar botón de all-in
                if (opponentAllIn) return null;
                
                return (
                  <TouchableOpacity
                    style={[s.actionBtn, s.allInStyle, (!isMyTurn || myChips <= 0) && s.dim]}
                    onPress={handleAllIn} disabled={!isMyTurn || myChips <= 0} activeOpacity={0.82}
                  >
                    <Text style={s.allInTxt}>ALL{'\n'}IN</Text>
                    <Text style={s.actionSub}>
                      {drinkConfig ? `Bebes ${drinkConfig.maxValue} ${drinkConfig.unit}` : '☠️'}
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              </View>
            </>
          )}

          {/* ALL-IN ESPERANDO */}
          {phase !== 'showdown' && !folded && myChips === 0 && (
            <View style={[s.waitBar, {borderColor:'#FFB80030'}]}>
              <Text style={[s.waitTxt, {color:'#FFB80080'}]}>
                ☠️ All-In — esperando resultado...
              </Text>
            </View>
          )}

          {!isMyTurn && !folded && phase !== 'showdown' && !drinkPause && myChips > 0 && (
            <View style={s.waitBar}>
              <Text style={s.waitTxt}>⏳ Esperando tu turno...</Text>
            </View>
          )}
          {folded && phase !== 'showdown' && !drinkPause && (
            <View style={[s.waitBar, { borderColor: '#FF3B3022' }]}>
              <Text style={[s.waitTxt, { color: '#FF3B3060' }]}>🃏 Te retiraste esta mano</Text>
            </View>
          )}
          {phase === 'showdown' && !drinkPause && (
            <TouchableOpacity style={s.newHandBtn} onPress={handleNewHand} activeOpacity={0.85}>
              <LinearGradient colors={['#FFB800','#FF6B00']} style={s.newHandInner}>
                <Text style={s.newHandTxt}>🃏 NUEVA MANO</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* WINNER FLASH */}
      {phase === 'showdown' && winners.length > 0 && !drinkPause && (
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

      {/* ✅ PAUSA GRUPAL DE TRAGOS */}
      {drinkPause && drinkPauseData && (
        <View style={s.pauseOverlay}>
          <LinearGradient colors={['#080000','#150000','#080000']} style={StyleSheet.absoluteFill} />

          <ScrollView contentContainerStyle={s.pauseScroll} showsVerticalScrollIndicator={false}>

            <Text style={s.pauseTitle}>🥃 TIEMPO DE BEBER</Text>
            <Text style={s.pauseSubtitle}>
              El juego se reanudará cuando todos confirmen
            </Text>

            {/* PERDEDORES */}
            {drinkPauseData.losers?.map((loser, i) => (
              <View key={loser.uid || i} style={[s.pauseLoserCard, { borderColor: loser.color + '60' }]}>
                <LinearGradient colors={[loser.color + '15','#0A0000']} style={StyleSheet.absoluteFill} />
                <Text style={{ fontSize: 36 }}>{loser.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.pauseLoserName}>{loser.name}</Text>
                  <Text style={[s.pauseLoserMsg, { color: loser.color }]}>{loser.msg}</Text>
                  {loser.handName ? (
                    <Text style={s.pauseLoserHand}>{loser.handName}</Text>
                  ) : null}
                </View>
                {/* Vasos visuales */}
                <View style={s.pauseGlasses}>
                  {Array.from({ length: Math.ceil(loser.shots) }).map((_, gi) => (
                    <DrinkGlassIcon key={gi} color={loser.color} full={gi < loser.shots} />
                  ))}
                </View>
              </View>
            ))}

            {/* PROGRESO DE CONFIRMACIONES */}
            <View style={s.pauseProgressWrap}>
              <Text style={s.pauseProgressTxt}>
                Confirmaron: {confirmedCount} / {totalPlayers}
              </Text>
              <View style={s.pauseProgressBg}>
                <View style={[s.pauseProgressFill, {
                  width: `${(confirmedCount / totalPlayers) * 100}%`
                }]} />
              </View>
            </View>

            {/* AVATARES que confirmaron */}
            <View style={s.pauseConfirmedRow}>
              {players.map(p => {
                const confirmed = drinkPauseData.confirmed?.[p.uid];
                return (
                  <View key={p.uid} style={[s.pauseConfirmedSlot, confirmed && s.pauseConfirmedDone]}>
                    <Text style={{ fontSize: 22 }}>
                      {room?.players?.[p.uid]?.avatarId === 'catrina' ? '💀' :
                       room?.players?.[p.uid]?.avatarId === 'mariachi' ? '🎸' : '🤠'}
                    </Text>
                    <Text style={[s.pauseConfirmedName, confirmed && { color: '#34C759' }]}>
                      {confirmed ? '✅' : '⏳'} {p.name?.split(' ')[0]}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* BOTÓN CONFIRMAR */}
            {!myConfirmed ? (
              <TouchableOpacity style={s.pauseConfirmBtn} onPress={confirmDrank} activeOpacity={0.85}>
                <LinearGradient colors={['#34C759','#28A745']} style={s.pauseConfirmInner}>
                  <Text style={s.pauseConfirmTxt}>✅ ¡YA BEBÍ!</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={s.pauseWaitingOthers}>
                <Text style={s.pauseWaitingTxt}>
                  ✅ Confirmado — esperando a los demás...
                </Text>
              </View>
            )}

          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ── COMPONENTE: Slot oponente ─────────────────────────────────────────────────
function OpponentSlot({ p, gs, allHands, allChips, allBets, winners, dealerUid, small }) {
  const isFoldedP = (gs?.foldedPlayers || []).includes(p.uid);
  const isMyTurnP = gs?.currentTurn === p.uid;
  const chips     = allChips[p.uid] ?? p.chips ?? 500;
  const bet       = allBets[p.uid] || 0;
  const size      = small ? 'xs' : 'sm';
  return (
    <View style={s.oppSlot}>
      <PlayerAvatar
        player={{ ...p, chips, currentBet: bet }}
        size={size} isCurrentTurn={isMyTurnP}
        isWinner={winners.includes(p.uid)}
        isFolded={isFoldedP} isDealer={dealerUid === p.uid}
        showChips showShots
      />
      <View style={s.oppCards}>
        {[0,1].map(i => (
          <CardComponent key={i} card={allHands[p.uid]?.[i]}
            faceUp={gs?.phase === 'showdown' && !isFoldedP} size="xs" animated />
        ))}
      </View>
      {bet > 0 && (
        <View style={s.oppBetBadge}>
          <Text style={s.oppBetTxt}>{((bet/CHIPS_START)*100).toFixed(0)}%</Text>
        </View>
      )}
    </View>
  );
}

// ── COMPONENTE: Vaso de trago ─────────────────────────────────────────────────
function DrinkGlassIcon({ color, full }) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (full) {
      Animated.timing(fillAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
    }
  }, [full]);
  const h = fillAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','75%'] });
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <View style={[s.glassBody, { borderColor: full ? color : '#333' }]}>
        <Animated.View style={[s.glassLiquid, { height: h, backgroundColor: color }]} />
      </View>
      <View style={[s.glassStem, { backgroundColor: full ? color + '80' : '#33333380' }]} />
      <View style={[s.glassBase, { backgroundColor: full ? color + '60' : '#33333360' }]} />
    </View>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#040D04' },
  loader: { flex: 1, backgroundColor: '#040D04', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loaderText: { color: '#FFB800', fontSize: 16, fontWeight: '700' },

  tableShell: {
    position: 'absolute',
    left: isTablet ? 40 : 6,
    right: isTablet ? 40 : 6,
    top: Platform.OS === 'ios' ? 92 : (StatusBar.currentHeight || 24) + 32,
    bottom: isTablet ? 240 : (H < 700 ? 200 : 220),
    borderRadius: 999,
    overflow: 'hidden',
    elevation: 0,
    zIndex: -1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7, shadowRadius: 22,
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
    flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 26,
    paddingHorizontal: 4, justifyContent: 'space-between',
  },

  topRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: isTablet ? 40 : 12, minHeight: isTablet ? 140 : (isSmallPhone ? 90 : 108) },
  oppSlot: { alignItems: 'center', gap: 3 },
  oppCards: { flexDirection: 'row', gap: 2 },
  oppBetBadge: { backgroundColor: '#FFB80022', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: '#FFB80040', marginTop: 2 },
  oppBetTxt: { color: '#FFB800', fontSize: 9, fontWeight: '800' },
  sideSlot: { position: 'absolute', zIndex: 5, top: '30%' },
  sideLeft: { left: 0 },
  sideRight: { right: 0 },

  center: { alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },

  potWrap: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: '#FFB800', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55, shadowRadius: 12, elevation: 8,
  },
  potInner: { paddingHorizontal: 24, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FFB80035', borderRadius: 18 },
  potLabel: { color: '#FFB80065', fontSize: 8, letterSpacing: 4, fontWeight: '800' },
  potRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  potDrink: { color: '#FFB800', fontSize: 20, fontWeight: '900' },

  phasePill: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 5, borderWidth: 1, borderColor: '#FFB80020' },
  phaseText: { color: '#FFB800', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  communityRow: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  betsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  betChip: { backgroundColor: '#FFB80015', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: '#FFB80030' },
  betChipText: { color: '#FFB80090', fontSize: 10, fontWeight: '700' },

  myZone: { alignItems: 'center', gap: isSmallPhone ? 4 : 7, paddingBottom: BOTTOM_INSET + (isTablet ? 20 : 8), paddingHorizontal: isTablet ? 40 : 4 },

  handStrengthWrap: { width: '88%', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#FFFFFF10' },
  handStrengthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  handName: { fontSize: 13, fontWeight: '800' },
  handPct: { fontSize: 11, fontWeight: '700' },
  barBg: { height: 7, backgroundColor: '#FFFFFF15', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

  myCards: { flexDirection: 'row', gap: 12 },

  actions: { flexDirection: 'row', gap: isTablet ? 12 : 4, paddingHorizontal: isTablet ? 40 : 6, width: '100%', marginBottom: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) > 30 ? 16 : 8 : 0 },
  actionBtn: { flex: 1, borderRadius: 14, overflow: 'hidden', elevation: 4, minHeight: isTablet ? 72 : (isSmallPhone ? 52 : 60) },
  gradStyle: { flex: 1.2 },
  gradInner: { paddingVertical: 13, alignItems: 'center' },
  actionTxt: { color: '#000', fontSize: 12, fontWeight: '900' },
  actionSub: { color: 'rgba(255,255,255,0.55)', fontSize: 9, marginTop: 1 },
  dimTxt: { color: '#555' },
  dimSub: { color: '#444' },
  foldStyle: { backgroundColor: 'rgba(255,59,48,0.1)', borderWidth: 1.5, borderColor: '#FF3B30', paddingVertical: 13, alignItems: 'center' },
  foldTxt: { color: '#FF3B30', fontSize: 12, fontWeight: '900' },
  allInStyle: { backgroundColor: 'rgba(120,0,0,0.2)', borderWidth: 1.5, borderColor: '#CC0000', paddingVertical: 13, alignItems: 'center' },
  allInTxt: { color: '#FF5555', fontSize: 11, fontWeight: '900', textAlign: 'center' },
  dim: { opacity: 0.36 },

  waitBar: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24, borderWidth: 1, borderColor: '#FFB80015', width: '100%', alignItems: 'center' },
  waitTxt: { color: '#FFFFFF40', fontSize: 14 },
  newHandBtn: { borderRadius: 16, overflow: 'hidden', width: '90%', elevation: 6 },
  newHandInner: { paddingVertical: 16, alignItems: 'center' },
  newHandTxt: { color: '#000', fontSize: 18, fontWeight: '900', letterSpacing: 1 },

  winOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 60 },
  winTxt: { color: '#FFD700', fontSize: 46, fontWeight: '900', textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30 },
  loseTxt: { color: '#FF3B30', fontSize: 46, fontWeight: '900', textShadowColor: '#FF3B30', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30 },
  winHandBadge: { marginTop: 10, backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: '#FFD70040' },
  winHandTxt: { color: '#FFD700', fontSize: 18, fontWeight: '800' },

  // ✅ PAUSA GRUPAL
  pauseOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 200 },
  pauseScroll: { flexGrow: 1, paddingTop: Platform.OS === 'ios' ? 64 : 44, paddingHorizontal: 18, paddingBottom: 44, gap: 14 },
  pauseTitle: {
    color: '#FF3B30', fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 3,
    textShadowColor: '#FF3B30', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16,
  },
  pauseSubtitle: { color: '#FFFFFF50', fontSize: 13, textAlign: 'center' },
  pauseLoserCard: { borderRadius: 18, borderWidth: 1.5, overflow: 'hidden', padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center' },
  pauseLoserName: { color: '#FFF', fontSize: 17, fontWeight: '900' },
  pauseLoserMsg: { fontSize: 13, fontWeight: '700', marginTop: 3 },
  pauseLoserHand: { color: '#FFFFFF50', fontSize: 11, marginTop: 2 },
  pauseGlasses: { flexDirection: 'row', gap: 6 },
  pauseProgressWrap: { gap: 6 },
  pauseProgressTxt: { color: '#FFFFFF60', fontSize: 12, textAlign: 'center' },
  pauseProgressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  pauseProgressFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 4 },
  pauseConfirmedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  pauseConfirmedSlot: { alignItems: 'center', gap: 3, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#FFFFFF10', backgroundColor: 'rgba(255,255,255,0.03)' },
  pauseConfirmedDone: { borderColor: '#34C75940', backgroundColor: 'rgba(52,199,89,0.08)' },
  pauseConfirmedName: { color: '#FFFFFF60', fontSize: 10, fontWeight: '600' },
  pauseConfirmBtn: { borderRadius: 18, overflow: 'hidden', elevation: 8 },
  pauseConfirmInner: { paddingVertical: 20, alignItems: 'center' },
  pauseConfirmTxt: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  pauseWaitingOthers: { backgroundColor: 'rgba(52,199,89,0.1)', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#34C75940' },
  pauseWaitingTxt: { color: '#34C759', fontSize: 15, fontWeight: '700', textAlign: 'center' },

  // Vaso
  glassBody: { width: 24, height: 34, borderWidth: 2, borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: 'rgba(255,255,255,0.04)' },
  glassLiquid: { width: '100%' },
  glassStem: { width: 3, height: 6, borderRadius: 2 },
  glassBase: { width: 16, height: 3, borderRadius: 2 },
});
