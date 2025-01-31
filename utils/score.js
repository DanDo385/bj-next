// utils/score.js

export const calculateScore = (hand) => {
  // hand is an array of card objects
  let score = 0;
  let numAces = 0;

  // First pass: count aces and add all other cards
  hand.forEach(card => {
    // Convert card.value to a number, or use special logic for face cards/Aces
    // For example:
    if (['J', 'Q', 'K'].includes(card.value)) {
      score += 10;
    } else if (card.value === 'A') {
      numAces += 1;
      score += 11; // or adjust later if necessary
    } else {
      score += parseInt(card.value, 10);
    }
  });

  // Second pass: adjust aces from 11 to 1 if score is over 21
  while (score > 21 && numAces > 0) {
    score -= 10; // Change an ace from 11 to 1
    numAces--;
  }

  return score;
};
