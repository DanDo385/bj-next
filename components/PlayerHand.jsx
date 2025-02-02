/**
 * PlayerHand.jsx
 * This component displays the player's current hand and its score.
 * It also handles the display of split hands if applicable.
 */

import { useGameContext } from '../context/GameContext';
import Card from './Card';
import Button from './ui/Button';
import { calculateScore } from '../utils/score';

const PlayerHand = () => {
  const { 
    playerHand, 
    playerScore, 
    splitHands, 
    currentHandIndex,
    currentWager,
    hit,
    stand,
    double,
    split,
    isPlayerTurn,
    chips
  } = useGameContext();

  // If no split has occurred, wrap the single hand in an array.
  const hands =
    splitHands && splitHands.length > 0
      ? splitHands
      : [{ cards: playerHand, wager: currentWager, isDoubled: false }];

  // When there are no splits, treat the only hand as active (index 0)
  const activeHandIndex =
    splitHands && splitHands.length > 0 ? currentHandIndex : 0;

  // Helpers for button disabling – note these now take a hand (object) instead of looking it up by index.
  const canDoubleForHand = (hand) => {
    return hand.cards.length === 2 && chips >= hand.wager;
  };

  const canSplitHand = (hand) => {
    if (!hand || hand.cards.length !== 2) return false;
    const [card1, card2] = hand.cards;
    // Assumes card names are formatted like "8-hearts", "8-spades", etc.
    return card1.split('-')[0] === card2.split('-')[0] && chips >= hand.wager;
  };

  // Renders the action buttons for a given hand index.
  const renderActionButtons = (handIndex) => (
    <div className="flex flex-col space-y-2">
      <Button onClick={() => hit(handIndex)}>Hit</Button>
      <Button onClick={() => stand(handIndex)}>Stand</Button>
      <Button 
        onClick={() => double(handIndex)}
        disabled={!canDoubleForHand(hands[handIndex])}
      >
        Double
      </Button>
      <Button 
        onClick={() => split(handIndex)}
        disabled={!canSplitHand(hands[handIndex])}
      >
        Split
      </Button>
    </div>
  );

  // Renders a hand along with its cards, score, and action buttons.
  const renderHand = (cards, score, isDoubled, wager, handIndex) => (
    <div className="flex items-start space-x-4">
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
              Doubled Down! ({wager.toLocaleString()})
            </div>
          )}
        </div>
      </div>
      {isPlayerTurn && handIndex !== undefined && renderActionButtons(handIndex)}
    </div>
  );

  return (
    <div className="flex flex-col items-center space-y-8">
      <h2 className="text-xl font-bold text-white">Player's Hands</h2>
      {/* The flex container will re-arrange the hands on the screen */}
      <div className="flex flex-wrap justify-center gap-8">
        {hands.map((hand, index) => (
          <div 
            key={index}
            className={`p-4 rounded ${
              activeHandIndex === index ? 'border-2 border-yellow-400' : ''
            }`}
          >
            {renderHand(
              hand.cards, 
              calculateScore(hand.cards), 
              hand.isDoubled, 
              hand.wager,
              index
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;
