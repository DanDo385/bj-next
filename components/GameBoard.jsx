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
    splitHands,
    handleSplitWager,
    currentHandIndex
  } = useGameContext();

  const [selectedWager, setSelectedWager] = useState(MIN_BET);
  const [wagerError, setWagerError] = useState('');
  const [splitWager, setSplitWager] = useState(currentWager);
  const [splitWagerError, setSplitWagerError] = useState('');

  const playerHand = splitHands[currentHandIndex]?.cards || [];

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

  const renderSplitWagerUI = () => {
    if (gameStatus !== 'splitting') return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl text-white mb-4">Set Wager for Second Hand</h2>
          <Wager 
            onWagerChange={setSplitWager} 
            initialWager={currentWager}
            maxChips={chips}
          />
          <div className="mt-4 space-y-2">
            <Button 
              onClick={() => {
                if (splitWager > chips) {
                  setSplitWagerError("Insufficient chips");
                  return;
                }
                handleSplitWager(splitWager);
              }}
              variant="primary"
              className="w-full"
            >
              Confirm Split Wager
            </Button>
            {splitWagerError && (
              <div className="text-red-500 text-sm">{splitWagerError}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
          Current Wager: ${currentWager.toLocaleString()} | Chips: ${chips.toLocaleString()}
        </div>
        
        {gameResult && (
          <div className="text-2xl font-bold text-yellow-400 mb-4">
            {gameResult}
          </div>
        )}
        
        {isGameStarted && (
          <>
            <DealerHand />
            <PlayerHand />
            
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
          </>
        )}
      </div>
      {renderSplitWagerUI()}
    </div>
  );
};

export default GameBoard;
