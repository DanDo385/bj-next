// Since this file contains JSX syntax (the <GameContext.Provider> component),
// it should keep the .jsx extension to clearly indicate it contains JSX code.

import { useState, useCallback } from 'react';
import { GameContext } from './GameContext';
import createDeck from '../utils/deck';
import { calculateScore } from '../utils/score';
import { STARTING_CHIPS } from '../utils/constants';

/**
 * GameProvider component that manages the global state for the Blackjack game
 * Provides game state and functions to child components through Context API
 * @param {Object} props
 * @param {ReactNode} props.children - Child components that will have access to game context
 */
const GameProvider = ({ children }) => {
  // Helper function needs to be defined before it's used in canSplit
  const getCardRank = (card) => {
    if (!card) return '';
    // Extract rank before the hyphen (e.g., "queen" from "queen-hearts")
    const rank = card.split('-')[0];
    return rank;
  };

  // Core game state
  const [deck] = useState(() => createDeck()); // Initialize deck of cards
  const [playerHand, setPlayerHand] = useState([]); // Player's current cards
  const [dealerHand, setDealerHand] = useState([]); // Dealer's current cards
  const [currentWager, setCurrentWager] = useState(0); // Current bet amount
  const [chips, setChips] = useState(STARTING_CHIPS); // Player's total chips
  
  // Game flow control state
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState('betting'); // betting, playing, dealer, finished
  const [gameResult, setGameResult] = useState('');

  // Initialize split-related state with default values
  const [splitHands, setSplitHands] = useState([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);

  // Calculate current scores
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  // Determine available actions
  const canDoubleDown = splitHands.length > 0
    ? splitHands[currentHandIndex]?.cards.length === 2 && chips >= splitHands[currentHandIndex].wager
    : playerHand.length === 2 && chips >= currentWager;
  const canSplit = playerHand.length === 2 && 
                   getCardRank(playerHand[0]) === getCardRank(playerHand[1]) && 
                   chips >= currentWager;

  // Declare handleDealerTurn BEFORE it's used in other functions
  const handleDealerTurn = useCallback(() => {
    // Example dealer turn logic:
    let dealerScore = calculateScore(dealerHand);
    while (dealerScore < 17) {
      const newCard = deck.drawCard();
      // Update dealer hand (consider using a function updater for consistency)
      setDealerHand(prev => [...prev, newCard]);
      dealerScore = calculateScore([...dealerHand, newCard]);
    }
    setGameStatus('finished');
    setIsPlayerTurn(false);
  }, [dealerHand, deck]);

  /**
   * Deals initial cards to player and dealer at the start of a game
   * Follows casino dealing sequence: player, dealer, player, dealer
   */
  const dealInitialCards = useCallback(() => {
    // This is where we clear the previous hands
    setPlayerHand([]);
    setDealerHand([]);
    
    const newPlayerHand = [];
    const newDealerHand = [];
    
    // Deal initial cards
    newPlayerHand.push(deck.drawCard());
    newDealerHand.push(deck.drawCard());
    newPlayerHand.push(deck.drawCard());
    newDealerHand.push(deck.drawCard());

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setIsPlayerTurn(true);
    setGameStatus('playing');
  }, [deck]);

  /**
   * Starts a new game with the specified wager
   * @param {number} wager - Amount of chips to bet
   */
  const startGame = useCallback((wager) => {
    setGameResult('');
    
    if (wager > chips) return;
    
    setCurrentWager(wager);
    setChips(prev => prev - wager);
    setIsGameStarted(true);
    
    if (deck.reshuffleIfNeeded()) {
      // Handle shuffle animation/notification if needed
    }
    
    dealInitialCards();
  }, [chips, deck, dealInitialCards]);

  // Now define stand using handleDealerTurn
  const stand = useCallback(() => {
    if (splitHands.length > 0) {
      // Mark the current split hand as played
      setSplitHands(prevHands => {
        const updatedHands = [...prevHands];
        updatedHands[currentHandIndex] = {
          ...updatedHands[currentHandIndex],
          isPlayed: true
        };
        return updatedHands;
      });
      // Check if any split hand remains unplayed
      const nextUnplayedIndex = splitHands.findIndex(hand => !hand.isPlayed);
      if (nextUnplayedIndex !== -1) {
        setCurrentHandIndex(nextUnplayedIndex);
        return; // Continue player's turn with the next hand
      }
    }
    setIsPlayerTurn(false);
    handleDealerTurn(); // Now safe to call; handleDealerTurn is defined above
  }, [splitHands, currentHandIndex, handleDealerTurn]);

  // And a similar update for hit
  const hit = useCallback(() => {
    if (!isPlayerTurn) return;

    if (splitHands.length > 0) {
      setSplitHands(prevHands => {
        const updatedHands = [...prevHands];
        const currentHand = updatedHands[currentHandIndex];
        currentHand.cards.push(deck.drawCard());

        const score = calculateScore(currentHand.cards);
        if (score >= 21) {
          currentHand.isPlayed = true;
          const nextUnplayedIndex = updatedHands.findIndex(hand => !hand.isPlayed);
          if (nextUnplayedIndex !== -1) {
            setCurrentHandIndex(nextUnplayedIndex);
          } else {
            setIsPlayerTurn(false);
            handleDealerTurn();
          }
        }
        return updatedHands;
      });
    } else {
      // Regular case (no splits)
      const newCard = deck.drawCard();
      setPlayerHand(prev => [...prev, newCard]);
      const score = calculateScore([...playerHand, newCard]);
      if (score >= 21) {
        setIsPlayerTurn(false);
        handleDealerTurn();
      }
    }
  }, [isPlayerTurn, splitHands, currentHandIndex, deck, playerHand, handleDealerTurn]);

  /**
   * Handles player doubling down (doubling bet and taking one card)
   */
  const double = useCallback(() => {
    if (!canDoubleDown) return;
    
    setChips(prev => prev - currentWager);
    setCurrentWager(prev => prev * 2);
    
    const newHand = [...playerHand, deck.drawCard()];
    setPlayerHand(newHand);
    setIsPlayerTurn(false);
    handleDealerTurn(newHand);
  }, [deck, playerHand, currentWager, canDoubleDown]);

  /**
   * Handles splitting pairs into two separate hands
   */
  const split = useCallback(() => {
    if (!canSplit) return;
    
    // Create two new hands from the split pair
    const [card1, card2] = playerHand;
    
    // Initialize both hands with the same wager
    const hand1 = {
      cards: [card1],
      wager: currentWager,
      isPlayed: false
    };
    
    const hand2 = {
      cards: [card2],
      wager: currentWager,
      isPlayed: false
    };
    
    // Deduct wager for second hand immediately
    setChips(prev => prev - currentWager);
    
    // Set up split hands state
    setSplitHands([hand1, hand2]);
    setCurrentHandIndex(0);
    
    // Deal one card to each split hand immediately
    setSplitHands(prev => {
      const updatedHands = prev.map(hand => ({
        ...hand,
        cards: [...hand.cards, deck.drawCard()]
      }));
      return updatedHands;
    });
    
    setGameStatus('playing');
  }, [canSplit, playerHand, currentWager, deck]);

  /**
   * Handles end of game, including payouts and state reset
   * @param {string} result - Game result ('player', 'dealer', or 'push')
   * @param {string} message - Result message to display
   */
  const endGame = useCallback((result, message) => {
    setGameStatus('finished');
    let chipChange = 0;
    
    switch (result) {
      case 'player':
        chipChange = currentWager * 2;
        setChips(prev => prev + chipChange);
        break;
      case 'push':
        chipChange = currentWager;
        setChips(prev => prev + chipChange);
        break;
      case 'dealer':
        chipChange = -currentWager;
        break;
    }

    const chipMessage = chipChange > 0 
      ? `Won ${chipChange.toLocaleString()} chips` 
      : chipChange < 0 
      ? `Lost ${Math.abs(chipChange).toLocaleString()} chips`
      : 'Chips returned';

    setGameResult(`${message}\n${chipMessage}`);
    
    // Only update game state flags, don't clear hands
    setCurrentWager(0);
    setIsGameStarted(false);
    setIsPlayerTurn(false);
    setGameStatus('betting');
  }, [currentWager]);

  /**
   * Saves current game state (placeholder for future implementation)
   */
  const saveGame = useCallback(async () => {
    // Implement save game logic with smart contract here
    console.log('Saving game state...');
  }, [chips]);

  // Context value object containing all game state and functions
  const value = {
    deck,
    playerHand,
    dealerHand,
    playerScore,
    dealerScore,
    chips,
    currentWager,
    isGameStarted,
    isPlayerTurn,
    gameStatus,
    canDoubleDown,
    canSplit,
    startGame,
    hit,
    stand,
    double,
    split,
    saveGame,
    gameResult,
    setGameResult,
    endGame,
    splitHands,
    currentHandIndex
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;