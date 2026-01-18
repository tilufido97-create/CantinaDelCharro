const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

export const createDeck = () => {
  let deck = [];
  
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      deck.push({ 
        suit, 
        value, 
        color: ['♥','♦'].includes(suit) ? 'red' : 'black' 
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
