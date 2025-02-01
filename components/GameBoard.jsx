import { useGameContext } from '../context/GameContext';
import DealerHand from './DealerHand';
import PlayerHand from './PlayerHand';
import Button from './ui/Button';
import Wager from './Wager';
import { useState, useEffect } from 'react';

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
    chips
  } = useGameContext();

  const [selectedWager, setSelectedWager] = useState(0);

  useEffect(() => {
    if (isGameStarted && playerScore === 21) {
      alert('Blackjack! Player Wins!');
      // The endGame function in GameProvider will handle the payout
    }
  }, [isGameStarted, playerScore]);

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="text-white text-xl mb-4">
        Current Wager: ${currentWager} | Chips: ${chips}
      </div>
      
      {!isGameStarted ? (
        <div className="space-y-4">
          <Wager onWagerChange={setSelectedWager} />
          <div className="flex justify-center space-x-4">
            <Button onClick={() => startGame(selectedWager)} variant="primary">
              Deal
            </Button>
            <Button onClick={saveGame} variant="secondary">
              Continue Later...
            </Button>
          </div>
        </div>
      ) : (
        <>
          <DealerHand />
          <PlayerHand />
          
          {isPlayerTurn && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={hit}>Hit</Button>
                <Button onClick={stand}>Stand</Button>
                <Button onClick={double} disabled={!canDouble}>Double</Button>
                <Button onClick={split} disabled={!canSplit}>Split</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameBoard;
