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
  // Helper functions
  const getCardRank = (card) => {
    if (!card) return '';
    // Extract rank before the hyphen (e.g., "queen" from "queen-hearts")
    const rank = card.split('-')[0];
    return rank;
  };

  // State declarations
  const [deck] = useState(() => createDeck());
  const [playerHand, setPlayerHand] = useState(['BACK.png', 'BACK.png']);
  const [dealerHand, setDealerHand] = useState(['BACK.png']);
  const [currentWager, setCurrentWager] = useState(0);
  const [chips, setChips] = useState(STARTING_CHIPS);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState('betting');
  const [gameResult, setGameResult] = useState('');
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

  /**
   * Handles end of game, including payouts and state reset
   */
  const endGame = useCallback((result, message) => {
    setGameStatus('finished');
    setGameResult(message);
    let totalChipChange = 0;
    
    if (splitHands.length > 0) {
      splitHands.forEach(hand => {
        const handWager = hand.wager;
        if (result === 'player') {
          if (message.includes('Blackjack')) {
            totalChipChange += Math.floor(handWager * 2.5);
          } else {
            totalChipChange += handWager * 2;
          }
        } else if (result === 'push') {
          totalChipChange += handWager;
        }
      });
    } else {
      if (result === 'player') {
        if (message.includes('Blackjack')) {
          totalChipChange = Math.floor(currentWager * 2.5);
        } else {
          totalChipChange = currentWager * 2;
        }
      } else if (result === 'push') {
        totalChipChange = currentWager;
      }
    }
    
    if (totalChipChange > 0) {
      setChips(prev => prev + totalChipChange);
    }
    
    setCurrentWager(0);
    setIsGameStarted(false);
    setIsPlayerTurn(false);
    setGameStatus('betting');
    setSplitHands([]);
    setCurrentHandIndex(0);
  }, [currentWager, splitHands]);

  // Now define handleDealerTurn after endGame
  const handleDealerTurn = useCallback(() => {
    let dealerScore = calculateScore(dealerHand);
    
    while (dealerScore < 17) {
      const newCard = deck.drawCard();
      setDealerHand(prev => [...prev, newCard]);
      dealerScore = calculateScore([...dealerHand, newCard]);
    }

    // Compare scores and determine winner
    if (splitHands.length > 0) {
      splitHands.forEach(hand => {
        const handScore = calculateScore(hand.cards);
        if (handScore > 21) {
          endGame('dealer', 'Bust! Dealer Wins!');
        } else if (dealerScore > 21) {
          endGame('player', 'Dealer Busts! You Win!');
        } else if (handScore > dealerScore) {
          endGame('player', 'You Win!');
        } else if (dealerScore > handScore) {
          endGame('dealer', 'Dealer Wins!');
        } else {
          endGame('push', 'Push!');
        }
      });
    } else {
      const playerScore = calculateScore(playerHand);
      if (playerScore > 21) {
        endGame('dealer', 'Bust! Dealer Wins!');
      } else if (dealerScore > 21) {
        endGame('player', 'Dealer Busts! You Win!');
      } else if (playerScore > dealerScore) {
        endGame('player', 'You Win!');
      } else if (dealerScore > playerScore) {
        endGame('dealer', 'Dealer Wins!');
      } else {
        endGame('push', 'Push!');
      }
    }
  }, [dealerHand, deck, playerHand, splitHands, endGame]);

  /**
   * Deals initial cards to player and dealer at the start of a game
   * Follows casino dealing sequence: player, dealer, player, dealer
   */
  const dealInitialCards = useCallback(() => {
    // Clear the placeholder cards first
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
    
    // Deduct initial wager from chips immediately
    setChips(prev => prev - wager);
    setCurrentWager(wager);
    setIsGameStarted(true);
    
    // Clear split hands state
    setSplitHands([]);
    setCurrentHandIndex(0);
    
    if (deck.reshuffleIfNeeded()) {
      // Handle shuffle animation/notification if needed
    }
    
    dealInitialCards();
  }, [chips, deck, dealInitialCards]);

  const updateChips = useCallback((amount) => {
    setChips(prev => prev + amount);
  }, []);

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
    if (!isPlayerTurn || !canDoubleDown) return;
    
    const currentHandWager = splitHands.length > 0 
      ? splitHands[currentHandIndex].wager 
      : currentWager;
      
    // Verify chips available and deduct additional wager
    if (chips >= currentHandWager) {
      setChips(prev => prev - currentHandWager);
      
      if (splitHands.length > 0) {
        // Update split hand wager
        setSplitHands(prev => {
          const updated = [...prev];
          updated[currentHandIndex] = {
            ...updated[currentHandIndex],
            wager: currentHandWager * 2,
            isDoubled: true
          };
          return updated;
        });
      } else {
        setCurrentWager(prev => prev * 2);
      }
      
      // Deal one card and end turn
      hit();
      stand();
    }
  }, [isPlayerTurn, canDoubleDown, chips, currentWager, splitHands, currentHandIndex, hit, stand]);

  /**
   * Handles splitting pairs into two separate hands
   */
  const split = useCallback(() => {
    if (!canSplit) return;
    
    // Deduct wager for the new hand
    setChips(prev => prev - currentWager);
    
    // Create two new hands from the split pair
    const [card1, card2] = playerHand;
    
    const hand1 = {
      cards: [card1],
      wager: currentWager,
      isPlayed: false,
      isDoubled: false
    };
    
    const hand2 = {
      cards: [card2],
      wager: currentWager,
      isPlayed: false,
      isDoubled: false
    };
    
    // Set up split hands state
    setSplitHands([hand1, hand2]);
    setCurrentHandIndex(0);
    
    // Deal one card to each split hand
    setSplitHands(prev => {
      const updatedHands = prev.map(hand => ({
        ...hand,
        cards: [...hand.cards, deck.drawCard()]
      }));
      return updatedHands;
    });
    
    setGameStatus('playing');
  }, [canSplit, playerHand, currentWager, chips, deck]);

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