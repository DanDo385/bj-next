/**
 * GameBoard.jsx
 * This component manages the game board and handles the game logic.
 * It provides a UI for the player to interact with the game, including betting, hitting, standing, doubling down, and splitting.
 * It also displays the current game state, including the player's hand, dealer's hand, and game result.
 */

import { useGameContext } from '../context/GameContext';
import DealerHand from './DealerHand';
import PlayerHand from './PlayerHand';
import Button from './ui/Button';
import Wager from './Wager';
import { useState, useEffect, useCallback } from 'react';
import { MIN_BET } from '../utils/constants';

const GameBoard = () => {
  const { 
    isGameStarted,
    isPlayerTurn,
    canSplit,
    startGame,
    hit,
    stand,
    double,
    split,
    saveGame,
    playerScore,
    currentWager,
    chips,
    gameResult,
    gameStatus,
    splitHands = [],
    currentHandIndex = 0,
    endGame
  } = useGameContext();

  const [selectedWager, setSelectedWager] = useState(MIN_BET);
  const [wagerError, setWagerError] = useState('');

  // Determine the current hand based on splitHands.
  const playerHand = splitHands[currentHandIndex]?.cards ?? [];

  // Modify the auto-end logic so it doesn't trigger when split hands exist.
  useEffect(() => {
    // Only auto-end if there's no split hand (or if you prefer, if you are on a single-hand game)
    if (isGameStarted && playerScore === 21 && (!splitHands || splitHands.length === 0)) {
      endGame('player', 'Blackjack! You Win!');
    }
  }, [isGameStarted, playerScore, splitHands, endGame]);

  const handleStartGame = () => {
    if (selectedWager < MIN_BET) {
      setWagerError(`Minimum bet is ${MIN_BET.toLocaleString()} chips`);
      return;
    }
    if (selectedWager > chips) {
      setWagerError(`Maximum bet is ${chips.toLocaleString()} chips`);
      return;
    }
    startGame(selectedWager);
    setWagerError('');
  };

  const canDoubleDown = useCallback(() => {
    if (!isPlayerTurn || playerHand.length !== 2) return false;
    if (chips < currentWager) return false;
    
    // If we're playing split hands, use the current hand's wager
    if (splitHands.length > 0) {
      const currentHand = splitHands[currentHandIndex];
      return currentHand.cards.length === 2 && chips >= currentHand.wager;
    }
    
    return true;
  }, [isPlayerTurn, playerHand, chips, currentWager, splitHands, currentHandIndex]);

  return (
    <div className="flex items-start space-x-8 p-8">
      {/* Wager Section - Always visible */}
      <div className="flex-none w-80">
        <Wager 
          onWagerChange={setSelectedWager} 
          initialWager={selectedWager}
          currentChips={chips}
        />
        <div className="mt-4 space-y-2">
          <Button 
            onClick={handleStartGame} 
            variant="primary" 
            className="w-full"
            disabled={chips < MIN_BET}
          >
            Deal New Hand
          </Button>
          <Button onClick={saveGame} variant="secondary" className="w-full">
            Continue Later...
          </Button>
          {wagerError && (
            <div className="text-red-500 text-sm">{wagerError}</div>
          )}
        </div>
      </div>

      {/* Game Board - Right Side */}
      <div className="flex-grow flex flex-col items-center space-y-8">
      
        
        {gameResult && (
          <div className="text-2xl font-bold text-yellow-400 mb-4 text-center">
            {gameResult.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}
        
        {/* Display the dealer's hand and player's hand */}
        <DealerHand />
        <PlayerHand />
        
        {isPlayerTurn && splitHands.length > 0 && (
          <div className="text-yellow-400 text-xl mb-4">
            Playing Hand {currentHandIndex + 1} of {splitHands.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
