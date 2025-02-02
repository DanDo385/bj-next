/**
 * Wager.jsx
 * This component manages the player's wager and handles input validation.
 * It provides a slider for selecting the wager amount and buttons for setting the wager to a random value or all-in.
 * It also displays the current wager and total chips, and handles input validation for the wager.
 */

import { useState, useEffect } from 'react';
import { STARTING_CHIPS, MIN_BET } from '../utils/constants';

const Wager = ({ onWagerChange, initialWager, currentChips = STARTING_CHIPS, isDoubled }) => {
  const [wager, setWager] = useState(initialWager || Math.min(10000, currentChips));
  const [error, setError] = useState('');
  const maxBet = currentChips || 0;

  useEffect(() => {
    if (!initialWager) {
      const defaultWager = Math.min(10000, currentChips);
      setWager(defaultWager);
      onWagerChange(defaultWager);
    }
  }, [currentChips, initialWager, onWagerChange]);

  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setWager(value);
    onWagerChange(value);
    validateWager(value);
  };

  const validateWager = (value) => {
    if (value < MIN_BET) {
      setError(`Minimum bet is ${MIN_BET.toLocaleString()} chips`);
      return false;
    }
    if (value > maxBet) {
      setError(`Maximum bet is ${maxBet.toLocaleString()} chips`);
      return false;
    }
    setError('');
    return true;
  };

  const handleInputChange = (e) => {
    // Remove commas and convert to number
    const value = Number(e.target.value.replace(/,/g, ''));
    setWager(value);
    if (validateWager(value)) {
      onWagerChange(value);
    }
  };

  const handleRandomWager = () => {
    const randomWager = Math.floor(Math.random() * (maxBet - MIN_BET + 1) + MIN_BET);
    setWager(randomWager);
    onWagerChange(randomWager);
    setError('');
  };

  const handleAllIn = () => {
    const allIn = currentChips || 0;
    setWager(allIn);
    onWagerChange(allIn);
    setError('');
  };

  return (
    <div className="fixed top-4 left-4 w-80 p-4 bg-gray-800 rounded-lg shadow-lg z-50">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white">
          Total Chips: {currentChips.toLocaleString()}
          {isDoubled && <span className="text-yellow-400 ml-2">(Doubled)</span>}
        </h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={wager.toLocaleString()}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
          <button
            onClick={handleAllIn}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            All In!
          </button>
          <button
            onClick={handleRandomWager}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Random
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <input
          type="range"
          min={MIN_BET}
          max={maxBet}
          value={wager}
          onChange={handleSliderChange}
          className="w-full"
        />

        <div className="flex justify-between text-sm text-gray-300">
          <span>Min: {MIN_BET.toLocaleString()}</span>
          <span>Max: {maxBet.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Wager; 