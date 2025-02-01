// utils/deck.js

import { DECK_SIZE, DECK_SHUFFLE_THRESHOLD, CARD_COUNT_VALUES } from './constants';

/**
 * Creates and manages a deck of playing cards with card counting functionality.
 * Handles shuffling, drawing cards, and tracking various card counting statistics.
 * @returns {Object} An object containing methods to interact with the deck
 */
const createDeck = () => {
  // Main deck array holding available cards
  let cards = [];
  // Array to track cards that have been played
  let usedCards = [];
  // Flag indicating if deck needs to be reshuffled
  let needsShuffle = false;
  // Running count for card counting (positive favors player, negative favors dealer)
  let runningCount = 0;
  // Array tracking the sequence of dealt cards
  let dealtCards = [];

  /**
   * Initializes a fresh deck of 52 cards and performs initial shuffle
   */
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

  /**
   * Performs Fisher-Yates shuffle algorithm on the deck
   */
  const shuffle = () => {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  };

  /**
   * Checks if deck needs shuffling based on remaining cards threshold
   */
  const checkForShuffle = () => {
    const remainingThreshold = DECK_SIZE * (1 - DECK_SHUFFLE_THRESHOLD);
    if (cards.length <= remainingThreshold) {
      needsShuffle = true;
    }
  };

  /**
   * Draws a card from the deck, updates tracking arrays and count
   * @returns {string} Card identifier in format "RANK-SUIT.png" or "BACK.png" if deck is empty
   */
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

  /**
   * Updates the running count based on drawn card's value
   * @param {string} card - Card identifier to update count for
   */
  const updateCount = (card) => {
    const rank = card.split('-')[0];
    runningCount += CARD_COUNT_VALUES[rank] || 0;
  };

  /**
   * Retrieves current card counting statistics
   * @returns {Object} Contains running count, true count, cards dealt, and remaining cards
   */
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

  /**
   * Resets counting statistics to initial values
   */
  const resetCount = () => {
    runningCount = 0;
    dealtCards = [];
  };

  /**
   * Checks if shuffle is needed and performs it if necessary
   * @returns {boolean} True if shuffle was performed, false otherwise
   */
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

  /**
   * @returns {number} Number of cards remaining in deck
   */
  const getRemainingCards = () => {
    return cards.length;
  };

  /**
   * @returns {number} Number of cards that have been used
   */
  const getUsedCards = () => {
    return usedCards.length;
  };

  // Initialize deck on creation
  initialize();

  // Return public interface
  return {
    drawCard,
    reshuffleIfNeeded,
    getRemainingCards,
    getUsedCards,
    getCount
  };
};

export default createDeck;
