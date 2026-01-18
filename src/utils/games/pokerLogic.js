const HAND_RANKS = {
  ROYAL_FLUSH: 10,
  STRAIGHT_FLUSH: 9,
  FOUR_OF_KIND: 8,
  FULL_HOUSE: 7,
  FLUSH: 6,
  STRAIGHT: 5,
  THREE_OF_KIND: 4,
  TWO_PAIR: 3,
  PAIR: 2,
  HIGH_CARD: 1
};

const getValueRank = (value) => {
  const ranks = {'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14};
  return ranks[value];
};

export const evaluateHand = (playerCards, communityCards) => {
  const allCards = [...playerCards, ...communityCards];
  const values = allCards.map(c => c.value);
  const suits = allCards.map(c => c.suit);
  
  const valueCounts = {};
  values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
  
  const counts = Object.values(valueCounts).sort((a,b) => b-a);
  const isFlush = suits.some(s => suits.filter(suit => suit === s).length >= 5);
  
  const sortedValues = Object.keys(valueCounts).map(getValueRank).sort((a,b) => b-a);
  let isStraight = false;
  for (let i = 0; i <= sortedValues.length - 5; i++) {
    if (sortedValues[i] - sortedValues[i+4] === 4) {
      isStraight = true;
      break;
    }
  }
  
  if (isFlush && isStraight && sortedValues[0] === 14) return { rank: HAND_RANKS.ROYAL_FLUSH, name: 'Escalera Real' };
  if (isFlush && isStraight) return { rank: HAND_RANKS.STRAIGHT_FLUSH, name: 'Escalera de Color' };
  if (counts[0] === 4) return { rank: HAND_RANKS.FOUR_OF_KIND, name: 'Poker' };
  if (counts[0] === 3 && counts[1] === 2) return { rank: HAND_RANKS.FULL_HOUSE, name: 'Full House' };
  if (isFlush) return { rank: HAND_RANKS.FLUSH, name: 'Color' };
  if (isStraight) return { rank: HAND_RANKS.STRAIGHT, name: 'Escalera' };
  if (counts[0] === 3) return { rank: HAND_RANKS.THREE_OF_KIND, name: 'Trío' };
  if (counts[0] === 2 && counts[1] === 2) return { rank: HAND_RANKS.TWO_PAIR, name: 'Doble Par' };
  if (counts[0] === 2) return { rank: HAND_RANKS.PAIR, name: 'Par' };
  return { rank: HAND_RANKS.HIGH_CARD, name: 'Carta Alta' };
};

export const determineWinner = (players, communityCards) => {
  let bestRank = -1;
  let winnerId = null;
  
  players.forEach(player => {
    if (player.folded) return;
    const hand = evaluateHand(player.cards, communityCards);
    if (hand.rank > bestRank) {
      bestRank = hand.rank;
      winnerId = player.id;
    }
  });
  
  return winnerId;
};
