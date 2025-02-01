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

  // Split hands state
  const [splitHands, setSplitHands] = useState([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);

  // Calculate current scores
  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  // Determine available actions
  const canDouble = playerHand.length === 2 && chips >= currentWager * 2;
  const canSplit = playerHand.length === 2 && 
                   playerHand[0]?.split('-')[0] === playerHand[1]?.split('-')[0] && 
                   chips >= currentWager * 2;

  /**
   * Deals initial cards to player and dealer at the start of a game
   * Follows casino dealing sequence: player, dealer, player, dealer
   */
  const dealInitialCards = useCallback(() => {
    const newPlayerHand = [];
    const newDealerHand = [];

    // Deal in sequence: player, dealer, player, dealer (face down)
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
    if (wager > chips) return;
    
    setCurrentWager(wager);
    setChips(prev => prev - wager);
    setIsGameStarted(true);
    
    if (deck.reshuffleIfNeeded()) {
      // Handle shuffle animation/notification if needed
    }
    
    dealInitialCards();
  }, [chips, deck, dealInitialCards]);

  /**
   * Handles player hitting (taking another card)
   * Automatically ends player's turn if they bust
   */
  const hit = useCallback(() => {
    if (!isPlayerTurn) return;
    
    const newHand = [...playerHand, deck.drawCard()];
    setPlayerHand(newHand);
    
    if (calculateScore(newHand) >= 21) {
      setIsPlayerTurn(false);
      handleDealerTurn(newHand);
    }
  }, [deck, playerHand, isPlayerTurn]);

  /**
   * Handles player standing (keeping current hand)
   */
  const stand = useCallback(() => {
    setIsPlayerTurn(false);
    handleDealerTurn(playerHand);
  }, [playerHand]);

  /**
   * Handles player doubling down (doubling bet and taking one card)
   */
  const double = useCallback(() => {
    if (!canDouble) return;
    
    setChips(prev => prev - currentWager);
    setCurrentWager(prev => prev * 2);
    
    const newHand = [...playerHand, deck.drawCard()];
    setPlayerHand(newHand);
    setIsPlayerTurn(false);
    handleDealerTurn(newHand);
  }, [deck, playerHand, currentWager, canDouble]);

  /**
   * Handles splitting pairs into two separate hands
   */
  const split = useCallback(() => {
    if (!canSplit) return;
    
    // Create two new hands from the split pair
    const [card1, card2] = playerHand;
    
    // Initialize first hand
    const hand1 = {
      cards: [card1],
      wager: currentWager,
      isPlayed: false
    };
    
    // Initialize second hand (wager will be set when player confirms)
    const hand2 = {
      cards: [card2],
      wager: 0,
      isPlayed: false
    };
    
    // Set up split hands state
    setSplitHands([hand1, hand2]);
    setCurrentHandIndex(0);
    setPlayerHand(hand1.cards);
    setGameStatus('splitting'); // New status to handle split wager
  }, [playerHand, currentWager, canSplit]);

  /**
   * Handles setting wager for split hand and dealing additional cards
   * @param {number} wager - Amount to wager on split hand
   */
  const handleSplitWager = useCallback((wager) => {
    if (wager > chips) return;
    
    setSplitHands(prev => {
      const updatedHands = [...prev];
      updatedHands[1].wager = wager;
      return updatedHands;
    });
    
    // Deduct wager and deal cards to both hands
    setChips(prev => prev - wager);
    
    // Deal one card to each split hand
    setSplitHands(prev => {
      const updatedHands = prev.map(hand => ({
        ...hand,
        cards: [...hand.cards, deck.drawCard()]
      }));
      return updatedHands;
    });
    
    setGameStatus('playing');
    setIsPlayerTurn(true);
  }, [chips, deck]);

  /**
   * Handles dealer's turn after player is finished
   * Follows house rules (dealer must hit on 16 and below, stand on 17 and above)
   * @param {Array} finalPlayerHand - Player's final hand to compare against
   */
  const handleDealerTurn = useCallback((finalPlayerHand) => {
    const playerFinalScore = calculateScore(finalPlayerHand);
    
    if (playerFinalScore > 21) {
      endGame('dealer', 'Dealer Wins - Player Bust!');
      return;
    }

    let currentDealerHand = [...dealerHand];
    let currentScore = calculateScore(currentDealerHand);

    while (currentScore < 17) {
      currentDealerHand.push(deck.drawCard());
      currentScore = calculateScore(currentDealerHand);
    }

    setDealerHand(currentDealerHand);
    
    if (currentScore > 21) {
      endGame('player', `You Win! Dealer Busts! (${currentScore})`);
    } else if (playerFinalScore > currentScore) {
      endGame('player', `You Win! (${playerFinalScore} vs ${currentScore})`);
    } else if (currentScore > playerFinalScore) {
      endGame('dealer', `Dealer Wins (${currentScore} vs ${playerFinalScore})`);
    } else {
      endGame('push', 'Push - It\'s a Tie!');
    }
  }, [deck, dealerHand]);

  /**
   * Handles end of game, including payouts and state reset
   * @param {string} result - Game result ('player', 'dealer', or 'push')
   * @param {string} message - Result message to display
   */
  const endGame = useCallback((result, message) => {
    setGameStatus('finished');
    setGameResult(message);
    
    switch (result) {
      case 'player':
        setChips(prev => prev + currentWager * 2);
        break;
      case 'push':
        setChips(prev => prev + currentWager);
        break;
      case 'dealer':
        // Player already lost their bet
        break;
    }

    // Reset for next hand
    setTimeout(() => {
      setPlayerHand([]);
      setDealerHand([]);
      setCurrentWager(0);
      setIsGameStarted(false);
      setIsPlayerTurn(true);
      setGameStatus('betting');
      setGameResult('');
    }, 2000);
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
    canDouble,
    canSplit,
    startGame,
    hit,
    stand,
    double,
    split,
    handleSplitWager,
    saveGame,
    gameResult,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;