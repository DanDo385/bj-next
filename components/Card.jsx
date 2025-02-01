/**
 * Card.jsx
 * This component displays a single card image.
 * It uses Next.js Image component for optimized image loading.
 */

import Image from 'next/image';

const Card = ({ card }) => {
  return (
    <div className="relative w-24 h-36">
      <Image
        src={`/cards/${card}`}
        alt={card}
        width={96}
        height={144}
        priority={true}
      />
    </div>
  );
};

export default Card;
