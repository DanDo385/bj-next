import { useState, useEffect } from 'react';
import { STARTING_CHIPS, MIN_BET } from '../utils/constants';

const Wager = ({ onWagerChange }) => {
  const [chips, setChips] = useState(STARTING_CHIPS);
  const [wager, setWager] = useState(Math.max(chips * 0.1, MIN_BET));
  const maxBet = chips;

  useEffect(() => {
    // Update default wager when chips change
    if (chips >= 10000) {
      setWager(Math.floor(chips * 0.1));
    }
  }, [chips]);

  const handleSliderChange = (e) => {
    setWager(Number(e.target.value));
    onWagerChange(Number(e.target.value));
  };

  const handleInputChange = (e) => {
    const value = Math.min(Math.max(Number(e.target.value), MIN_BET), maxBet);
    setWager(value);
    onWagerChange(value);
  };

  const handleRandomWager = () => {
    const randomWager = Math.floor(Math.random() * (maxBet - MIN_BET + 1) + MIN_BET);
    setWager(randomWager);
    onWagerChange(randomWager);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">Total Chips: {chips.toLocaleString()}</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={wager}
            onChange={handleInputChange}
            min={MIN_BET}
            max={maxBet}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
          <button
            onClick={handleRandomWager}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Random
          </button>
        </div>

        <input
          type="range"
          min={MIN_BET}
          max={maxBet}
          value={wager}
          onChange={handleSliderChange}
          className="w-full"
        />

        <div className="flex justify-between text-sm text-gray-300">
          <span>Min: {MIN_BET}</span>
          <span>Max: {maxBet.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Wager; 