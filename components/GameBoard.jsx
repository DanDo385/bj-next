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
    canDouble,
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

  const playerHand = splitHands[currentHandIndex]?.cards ?? [];

  useEffect(() => {
    if (isGameStarted && playerScore === 21) {
      endGame('player', 'Blackjack! You Win!');
    }
  }, [isGameStarted, playerScore]);

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
    
    // If we're playing split hands
    if (splitHands.length > 0) {
      const currentHand = splitHands[currentHandIndex];
      return currentHand.cards.length === 2 && chips >= currentHand.wager;
    }
    
    return true;
  }, [isPlayerTurn, playerHand, chips, currentWager, splitHands, currentHandIndex]);

  return (
    <div className="flex items-start space-x-8 p-8">
      {/* Wager Section - Left Side */}
      {!isGameStarted && (
        <div className="flex-none w-80">
          <Wager onWagerChange={setSelectedWager} initialWager={selectedWager} />
          <div className="mt-4 space-y-2">
            <Button onClick={handleStartGame} variant="primary" className="w-full">
              Deal
            </Button>
            <Button onClick={saveGame} variant="secondary" className="w-full">
              Continue Later...
            </Button>
            {wagerError && (
              <div className="text-red-500 text-sm">{wagerError}</div>
            )}
          </div>
        </div>
      )}

      {/* Game Board - Right Side */}
      <div className="flex-grow flex flex-col items-center space-y-8">
        <div className="text-white text-xl mb-4">
          Current Wager: {currentWager.toLocaleString()} chips | Chips: {chips.toLocaleString()} chips
        </div>
        
        {gameResult && (
          <div className="text-2xl font-bold text-yellow-400 mb-4 text-center">
            {gameResult.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}
        
        {/* Show hands whenever there are cards, not just when game is started */}
        <DealerHand />
        <PlayerHand />
        
        {isPlayerTurn && splitHands.length > 0 && (
          <div className="text-yellow-400 text-xl mb-4">
            Playing Hand {currentHandIndex + 1} of 2
          </div>
        )}
        
        {isPlayerTurn && (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={hit}>Hit</Button>
              <Button onClick={stand}>Stand</Button>
              <Button 
                onClick={double} 
                disabled={!canDoubleDown()}
                className={!canDoubleDown() ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Double Down
              </Button>
              <Button onClick={split} disabled={!canSplit}>Split</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
