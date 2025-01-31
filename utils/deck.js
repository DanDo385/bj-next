// utils/deck.js

import { DECK_SIZE, DECK_SHUFFLE_THRESHOLD, CARD_COUNT_VALUES } from './constants';

const createDeck = () => {
  let cards = [];
  let usedCards = [];
  let needsShuffle = false;
  let runningCount = 0;
  let dealtCards = [];

  const initialize = () => {
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = ['C', 'D', 'H', 'S'];
    
    ranks.forEach(rank => {
      suits.forEach(suit => {
        cards.push(`${rank}-${suit}.png`);
      });
    });
    
    shuffle();
  };

  const shuffle = () => {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  };

  const checkForShuffle = () => {
    // Using constants for threshold calculation
    const remainingThreshold = DECK_SIZE * (1 - DECK_SHUFFLE_THRESHOLD);
    if (cards.length <= remainingThreshold) {
      needsShuffle = true;
    }
  };

  const drawCard = () => {
    const card = cards.pop();
    if (card) {
      usedCards.push(card);
      dealtCards.push(card);
      updateCount(card);
      checkForShuffle();
    }
    return card || 'BACK.png';
  };

  const updateCount = (card) => {
    const rank = card.split('-')[0];
    runningCount += CARD_COUNT_VALUES[rank] || 0;
  };

  const getCount = () => {
    const decksRemaining = cards.length / DECK_SIZE;
    const trueCount = decksRemaining > 0 ? Math.round((runningCount / decksRemaining) * 10) / 10 : 0;
    return {
      running: runningCount,
      true: trueCount,
      cardsDealt: dealtCards.length,
      remainingCards: cards.length
    };
  };

  const resetCount = () => {
    runningCount = 0;
    dealtCards = [];
  };

  const reshuffleIfNeeded = () => {
    if (needsShuffle) {
      cards = [...cards, ...usedCards];
      usedCards = [];
      shuffle();
      needsShuffle = false;
      resetCount();
      return true;
    }
    return false;
  };

  const getRemainingCards = () => {
    return cards.length;
  };

  const getUsedCards = () => {
    return usedCards.length;
  };

  initialize();

  return {
    drawCard,
    reshuffleIfNeeded,
    getRemainingCards,
    getUsedCards,
    getCount
  };
};

export default createDeck;
