import { useState, useCallback } from 'react';
import { GameContext } from './GameContext';
import createDeck from '../utils/deck';
import { calculateScore } from '../utils/score';
import { STARTING_CHIPS } from '../utils/constants';

const GameProvider = ({ children }) => {
  const [deck] = useState(() => createDeck());
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [currentWager, setCurrentWager] = useState(0);
  const [chips, setChips] = useState(STARTING_CHIPS);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState('betting'); // betting, playing, dealer, finished
  const [splitHands, setSplitHands] = useState([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  const canDouble = playerHand.length === 2 && chips >= currentWager * 2;
  const canSplit = playerHand.length === 2 && 
                   playerHand[0]?.split('-')[0] === playerHand[1]?.split('-')[0] && 
                   chips >= currentWager * 2;

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

  const hit = useCallback(() => {
    if (!isPlayerTurn) return;
    
    const newHand = [...playerHand, deck.drawCard()];
    setPlayerHand(newHand);
    
    if (calculateScore(newHand) >= 21) {
      setIsPlayerTurn(false);
      handleDealerTurn(newHand);
    }
  }, [deck, playerHand, isPlayerTurn]);

  const stand = useCallback(() => {
    setIsPlayerTurn(false);
    handleDealerTurn(playerHand);
  }, [playerHand]);

  const double = useCallback(() => {
    if (!canDouble) return;
    
    setChips(prev => prev - currentWager);
    setCurrentWager(prev => prev * 2);
    
    const newHand = [...playerHand, deck.drawCard()];
    setPlayerHand(newHand);
    setIsPlayerTurn(false);
    handleDealerTurn(newHand);
  }, [deck, playerHand, currentWager, canDouble]);

  const split = useCallback(() => {
    if (!canSplit) return;
    
    // Create two new hands from the split pair
    const [card1, card2] = playerHand;
    const hand1 = [card1, deck.drawCard()];
    const hand2 = [card2, deck.drawCard()];
    
    // Deduct additional wager
    setChips(prev => prev - currentWager);
    
    // Set up split hands state
    setSplitHands([
      { cards: hand1, wager: currentWager },
      { cards: hand2, wager: currentWager }
    ]);
    
    setCurrentHandIndex(0);
    setPlayerHand(hand1);
    setIsPlayerTurn(true);
  }, [deck, playerHand, currentWager, canSplit]);

  const handleDealerTurn = useCallback((finalPlayerHand) => {
    const playerFinalScore = calculateScore(finalPlayerHand);
    
    if (playerFinalScore > 21) {
      endGame('dealer');
      return;
    }

    let currentDealerHand = [...dealerHand];
    let currentScore = calculateScore(currentDealerHand);

    while (currentScore < 17) {
      currentDealerHand.push(deck.drawCard());
      currentScore = calculateScore(currentDealerHand);
    }

    setDealerHand(currentDealerHand);
    
    if (currentScore > 21 || playerFinalScore > currentScore) {
      endGame('player');
    } else if (currentScore > playerFinalScore) {
      endGame('dealer');
    } else {
      endGame('push');
    }
  }, [deck, dealerHand]);

  const endGame = useCallback((result) => {
    setGameStatus('finished');
    
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
    }, 2000);
  }, [currentWager]);

  const saveGame = useCallback(async () => {
    // Implement save game logic with smart contract here
    console.log('Saving game state...');
  }, [chips]);

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
    saveGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider; 