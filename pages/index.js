import { useState } from 'react';
import { MIN_BET } from '../utils/constants';
import GameBoard from '../components/GameBoard';
import Wager from '../components/Wager';
import { useGameContext } from '../context/GameContext';

export default function Home() {
  const { 
    chips,
    gameStatus,
    gameResult,
    splitHands,
    currentHandIndex,
    startGame
  } = useGameContext();

  const [selectedWager, setSelectedWager] = useState(MIN_BET);
  const [wagerError, setWagerError] = useState('');

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
    <div className="relative">
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
      <GameBoard />
    </div>
  );
} 