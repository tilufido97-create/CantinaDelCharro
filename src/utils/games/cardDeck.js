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
        color: ['hearts', 'diamonds'].includes(suit) ? 'red' : 'black'
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
