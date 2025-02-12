/**
 * GameBoard.jsx
 * This component manages the game board and handles the game logic.
 * It provides a UI for the player to interact with the game, including betting, hitting, standing, doubling down, and splitting.
 * It also displays the current game state, including the player's hand, dealer's hand, and game result.
 */

import { useGameContext } from '../context/GameContext';
import DealerHand from './DealerHand';
import PlayerHand from './PlayerHand';
import { useEffect } from 'react';

const GameBoard = () => {
  const { 
    isGameStarted,
    isPlayerTurn,
    playerScore,
    gameResult,
    splitHands = [],
    currentHandIndex = 0,
    endGame,
    showReshuffle
  } = useGameContext();

  useEffect(() => {
    if (isGameStarted && playerScore === 21 && (!splitHands || splitHands.length === 0)) {
      endGame('player', 'Blackjack! You Win!');
    }
  }, [isGameStarted, playerScore, splitHands, endGame]);

  return (
    <div className="min-h-screen flex justify-center items-start p-8">
      <div className="flex flex-col items-center space-y-8 max-w-4xl">
        {showReshuffle && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-black bg-opacity-75 text-white text-2xl p-6 rounded-lg z-50">
            Reshuffling Deck...
          </div>
        )}
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
