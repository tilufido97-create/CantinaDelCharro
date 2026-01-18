export const calculateHandValue = (cards) => {
  let value = 0;
  let aces = 0;
  
  cards.forEach(card => {
    if (card.value === 'A') {
      aces++;
      value += 11;
    } else if (['J','Q','K'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  });
  
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  
  return value;
};

export const dealerShouldHit = (dealerHand) => {
  return calculateHandValue(dealerHand) < 17;
};

export const determineWinner = (playerHand, dealerHand) => {
  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);
  
  if (playerValue > 21) return 'dealer';
  if (dealerValue > 21) return 'player';
  if (playerValue > dealerValue) return 'player';
  if (dealerValue > playerValue) return 'dealer';
  return 'tie';
};

export const isBlackjack = (hand) => {
  return hand.length === 2 && calculateHandValue(hand) === 21;
};
