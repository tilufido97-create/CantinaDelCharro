// src/components/poker/PlayerAvatar.js
// ✅ v3 - Avatares reales PNG integrados

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ─── IMÁGENES REALES ──────────────────────────────────────────────────────────
const AVATAR_IMAGES = {
  pistolero: require('../../../assets/avatars/pistolero.png'),
  catrina:   require('../../../assets/avatars/catrina.png'),
  mariachi:  require('../../../assets/avatars/mariachi.png'),
  bandido:   require('../../../assets/avatars/bandido.png'),
  patron:    require('../../../assets/avatars/patron.png'),
  bruja:     require('../../../assets/avatars/bruja.png'),
  charro:    require('../../../assets/avatars/charro.png'),
  llorona:   require('../../../assets/avatars/llorona.png'),
};

// ─── CATÁLOGO ─────────────────────────────────────────────────────────────────
export const AVATARS = [
  { id: 'pistolero', name: 'El Pistolero', border: '#FF6B00', glow: '#FF6B00' },
  { id: 'catrina',   name: 'La Catrina',   border: '#FF0040', glow: '#FF0040' },
  { id: 'mariachi',  name: 'El Mariachi',  border: '#FFB800', glow: '#FFB800' },
  { id: 'bandido',   name: 'El Bandido',   border: '#CC4400', glow: '#CC4400' },
  { id: 'patron',    name: 'El Patrón',    border: '#CC00FF', glow: '#CC00FF' },
  { id: 'bruja',     name: 'La Bruja',     border: '#39FF14', glow: '#39FF14' },
  { id: 'charro',    name: 'El Charro',    border: '#FFD700', glow: '#FFD700' },
  { id: 'llorona',   name: 'La Llorona',   border: '#00BFFF', glow: '#00BFFF' },
];

export const getAvatarById  = (id) => AVATARS.find(a => a.id === id) || AVATARS[0];
export const getRandomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];

// ─── TAMAÑOS ──────────────────────────────────────────────────────────────────
const SIZES = {
  xs: { size: 38,  fontSize: 7  },
  sm: { size: 50,  fontSize: 9  },
  md: { size: 62,  fontSize: 11 },
  lg: { size: 80,  fontSize: 13 },
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export const PlayerAvatar = ({
  player,
  size        = 'md',
  isCurrentTurn = false,
  isWinner    = false,
  isFolded    = false,
  isDealer    = false,
  showChips   = true,
  showShots   = true,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  const avatar = getAvatarById(player?.avatarId);
  const dim    = SIZES[size] || SIZES.md;
  const img    = AVATAR_IMAGES[avatar.id];

  useEffect(() => {
    if (isCurrentTurn) {
      const pulse = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 520, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 520, useNativeDriver: true }),
      ]));
      const glow = Animated.loop(Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 650, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.2, duration: 650, useNativeDriver: false }),
      ]));
      pulse.start();
      glow.start();
      return () => { pulse.stop(); glow.stop(); };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isCurrentTurn]);

  const borderColor = isWinner ? '#FFD700' : isFolded ? '#333333' : avatar.border;
  const borderWidth = isCurrentTurn || isWinner ? 3 : 2;

  return (
    <View style={[styles.wrapper, style]}>

      {/* GLOW RING */}
      {isCurrentTurn && (
        <Animated.View style={[
          styles.glowRing,
          {
            width:        dim.size + 22,
            height:       dim.size + 22,
            borderRadius: (dim.size + 22) / 2,
            borderColor:  avatar.border,
            shadowColor:  avatar.border,
            opacity:      glowAnim,
          }
        ]} />
      )}

      {/* AVATAR CIRCLE */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <View style={[
          styles.circle,
          {
            width:        dim.size,
            height:       dim.size,
            borderRadius: dim.size / 2,
            borderColor,
            borderWidth,
            opacity: isFolded ? 0.38 : 1,
            shadowColor:   borderColor,
            shadowOpacity: isCurrentTurn || isWinner ? 0.9 : 0.45,
            shadowRadius:  isCurrentTurn || isWinner ? 14 : 5,
          }
        ]}>
          {/* IMAGEN REAL */}
          {img && (
            <Image
              source={img}
              style={{
                width:        dim.size - 4,
                height:       dim.size - 4,
                borderRadius: (dim.size - 4) / 2,
              }}
              resizeMode="cover"
            />
          )}

          {/* OVERLAY FOLD */}
          {isFolded && (
            <View style={styles.foldOverlay}>
              <Text style={styles.foldTxt}>FOLD</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* BADGE DEALER */}
      {isDealer && (
        <View style={styles.dealerBadge}>
          <Text style={styles.dealerTxt}>D</Text>
        </View>
      )}

      {/* CORONA GANADOR */}
      {isWinner && (
        <View style={styles.crown}>
          <Text style={{ fontSize: 14 }}>👑</Text>
        </View>
      )}

      {/* NOMBRE */}
      <Text style={[styles.name, { fontSize: dim.fontSize }]} numberOfLines={1}>
        {player?.name || 'Jugador'}
      </Text>

      {/* FICHAS + SHOTS */}
      <View style={styles.badgesRow}>
        {showChips && (
          <View style={styles.chipsBadge}>
            <Text style={styles.chipsTxt}>🪙{player?.chips ?? 500}</Text>
          </View>
        )}
        {showShots && (player?.shots || 0) > 0 && (
          <View style={styles.shotsBadge}>
            <Text style={styles.shotsTxt}>🥃{player.shots}</Text>
          </View>
        )}
      </View>

      {/* APUESTA ACTUAL */}
      {(player?.currentBet || 0) > 0 && (
        <View style={styles.betBadge}>
          <Text style={styles.betTxt}>{player.currentBet}🪙</Text>
        </View>
      )}
    </View>
  );
};

// ─── SELECTOR DE AVATAR ───────────────────────────────────────────────────────
export const AvatarSelector = ({ selectedId, onSelect }) => (
  <View style={styles.selectorGrid}>
    {AVATARS.map(avatar => {
      const img = AVATAR_IMAGES[avatar.id];
      const sel = selectedId === avatar.id;
      return (
        <TouchableOpacity
          key={avatar.id}
          onPress={() => onSelect(avatar.id)}
          style={[
            styles.selectorItem,
            sel && { borderColor: avatar.border, backgroundColor: avatar.border + '22' }
          ]}
          activeOpacity={0.8}
        >
          <View style={[
            styles.selectorCircle,
            { borderColor: sel ? avatar.border : '#333' }
          ]}>
            {img && (
              <Image source={img} style={styles.selectorImg} resizeMode="cover" />
            )}
          </View>
          <Text style={[styles.selectorName, sel && { color: avatar.border }]}>
            {avatar.name}
          </Text>
          {sel && (
            <View style={[styles.checkBadge, { backgroundColor: avatar.border }]}>
              <Text style={{ fontSize: 8, color: '#000' }}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── FICHA DECORATIVA ─────────────────────────────────────────────────────────
export const AnimatedChip = ({ value }) => {
  const colors = value >= 500 ? ['#FFB800','#CC8800'] :
                 value >= 100 ? ['#CC0000','#990000'] :
                 value >= 50  ? ['#0000CC','#000099'] :
                 value >= 25  ? ['#006600','#004400'] :
                                ['#888888','#555555'];
  return (
    <LinearGradient colors={colors} style={styles.chip}>
      <Text style={styles.chipVal}>{value}</Text>
    </LinearGradient>
  );
};

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 3, position: 'relative' },

  glowRing: {
    position: 'absolute',
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    elevation: 0,
  },

  circle: {
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  foldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foldTxt: { color: '#FF3B30', fontSize: 8, fontWeight: '900' },

  dealerBadge: {
    position: 'absolute', top: -3, right: -3,
    width: 17, height: 17, borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#000', zIndex: 10,
  },
  dealerTxt: { color: '#000', fontSize: 8, fontWeight: '900' },

  crown: { position: 'absolute', top: -16, alignSelf: 'center' },

  name: {
    color: '#FFFFFF', fontWeight: '700',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    maxWidth: 80, textAlign: 'center',
  },

  badgesRow: { flexDirection: 'row', gap: 3, flexWrap: 'wrap', justifyContent: 'center' },

  chipsBadge: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 1, borderColor: '#FFB80050',
  },
  chipsTxt: { color: '#FFB800', fontSize: 9, fontWeight: '800' },

  shotsBadge: {
    backgroundColor: 'rgba(180,0,0,0.75)',
    borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 1, borderColor: '#FF3B3050',
  },
  shotsTxt: { color: '#FF8080', fontSize: 9, fontWeight: '800' },

  betBadge: {
    backgroundColor: '#FFB800',
    borderRadius: 9, paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1.5, borderColor: '#FF6B00',
    shadowColor: '#FFB800', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4, elevation: 4,
  },
  betTxt: { color: '#000', fontSize: 9, fontWeight: '900' },

  // Selector
  selectorGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, justifyContent: 'center', padding: 12,
  },
  selectorItem: {
    width: 78, alignItems: 'center', gap: 5,
    borderRadius: 14, borderWidth: 2,
    borderColor: 'rgba(255,184,0,0.15)',
    padding: 8, position: 'relative',
  },
  selectorCircle: {
    width: 52, height: 52, borderRadius: 26,
    overflow: 'hidden', borderWidth: 2,
    backgroundColor: '#0A0A0A',
  },
  selectorImg: { width: '100%', height: '100%' },
  selectorName: { color: '#FFFFFF60', fontSize: 8, fontWeight: '700', textAlign: 'center' },
  checkBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 14, height: 14, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },

  // Chip
  chip: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  chipVal: { color: '#FFF', fontSize: 7, fontWeight: '900' },
});
