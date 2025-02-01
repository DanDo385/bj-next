/**
 * PlayerHand.jsx
 * This component displays the player's current hand and its score.
 * It also handles the display of split hands if applicable.
 */

import { useGameContext } from '../context/GameContext';
import Card from './Card';

const PlayerHand = () => {
  const { playerHand, playerScore, splitHands, currentHandIndex } = useGameContext();

  const renderHand = (cards, score, isDoubled, wager) => (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex space-x-2">
        {cards.map((card, index) => (
          <Card key={index} card={card} isDealer={false} />
        ))}
      </div>
      <div className="text-white text-lg space-y-1">
        <div>Score: {score}</div>
        {isDoubled && (
          <div className="text-yellow-400">
            Doubled Down! (${wager.toLocaleString()})
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold text-white">Player's Hand</h2>
      {splitHands && splitHands.length > 0 ? (
        <div className="space-y-6">
          {splitHands.map((hand, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center space-y-2 p-4 rounded ${
                currentHandIndex === index ? 'border-2 border-yellow-400' : ''
              }`}
            >
              {renderHand(hand.cards, calculateScore(hand.cards), hand.isDoubled, hand.wager)}
            </div>
          ))}
        </div>
      ) : (
        renderHand(playerHand, playerScore, false, currentWager)
      )}
    </div>
  );
};

export default PlayerHand;
