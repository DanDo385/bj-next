/**
 * DealerHand.jsx
 * This component displays the dealer's current hand and its score.
 * It also handles the display of split hands if applicable.
 */

import { useGameContext } from '../context/GameContext';
import Card from './Card';
import { calculateScore } from '../utils/score';

const DealerHand = () => {
  const { dealerHand, dealerScore, isPlayerTurn, gameStatus } = useGameContext();

  const getVisibleScore = () => {
    if (!dealerHand || dealerHand.length === 0) return 0;
    if (dealerHand[0] === 'BACK.png') return 0;
    const visibleCards = isPlayerTurn ? dealerHand.slice(1) : dealerHand;
    return calculateScore(visibleCards);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold text-white">Dealer's Hand</h2>
      <div className="flex space-x-2">
        {dealerHand.map((card, index) => (
          <Card 
            key={index} 
            card={card}
            isDealer={true}
          />
        ))}
      </div>
      <div className="text-white text-lg">
        Score: {isPlayerTurn ? getVisibleScore() : dealerScore}
      </div>
    </div>
  );
};

export default DealerHand;
