// src/services/roomService.js
// ✅ CORREGIDO - nombres de funciones compatibles con PokerLobbyScreen y PokerTableScreen

import { ref, set, get, onValue, update, remove, push } from 'firebase/database';
import { database } from '../config/firebase';
import { getCurrentUser } from './authService';

// ─── GENERAR CÓDIGO DE SALA ──────────────────────────────────────────────────
const PALABRAS = ['CHARRO', 'MEZCAL', 'TEQUILA', 'CANTINA', 'AGAVE', 'PISTOL'];
const generateRoomCode = () => {
  const palabra = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${palabra}-${suffix}`;
};

// ─── CREAR SALA ───────────────────────────────────────────────────────────────
export const createRoom = async (gameType = 'poker') => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');

  const roomCode = generateRoomCode();

  const roomData = {
    code: roomCode,
    gameType,
    host: user.uid,
    status: 'waiting',
    createdAt: Date.now(),
    players: {
      [user.uid]: {
        uid: user.uid,
        id: user.uid,
        name: user.displayName || user.firstName || user.phoneNumber || 'Jugador',
        avatarId: 'pistolero',
        chips: 500,
        shots: 0,
        ready: true,
        isHost: true,
      }
    }
  };

  await set(ref(database, `cantina_rooms/${roomCode}`), roomData);

  // ✅ Retorna objeto { roomCode } — compatible con PokerLobbyScreen
  return { roomCode };
};

// ─── UNIRSE A SALA ────────────────────────────────────────────────────────────
export const joinRoom = async (roomCode) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuario no autenticado');

  const roomRef = ref(database, `cantina_rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) throw new Error('Sala no encontrada: ' + roomCode);

  const room = snapshot.val();
  if (room.status !== 'waiting') throw new Error('La partida ya comenzó');

  const playerCount = Object.keys(room.players || {}).length;
  if (playerCount >= 8) throw new Error('Sala llena (máx 8 jugadores)');

  // Avatar diferente a los ya usados
  const usedAvatars = Object.values(room.players || {}).map(p => p.avatarId);
  const allAvatars = ['pistolero','catrina','mariachi','bandido','patron','bruja','charro','llorona'];
  const available = allAvatars.filter(a => !usedAvatars.includes(a));
  const avatarId = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : allAvatars[Math.floor(Math.random() * allAvatars.length)];

  await update(ref(database, `cantina_rooms/${roomCode}/players/${user.uid}`), {
    uid: user.uid,
    id: user.uid,
    name: user.displayName || user.firstName || user.phoneNumber || 'Jugador',
    avatarId,
    chips: 500,
    shots: 0,
    ready: true,
    isHost: false,
  });

  return { roomCode };
};

// ─── ESCUCHAR SALA ────────────────────────────────────────────────────────────
// ✅ listenToRoom Y subscribeToRoom — ambos nombres exportados
export const listenToRoom = (roomCode, callback) => {
  const roomRef = ref(database, `cantina_rooms/${roomCode}`);
  const unsub = onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  return unsub;
};
export const subscribeToRoom = listenToRoom;

// ─── INICIAR PARTIDA ──────────────────────────────────────────────────────────
export const startGame = async (roomCode) => {
  await update(ref(database, `cantina_rooms/${roomCode}`), {
    status: 'playing',
    startedAt: Date.now(),
  });
};

// ─── ACTUALIZAR ESTADO DEL JUEGO ─────────────────────────────────────────────
export const updateGameState = async (roomCode, gameState) => {
  console.log('🔥 updateGameState llamado:', { roomCode, hasGameState: !!gameState });
  if (gameState === null) {
    // ✅ Usar set() para borrar completamente el nodo gameState
    console.log('🔥 Borrando gameState...');
    await set(ref(database, `cantina_rooms/${roomCode}/gameState`), null);
    console.log('✅ gameState borrado');
  } else {
    // ✅ Usar set() en lugar de update() para crear el nodo si no existe
    console.log('🔥 Escribiendo gameState...');
    await set(ref(database, `cantina_rooms/${roomCode}/gameState`), gameState);
    console.log('✅ gameState escrito');
  }
};

// ─── REGISTRAR SHOT ───────────────────────────────────────────────────────────
// ✅ assignShot Y addShot — ambos nombres exportados
export const assignShot = async (roomCode, fromPlayerId, toPlayerId, reason, amount = 1) => {
  try {
    const shotRef = push(ref(database, `cantina_rooms/${roomCode}/shotTracker`));
    await set(shotRef, {
      from: fromPlayerId,
      to: toPlayerId,
      reason,
      amount,
      timestamp: Date.now(),
    });
    const playerRef = ref(database, `cantina_rooms/${roomCode}/players/${toPlayerId}/shots`);
    const snapshot = await get(playerRef);
    await set(playerRef, (snapshot.val() || 0) + amount);
  } catch (e) {
    console.warn('assignShot error:', e.message);
  }
};
export const addShot = assignShot;

// ─── SALIR DE SALA ────────────────────────────────────────────────────────────
export const leaveRoom = async (roomCode, playerId) => {
  try {
    await remove(ref(database, `cantina_rooms/${roomCode}/players/${playerId}`));
    const roomRef = ref(database, `cantina_rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    if (snapshot.exists() && snapshot.val().host === playerId) {
      await remove(roomRef);
    }
  } catch (e) {
    console.warn('leaveRoom error:', e.message);
  }
};

export const deleteRoom = async (roomCode) => {
  await remove(ref(database, `cantina_rooms/${roomCode}`));
};
