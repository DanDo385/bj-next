import { useGameContext } from '../context/GameContext';
import DealerHand from './DealerHand';
import PlayerHand from './PlayerHand';
import Button from './ui/Button';
import Wager from './Wager';

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
    saveGame
  } = useGameContext();

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      {!isGameStarted ? (
        <Wager onWagerChange={(amount) => console.log(amount)} />
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
              <div className="flex space-x-4">
                <Button onClick={startGame} variant="primary">Deal</Button>
                <Button onClick={saveGame} variant="secondary">Continue Later...</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameBoard;
