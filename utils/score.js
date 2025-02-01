// utils/score.js

// Function to calculate the total score of a blackjack hand
export const calculateScore = (hand) => {
  // Return 0 if hand is empty or undefined
  if (!hand || hand.length === 0) return 0;
  
  let score = 0;
  let numAces = 0; // Track number of aces to handle their flexible value (1 or 11)

  // Calculate initial score by processing each card
  hand.forEach(card => {
    const value = card.split('-')[0]; // Extract value from "A-H.png" format
    
    // Face cards (J,Q,K) are worth 10
    if (['J', 'Q', 'K'].includes(value)) {
      score += 10;
    } 
    // Aces are initially counted as 11
    else if (value === 'A') {
      numAces += 1;
      score += 11;
    }
    // Number cards are worth their face value
    else {
      score += parseInt(value, 10);
    }
  });

  // If score is over 21 and we have aces, convert them from 11 to 1 until score is valid
  // or we run out of aces to convert
  while (score > 21 && numAces > 0) {
    score -= 10; // Convert an ace from 11 to 1 by subtracting 10
    numAces--;
  }

  return score;
};
