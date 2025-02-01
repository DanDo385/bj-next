/**
 * CardCount.jsx
 * This component displays the current card count and true count.
 * It uses the deck's count information to display the running and true counts.
 */

import { useGameContext } from '../context/GameContext';

const CardCount = () => {
  const { deck } = useGameContext();
  const countInfo = deck.getCount();

  return (
    <div className="fixed top-0 right-0 bg-black/80 text-white p-4 m-4 rounded-lg">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Running Count:</div>
        <div className="font-bold">{countInfo.running}</div>
        
        <div>True Count:</div>
        <div className="font-bold">{countInfo.true}</div>
        
        <div>Cards Dealt:</div>
        <div className="font-bold">{countInfo.cardsDealt}</div>
        
        <div>Remaining:</div>
        <div className="font-bold">{countInfo.remainingCards}</div>
      </div>
    </div>
  );
};

export default CardCount; 

