// src/utils/games/cardDeck.js
// ✅ Sistema de cartas - Compatible con poker y blackjack

export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
export const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SUIT_CONFIG = {
  spades:   { emoji: '♠', color: '#000000', label: 'Picas' },
  hearts:   { emoji: '♥', color: '#E53935', label: 'Corazones' },
  diamonds: { emoji: '♦', color: '#E53935', label: 'Diamantes' },
  clubs:    { emoji: '♣', color: '#000000', label: 'Tréboles' },
};

export const createDeck = () => {
  const deck = [];
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      deck.push({
        id: `${value}_${suit}`,
        suit,
        value,
        numericValue: getNumericValue(value),
        suitEmoji: SUIT_CONFIG[suit].emoji,
        suitColor: SUIT_CONFIG[suit].color,
        color: ['hearts', 'diamonds'].includes(suit) ? 'red' : 'black',
        image: getCardImage(value, suit),
      });
    });
  });
  return shuffle(deck);
};

export const shuffle = (deck) => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const getNumericValue = (value) => {
  if (value === 'A') return 11;
  if (['J', 'Q', 'K'].includes(value)) return 10;
  return parseInt(value);
};

// ─── FUNCIONES PARA POKER ─────────────────────────────────────────────────────
export const dealCards = (deck, numCards) => {
  return deck.splice(0, numCards);
};

export const getValueRank = (value) => {
  const ranks = {'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14};
  return ranks[value];
};

// ─── IMÁGENES DE CARTAS ───────────────────────────────────────────────────────
const CARD_IMAGES = {
  // Spades
  '2_spades': require('../../../assets/Cartas/2_spades.png'),
  '3_spades': require('../../../assets/Cartas/3_spades.png'),
  '4_spades': require('../../../assets/Cartas/4_spades.png'),
  '5_spades': require('../../../assets/Cartas/5_spades.png'),
  '6_spades': require('../../../assets/Cartas/6_spades.png'),
  '7_spades': require('../../../assets/Cartas/7_spades.png'),
  '8_spades': require('../../../assets/Cartas/8_spades.png'),
  '9_spades': require('../../../assets/Cartas/9_spades.png'),
  '10_spades': require('../../../assets/Cartas/10_spades.png'),
  'J_spades': require('../../../assets/Cartas/j_spades.png'),
  'Q_spades': require('../../../assets/Cartas/q_spades.png'),
  'K_spades': require('../../../assets/Cartas/k_spades.png'),
  'A_spades': require('../../../assets/Cartas/A_spades.png'),
  // Hearts
  '2_hearts': require('../../../assets/Cartas/2_hearts.png'),
  'J_hearts': require('../../../assets/Cartas/j_hearts.png'),
  'Q_hearts': require('../../../assets/Cartas/q_hearts.png'),
  'K_hearts': require('../../../assets/Cartas/k_hearts.png'),
  'A_hearts': require('../../../assets/Cartas/a_hearts.png'),
  // Diamonds
  'A_diamonds': require('../../../assets/Cartas/a_diamonds.png'),
  // Clubs
  'A_clubs': require('../../../assets/Cartas/a_clubs.png'),
};

export const getCardImage = (value, suit) => {
  const key = `${value}_${suit}`;
  return CARD_IMAGES[key] || null;
};
