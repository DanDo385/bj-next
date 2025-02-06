// utils/cardUtils.js

/**
 * Parses a card filename into its components
 * @param {string} filename - Card image filename (e.g. "queen-hearts.png")
 * @returns {Object} Card object with rank and suit properties
 * @example parseCard("queen-hearts.png") => { rank: "queen", suit: "hearts" }
 */
export const parseCard = (filename) => {
  // Handle special case for card back images
  if (filename === 'BACK.png') return { rank: 'BACK', suit: 'BACK' };
  
  // Split filename into base name and extension, then separate rank/suit
  const [name] = filename.split('.'); // Remove file extension
  return {
    rank: name.split('-')[0], // Part before hyphen is rank (e.g. "queen")
    suit: name.split('-')[1]  // Part after hyphen is suit (e.g. "hearts")
  };
};

/**
 * Determines if a card should be considered hidden
 * @param {string} card - Card identifier or filename
 * @returns {boolean} True if card is a hidden placeholder
 */
export const isHiddenCard = (card) => {
  // Check for both possible hidden card representations
  return card === 'BACK.png' || card === 'HIDDEN';
};
