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
    // Current cards in the player's hand
    playerHand,
    // Current total score of player's hand 
    playerScore,
    // Array of split hands when player splits pairs
    splitHands,
    // Index of the currently active split hand (0 if no splits)
    currentHandIndex,
    // Amount currently wagered on this hand
    currentWager,
    // Action to draw another card
    hit,
    // Action to end turn and let dealer play
    stand,
    // Action to double wager and receive one card
    double,
    // Action to split a pair into two hands
    split,
    // Whether it's currently the player's turn
    isPlayerTurn,
    // Player's total available chips
    chips,
    // Whether player can double down on current hand
    canDoubleDown,
    // Whether player can split current hand
    canSplit,
    // Current state of the game ('betting', 'playing', 'finished')
    gameStatus,
    // Game result message
    gameResult
  } = useGameContext();

  // If no split has occurred, wrap the single hand in an array.
  const hands =
    splitHands && splitHands.length > 0
      ? splitHands
      : [{ cards: playerHand, wager: currentWager, isDoubled: false }];

  // When there are no splits, treat the only hand as active (index 0)
  const activeHandIndex =
    splitHands && splitHands.length > 0 ? currentHandIndex : 0;

  // If the hand contains BACK.png cards, disable all actions
  const isPlaceholder = playerHand.includes('BACK.png');

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
      <Button onClick={() => hit(handIndex)} disabled={isPlaceholder}>Hit</Button>
      <Button onClick={() => stand(handIndex)} disabled={isPlaceholder}>Stand</Button>
      <Button
        onClick={() => double(handIndex)}
        disabled={isPlaceholder || (handIndex !== undefined ? 
          !canDoubleForHand(hands[handIndex]) : 
          !canDoubleDown
        )}
      >
        Double
      </Button>
      <Button
        onClick={() => split(handIndex)}
        disabled={isPlaceholder || (handIndex !== undefined ?
          !canSplitHand(hands[handIndex]) :
          !canSplit
        )}
      >
        Split
      </Button>
    </div>
  );

  // Renders a hand along with its cards, score, and action buttons.
  const renderHand = (cards, score, isDoubled, wager, handIndex) => (
    <div className="flex items-start space-x-8">
      <div className="flex items-start space-x-4">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex space-x-2">
            {cards.map((card, index) => (
              <Card key={index} card={card} isDealer={false} />
            ))}
          </div>
          <div className="text-white text-lg space-y-1">
            <div>Score: {cards.includes('BACK.png') ? 0 : score}</div>
            {isDoubled && (
              <div className="text-yellow-400">
                Doubled Down! ({wager.toLocaleString()})
              </div>
            )}
          </div>
        </div>
        {isPlayerTurn && (
          renderActionButtons(
            splitHands.length > 0 ? handIndex : undefined
          )
        )}
      </div>
      
      {/* Result message for this hand */}
      {gameStatus === 'finished' && gameResult && (
        <div className="text-xl font-bold">
          {splitHands.length > 0 ? (
            <div className={`
              ${gameResult.split('\n')[handIndex]?.includes('Won') ? 'text-green-400' : 
                gameResult.split('\n')[handIndex]?.includes('Push') ? 'text-yellow-400' : 
                'text-red-400'}
            `}>
              {gameResult.split('\n')[handIndex]}
            </div>
          ) : (
            <div className={`
              ${gameResult.includes('Won') ? 'text-green-400' : 
                gameResult.includes('Push') ? 'text-yellow-400' : 
                'text-red-400'}
            `}>
              {gameResult}
            </div>
          )}
        </div>
      )}
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
