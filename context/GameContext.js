/**
 * GameContext.js
 * This file defines the GameContext, which is used to manage the global state for the Blackjack game.
 * It provides a context that can be accessed by any component within the GameProvider component.
 */

import { createContext, useContext } from 'react';

export const GameContext = createContext();

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}; 