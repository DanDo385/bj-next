/**
 * GameBoard.jsx
 * This component manages the game board and handles the game logic.
 * It provides a UI for the player to interact with the game, including betting, hitting, standing, doubling down, and splitting.
 * It also displays the current game state, including the player's hand, dealer's hand, and game result.
 */

import { useGameContext } from '../context/GameContext';
import DealerHand from './DealerHand';
import PlayerHand from './PlayerHand';
import Wager from './Wager';
import { useState, useEffect } from 'react';
import { MIN_BET } from '../utils/constants';

const GameBoard = () => {
  const { 
    isGameStarted,
    isPlayerTurn,
    startGame,
    playerScore,
    chips,
    gameResult,
    gameStatus,
    splitHands = [],
    currentHandIndex = 0,
    endGame
  } = useGameContext();

  const [selectedWager, setSelectedWager] = useState(MIN_BET);
  const [wagerError, setWagerError] = useState('');

  useEffect(() => {
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

  return (
    <div className="min-h-screen flex justify-center items-start p-8">
      <div className="fixed top-4 left-4">
        <Wager 
          onWagerChange={setSelectedWager} 
          initialWager={selectedWager}
          currentChips={chips}
          onDeal={handleStartGame}
          dealDisabled={chips < MIN_BET}
          wagerError={wagerError}
          gameStatus={gameStatus}
          gameResult={gameResult}
          splitHands={splitHands}
          currentHandIndex={currentHandIndex}
        />
      </div>

      <div className="flex flex-col items-center space-y-8 max-w-4xl">
        {gameResult && (
          <div className="text-2xl font-bold text-yellow-400 mb-4 text-center">
            {gameResult.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
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
