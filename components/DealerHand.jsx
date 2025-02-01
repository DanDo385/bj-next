import { useGameContext } from '../context/GameContext';
import Card from './Card';

const DealerHand = () => {
  const { dealerHand, dealerScore, isPlayerTurn } = useGameContext();

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold text-white">Dealer's Hand</h2>
      <div className="flex space-x-2">
        {dealerHand.map((card, index) => (
          <Card 
            key={index} 
            card={isPlayerTurn && index === 0 ? 'BACK.png' : card} 
            isDealer={true}
          />
        ))}
      </div>
      <div className="text-white text-lg">
        Score: {isPlayerTurn ? '?' : dealerScore}
      </div>
    </div>
  );
};

export default DealerHand;
