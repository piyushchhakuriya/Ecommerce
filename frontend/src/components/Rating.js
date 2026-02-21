import React from 'react';
import { motion } from 'framer-motion';

export default function Rating({
  rating = 0,
  numReviews = 0,
  caption,
  interactive = false,
  onRate,
}) {
  const totalStars = 5;

  const getStarType = (index) => {
    if (rating >= index) return 'full';
    if (rating >= index - 0.5) return 'half';
    return 'empty';
  };

  return (
    <div
      className="d-flex align-items-center gap-2"
      style={{ fontSize: '1rem' }}
      aria-label={`Rating: ${rating} out of 5`}
    >
      {[...Array(totalStars)].map((_, i) => {
        const starIndex = i + 1;
        const starType = getStarType(starIndex);

        return (
          <motion.span
            key={starIndex}
            whileHover={interactive ? { scale: 1.3 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              color: '#f8c40f',
            }}
            onClick={() => interactive && onRate && onRate(starIndex)}
          >
            {starType === 'full' && <i className="fas fa-star" />}
            {starType === 'half' && <i className="fas fa-star-half-alt" />}
            {starType === 'empty' && <i className="far fa-star" />}
          </motion.span>
        );
      })}

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: '0.9rem', color: '#555' }}
      >
        {caption
          ? caption
          : `${numReviews} review${numReviews !== 1 ? 's' : ''}`}
      </motion.span>
    </div>
  );
}
