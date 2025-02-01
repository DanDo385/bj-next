// utils/score.js

export const calculateScore = (hand) => {
  if (!hand || hand.length === 0) return 0;
  
  let score = 0;
  let numAces = 0;

  hand.forEach(card => {
    const value = card.split('-')[0]; // Extract value from "A-H.png" format
    
    if (['J', 'Q', 'K'].includes(value)) {
      score += 10;
    } else if (value === 'A') {
      numAces += 1;
      score += 11;
    } else {
      score += parseInt(value, 10);
    }
  });

  while (score > 21 && numAces > 0) {
    score -= 10;
    numAces--;
  }

  return score;
};
