import { useGameContext } from '../context/GameContext';
import Card from './Card';

const PlayerHand = () => {
  const { playerHand, playerScore, splitHands, currentHandIndex } = useGameContext();

  if (!playerHand) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold text-white">Player's Hand</h2>
      <div className="flex space-x-2">
        {playerHand.map((card, index) => (
          <Card key={index} card={card} isDealer={false} />
        ))}
      </div>
      <div className="text-white text-lg">
        Score: {playerScore}
      </div>
      {splitHands && splitHands.length > 0 && (
        <div className="mt-4">
          {splitHands.map((hand, index) => (
            <div key={index} className={`flex flex-col items-center space-y-2 mt-4 ${currentHandIndex === index ? 'border-2 border-yellow-400 p-2 rounded' : ''}`}>
              <div className="flex space-x-2">
                {hand.cards.map((card, cardIndex) => (
                  <Card key={cardIndex} card={card} isDealer={false} />
                ))}
              </div>
              <div className="text-white text-lg">
                Score: {calculateScore(hand.cards)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerHand;
