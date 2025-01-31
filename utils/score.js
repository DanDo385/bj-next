// utils/score.js
export const calculateScore = (hand) => {
  // hand is an array of card objects
  let score = 0;
  // Example logic: add values, handle face cards and aces, etc.
  hand.forEach(card => {
    // Convert card.value to a number, or use special logic for face cards/Aces
    // For example:
    if (['J', 'Q', 'K'].includes(card.value)) {
      score += 10;
    } else if (card.value === 'A') {
      score += 11; // or adjust later if necessary
    } else {
      score += parseInt(card.value, 10);
    }
  });
  // Additional logic for aces might be applied here
  return score;
};
