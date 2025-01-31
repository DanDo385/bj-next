// utils/cardUtils.js

export const parseCard = (filename) => {
  if (filename === 'BACK.png') return { rank: 'BACK', suit: 'BACK' };
  const [name] = filename.split('.');
  return { rank: name.split('-')[0], suit: name.split('-')[1] };
};

export const isHiddenCard = (card) => {
  return card === 'BACK.png' || card === 'HIDDEN';
};
