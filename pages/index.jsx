// pages/index.jsx

// This is the main page component for the Blackjack game application.
// It serves as the container for all game-related components and manages the core game flow.

import { useState } from 'react';
import { MIN_BET } from '../utils/constants';
import GameBoard from '../components/GameBoard';
import CardCount from '../components/CardCount';
import Wager from '../components/Wager';
import { useGameContext } from '../context/GameContext';

const Home = () => {
  // Destructuring values from the global game context via the custom React hook "useGameContext".
  // This hook internally uses React's useContext to obtain shared state and functions, 
  // allowing different components to access and manipulate the game state without prop drilling.

  // chips: This variable holds the current total number of chips available to the player. 
  // It is managed through React hooks (like useState) inside the context and updates dynamically.

  // gameStatus: Indicates the current status of the game (e.g., 'playing', 'finished'). 
  // React hooks enable automatic re-renders when this state changes.

  // gameResult: Contains the outcome or result message of the game (e.g., win/loss or draw). 
  // This leverages React's state management for dynamic UI updates.

  // splitHands: If the player splits their hand, this array holds the multiple hands created.
  // Managed within the context, its state updates trigger re-rendering in components that depend on it.

  // currentHandIndex: When playing with multiple hands (after a split), this index identifies the active hand.
  // React hooks ensure that any change here prompts the component to update and reflect the active hand.

  // startGame: A function provided by the context that initializes the game, setting up the initial wager and other state variables.
  // Triggering this function updates several pieces of state (managed by hooks like useState), causing a re-render.

  // The use of React hooks here (particularly useContext) facilitates a clean and maintainable approach 
  // to state management in modern React applications.
  const { 
    chips,
    gameStatus,
    gameResult,
    splitHands,
    currentHandIndex,
    startGame
  } = useGameContext();

  // Local state for managing the player's selected wager amount
  const [selectedWager, setSelectedWager] = useState(MIN_BET);
  
  // State for handling and displaying wager-related error messages
  const [wagerError, setWagerError] = useState('');

  // Handler function for starting a new game
  // Validates the wager amount before initiating the game
  const handleStartGame = () => {
    // Check if wager meets minimum bet requirement
    if (selectedWager < MIN_BET) {
      setWagerError(`Minimum bet is ${MIN_BET.toLocaleString()} chips`);
      return;
    }

    // Check if player has enough chips for the wager
    if (selectedWager > chips) {
      setWagerError(`Maximum bet is ${chips.toLocaleString()} chips`);
      return;
    }

    // If validation passes, start the game and clear any error messages
    startGame(selectedWager);
    setWagerError('');
  };

  // The main layout uses Tailwind CSS for styling
  // Organized in a flex column layout with fixed positioning for the wager component
  return (
    <div className="min-h-screen bg-green-800 flex flex-col items-center relative">
      {/* Card count display at the top of the screen */}
      <div className="w-full flex justify-center mt-4">
        <CardCount />
      </div>

      {/* Wager component fixed to the top-left corner */}
      {/* Fixed position container for the wager component in the top-left corner */}
      <div className="fixed top-4 left-4">
        {/* Wager component handles betting UI and validation
            Props:
            - onWagerChange: Updates parent's selectedWager state
            - initialWager: Starting bet amount
            - currentChips: Player's available chips
            - onDeal: Handles game start after wager validation
            - dealDisabled: Disables deal button if player can't meet minimum bet
            - wagerError: Displays validation error messages
            - gameStatus: Current state of the game ('idle', 'playing', 'finished')
            - gameResult: Outcome message when game is finished
            - splitHands: Array of split hands if player has split
            - currentHandIndex: Index of currently active split hand */}
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

      {/* Main game board centered in the remaining space */}
      <div className="flex-grow flex items-center justify-center">
        <GameBoard />
      </div>
    </div>
  );
};

export default Home;
