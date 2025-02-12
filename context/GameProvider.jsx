// Since this file contains JSX syntax (the <GameContext.Provider> component),
// it should keep the .jsx extension to clearly indicate it contains JSX code.

import { useState, useCallback } from 'react';
import { GameContext } from './GameContext';
import createDeck from '../utils/deck';
import { calculateScore } from '../utils/score';
import { STARTING_CHIPS } from '../utils/constants';

// Helper function to compare scores and decide outcome.
// Returns 'player' if the player wins, 'dealer' if the dealer wins,
// or 'push' if the scores are equal.
const determineWinner = (dealerScore, playerScore) => {
  if (playerScore > 21) return 'dealer';
  if (dealerScore > 21) return 'player';
  if (playerScore > dealerScore) return 'player';
  if (dealerScore > playerScore) return 'dealer';
  return 'push';  // Equal scores result in a push, regardless of double down
};

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
  const [showReshuffle, setShowReshuffle] = useState(false);

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
  const endGame = useCallback((winner, message) => {
    setGameStatus('finished');
    setIsPlayerTurn(false);
    
    if (splitHands.length > 0) {
      // For split hands, create a message for each hand including the cards
      const messages = splitHands.map((hand, index) => {
        const cardList = hand.cards.join(', ').replace(/-/g, ' of ');
        if (winner === 'player') {
          return `Hand ${index + 1} (${cardList}): You Won ${hand.wager.toLocaleString()} chips!`;
        } else if (winner === 'push') {
          return `Hand ${index + 1} (${cardList}): Push - ${hand.wager.toLocaleString()} chips returned`;
        } else {
          return `Hand ${index + 1} (${cardList}): Lost ${hand.wager.toLocaleString()} chips`;
        }
      });
      setGameResult(messages.join('\n'));
    } else {
      setGameResult(message);
    }
    
    // Update chips based on game outcome
    let totalChipChange = 0;
    
    if (winner === 'player') {
      if (message.includes('Blackjack')) {
        totalChipChange = Math.floor(currentWager * 2.5);
      } else {
        totalChipChange = currentWager * 2;
      }
    } else if (winner === 'push') {
      totalChipChange = currentWager;
    }
    
    if (totalChipChange > 0) {
      setChips(prev => prev + totalChipChange);
    }
    
    setCurrentWager(0);
    setIsGameStarted(false);
    setSplitHands([]);
    setCurrentHandIndex(0);
  }, [splitHands, currentWager, chips]);

  // Updated handleDealerTurn now using determineWinner
  const handleDealerTurn = useCallback(() => {
    let updatedDealerHand = [...dealerHand];
    let dealerCurrentScore = calculateScore(updatedDealerHand);

    const dealDealerCards = async () => {
      const dealNextCard = () => {
        if (dealerCurrentScore < 17) {
          const newCard = deck.drawCard();
          updatedDealerHand.push(newCard);
          dealerCurrentScore = calculateScore(updatedDealerHand);
          setDealerHand([...updatedDealerHand]);

          if (dealerCurrentScore < 17) {
            setTimeout(dealNextCard, 2000);
          } else {
            // Determine final outcome
            if (dealerCurrentScore > 21) {
              endGame('player', 'Dealer busts! You win!');
            } else {
              const outcome = determineWinner(dealerCurrentScore, playerScore);
              let message = '';
              if (outcome === 'player') message = 'You win!';
              else if (outcome === 'dealer') message = 'Dealer wins!';
              else message = 'Push - Your wager is returned';
              endGame(outcome, message);
            }
          }
        }
      };
      dealNextCard();
    };

    dealDealerCards();
  }, [dealerHand, deck, playerScore, endGame]);

  /**
   * Deals initial cards to player and dealer at the start of a game
   * Follows casino dealing sequence: player, dealer, player, dealer
   */
  const dealInitialCards = useCallback(() => {
    // Clear the placeholder cards first
    setPlayerHand([]);
    setDealerHand([]);
    
    const dealSequence = async () => {
      // First player card
      const firstPlayerCard = deck.drawCard();
      setPlayerHand([firstPlayerCard]);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // First dealer card
      const firstDealerCard = deck.drawCard();
      setDealerHand([firstDealerCard]);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Second player card
      const secondPlayerCard = deck.drawCard();
      setPlayerHand(prev => [...prev, secondPlayerCard]);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Second dealer card
      const secondDealerCard = deck.drawCard();
      setDealerHand(prev => [...prev, secondDealerCard]);
    };

    dealSequence().then(() => {
      setIsPlayerTurn(true);
      setGameStatus('playing');
    });
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
      setShowReshuffle(true);
      // Hide the message after 2 seconds
      setTimeout(() => {
        setShowReshuffle(false);
        dealInitialCards();
      }, 2000);
    } else {
      dealInitialCards();
    }
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
      const dealCardWithDelay = async () => {
        const newCard = deck.drawCard();
        setSplitHands(prevHands => {
          const updatedHands = [...prevHands];
          const currentHand = updatedHands[currentHandIndex];
          currentHand.cards.push(newCard);

          const score = calculateScore(currentHand.cards);
          if (score >= 21) {
            currentHand.isPlayed = true;
            const nextUnplayedIndex = updatedHands.findIndex(hand => !hand.isPlayed);
            if (nextUnplayedIndex !== -1) {
              setCurrentHandIndex(nextUnplayedIndex);
            } else {
              setIsPlayerTurn(false);
              setTimeout(() => handleDealerTurn(), 2000);
            }
          }
          return updatedHands;
        });
      };
      dealCardWithDelay();
    } else {
      // Regular case (no splits)
      const dealCardWithDelay = async () => {
        const newCard = deck.drawCard();
        setPlayerHand(prev => [...prev, newCard]);
        const score = calculateScore([...playerHand, newCard]);
        if (score >= 21) {
          setIsPlayerTurn(false);
          setTimeout(() => handleDealerTurn(), 2000);
        }
      };
      dealCardWithDelay();
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
    
    // Deal one card to each split hand with delay
    const dealToSplitHands = async () => {
      // Deal to first hand
      setSplitHands(prev => {
        const updatedHands = [...prev];
        updatedHands[0].cards.push(deck.drawCard());
        return updatedHands;
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Deal to second hand
      setSplitHands(prev => {
        const updatedHands = [...prev];
        updatedHands[1].cards.push(deck.drawCard());
        return updatedHands;
      });
    };
    
    dealToSplitHands();
  }, [canSplit, currentWager, playerHand, deck]);

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
    currentHandIndex,
    showReshuffle
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;