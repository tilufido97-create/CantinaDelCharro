const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = () => {
  const deck = [];
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      deck.push({ suit, value, id: `${value}${suit}` });
    });
  });
  return shuffleDeck(deck);
};

const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getCardValue = (card, currentTotal) => {
  if (card.value === 'A') {
    return currentTotal + 11 > 21 ? 1 : 11;
  }
  if (['J', 'Q', 'K'].includes(card.value)) {
    return 10;
  }
  return parseInt(card.value);
};

export const calculateHandValue = (hand) => {
  let total = 0;
  let aces = 0;

  hand.forEach(card => {
    if (card.value === 'A') {
      aces++;
      total += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      total += 10;
    } else {
      total += parseInt(card.value);
    }
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
};

export const isBlackjack = (hand) => {
  return hand.length === 2 && calculateHandValue(hand) === 21;
};

export const dealerShouldHit = (dealerHand) => {
  return calculateHandValue(dealerHand) < 17;
};

export const determineWinner = (playerHand, dealerHand) => {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  if (playerValue > 21) return 'dealer';
  if (dealerValue > 21) return 'player';
  if (isBlackjack(playerHand) && !isBlackjack(dealerHand)) return 'blackjack';
  if (isBlackjack(dealerHand) && !isBlackjack(playerHand)) return 'dealer';
  if (playerValue > dealerValue) return 'player';
  if (dealerValue > playerValue) return 'dealer';
  return 'push';
};

export const calculatePayout = (bet, result) => {
  if (result === 'blackjack') return bet * 2.5;
  if (result === 'player') return bet * 2;
  if (result === 'push') return bet;
  return 0;
};
