import { useGameContext } from '../context/GameContext';
import Card from './Card';

const PlayerHand = () => {
  const { playerHand, playerScore } = useGameContext();

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-2">
        {playerHand.map((card, index) => (
          <Card key={index} card={card} isDealer={false} />
        ))}
      </div>
      <div className="text-white text-lg">
        Score: {playerScore}
      </div>
    </div>
  );
};

export default PlayerHand;
