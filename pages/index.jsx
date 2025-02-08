// pages/index.jsx

import { useState } from 'react';
import { MIN_BET } from '../utils/constants';
import GameBoard from '../components/GameBoard';
import CardCount from '../components/CardCount';
import Wager from '../components/Wager';
import { useGameContext } from '../context/GameContext';

const Home = () => {
  const { 
    // Destructuring values from the global game context via the custom React hook "useGameContext".
    // This hook internally uses React's useContext to obtain shared state and functions, 
    // allowing different components to access and manipulate the game state without prop drilling.
    //
    // Explanation of each variable:
    // - chips: This variable holds the current total number of chips available to the player. 
    //          It is managed through React hooks (like useState) inside the context and updates dynamically.
    //
    // - gameStatus: Indicates the current status of the game (e.g., 'playing', 'finished'). 
    //               React hooks enable automatic re-renders when this state changes.
    //
    // - gameResult: Contains the outcome or result message of the game (e.g., win/loss or draw). 
    //               This leverages React's state management for dynamic UI updates.
    //
    // - splitHands: If the player splits their hand, this array holds the multiple hands created.
    //               Managed within the context, its state updates trigger re-rendering in components that depend on it.
    //
    // - currentHandIndex: When playing with multiple hands (after a split), this index identifies the active hand.
    //                     React hooks ensure that any change here prompts the component to update and reflect the active hand.
    //
    // - startGame: A function provided by the context that initializes the game, setting up the initial wager and other state variables.
    //              Triggering this function updates several pieces of state (managed by hooks like useState), causing a re-render.
    //
    // The use of React hooks here (particularly useContext) facilitates a clean and maintainable approach 
    // to state management in modern React applications.
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
    <div className="min-h-screen bg-green-800 flex flex-col items-center relative">
      <div className="w-full flex justify-center mt-4">
        <CardCount />
      </div>
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
      <div className="flex-grow flex items-center justify-center">
        <GameBoard />
      </div>
    </div>
  );
};

export default Home;
