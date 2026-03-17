// src/components/poker/CardComponent.js
// ✅ CORREGIDO para Android - usa opacity en lugar de backfaceVisibility
// backfaceVisibility no funciona bien en Android con React Native

import React, { useRef, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, Animated,
  TouchableOpacity, Platform,
} from 'react-native';
import { SUIT_CONFIG } from '../../utils/games/cardDeck';

// Reverso de carta
let CARD_BACK = null;
try { CARD_BACK = require('../../assets/Cartas/CartaR.png'); } catch {}

export const CardComponent = ({
  card,
  faceUp = true,
  faceDown = false,
  size = 'md',
  onPress,
  selected = false,
  style,
  animated = true,
}) => {
  const actualFaceUp = faceDown ? false : faceUp;
  const flipAnim = useRef(new Animated.Value(actualFaceUp ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(flipAnim, {
        toValue: actualFaceUp ? 1 : 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      flipAnim.setValue(actualFaceUp ? 1 : 0);
    }
  }, [actualFaceUp]);

  const dim = SIZES[size];

  // ✅ FIX ANDROID: En lugar de rotateY (que no funciona bien en Android),
  // usamos opacidad para mostrar/ocultar frente y reverso
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  // Escala para simular el flip
  const scaleX = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.01, 1],
  });

  const handlePress = () => {
    if (!onPress) return;
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.08, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress(card);
  };

  const cardContent = (
    <Animated.View style={[{ transform: [{ scaleX }, { scale: scaleAnim }] }]}>
      <View style={[dim, styles.cardBase, selected && styles.selected, style]}>
        {/* FRENTE */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: frontOpacity }]}>
          {card?.image ? (
            <Image source={card.image} style={styles.fill} resizeMode="cover" />
          ) : (
            <CardFront card={card} size={size} />
          )}
          {selected && <View style={styles.selectedOverlay} />}
        </Animated.View>

        {/* REVERSO */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backOpacity }]}>
          {CARD_BACK ? (
            <Image source={CARD_BACK} style={styles.fill} resizeMode="cover" />
          ) : (
            <CardBack size={size} />
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        {cardContent}
      </TouchableOpacity>
    );
  }
  return cardContent;
};

// ── FRENTE DE CARTA (fallback sin imagen) ─────────────────────────────────────
const CardFront = ({ card, size }) => {
  if (!card) return null;
  const config = SUIT_CONFIG?.[card.suit] || { emoji: '?', color: '#FF0000' };
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const fs = size === 'xs' ? 11 : size === 'sm' ? 14 : size === 'lg' ? 24 : 18;
  const ss = size === 'xs' ? 14 : size === 'sm' ? 18 : size === 'lg' ? 30 : 22;

  return (
    <View style={styles.frontContainer}>
      {/* Top left */}
      <View style={styles.cornerTL}>
        <Text style={[styles.cornerVal, { color: isRed ? '#CC0000' : '#111', fontSize: fs }]}>
          {card.value}
        </Text>
        <Text style={[styles.cornerSuit, { color: isRed ? '#CC0000' : '#111', fontSize: fs - 2 }]}>
          {config.emoji}
        </Text>
      </View>

      {/* Center */}
      <Text style={[styles.centerSuit, { color: isRed ? '#CC0000' : '#111', fontSize: ss }]}>
        {config.emoji}
      </Text>

      {/* Bottom right (rotated) */}
      <View style={[styles.cornerBR, { transform: [{ rotate: '180deg' }] }]}>
        <Text style={[styles.cornerVal, { color: isRed ? '#CC0000' : '#111', fontSize: fs }]}>
          {card.value}
        </Text>
        <Text style={[styles.cornerSuit, { color: isRed ? '#CC0000' : '#111', fontSize: fs - 2 }]}>
          {config.emoji}
        </Text>
      </View>
    </View>
  );
};

// ── REVERSO (fallback sin imagen) ─────────────────────────────────────────────
const CardBack = ({ size }) => {
  const fs = size === 'xs' ? 14 : size === 'sm' ? 18 : size === 'lg' ? 30 : 22;
  return (
    <View style={styles.backContainer}>
      <View style={styles.backPattern}>
        <Text style={{ fontSize: fs }}>💀</Text>
        <Text style={[styles.backText, { fontSize: size === 'xs' ? 5 : 7 }]}>
          LA CANTINA
        </Text>
        <Text style={[styles.backText, { fontSize: size === 'xs' ? 5 : 7 }]}>
          DEL CHARRO
        </Text>
      </View>
    </View>
  );
};

// ── SLOT VACÍO ────────────────────────────────────────────────────────────────
export const EmptyCardSlot = ({ size = 'md' }) => (
  <View style={[SIZES[size], styles.emptySlot]}>
    <Text style={{ fontSize: SIZES[size].width * 0.35, opacity: 0.3 }}>🃏</Text>
  </View>
);

// ── TAMAÑOS ───────────────────────────────────────────────────────────────────
const SIZES = {
  xs: { width: 38,  height: 54  },
  sm: { width: 52,  height: 73  },
  md: { width: 68,  height: 95  },
  lg: { width: 90,  height: 126 },
};

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFB800',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  fill: { width: '100%', height: '100%' },
  selected: {
    borderColor: '#FFD700',
    borderWidth: 2.5,
    shadowColor: '#FFD700',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 12,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,215,0,0.15)',
  },

  // Front
  frontContainer: {
    flex: 1, backgroundColor: '#FAFAFA',
    padding: 3,
  },
  cornerTL: { position: 'absolute', top: 3, left: 4, alignItems: 'center' },
  cornerBR: { position: 'absolute', bottom: 3, right: 4, alignItems: 'center' },
  cornerVal: { fontWeight: '900', lineHeight: 16 },
  cornerSuit: { lineHeight: 14 },
  centerSuit: { position: 'absolute', alignSelf: 'center', top: '35%' },

  // Back
  backContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center', justifyContent: 'center',
  },
  backPattern: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFB80040',
    borderRadius: 5,
    padding: 4,
    flex: 1,
    width: '85%',
    margin: 4,
    gap: 2,
  },
  backText: {
    color: '#FFB800', fontWeight: '800', letterSpacing: 0.5, textAlign: 'center',
  },

  // Empty slot
  emptySlot: {
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255,184,0,0.25)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,184,0,0.04)',
    alignItems: 'center', justifyContent: 'center',
  },
});
