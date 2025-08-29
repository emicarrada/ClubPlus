import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'combo';
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className,
  onClick,
  isSelected = false,
}) => {
  const baseClasses = 'card';

  const variants = {
    default: '',
    combo: 'card-combo',
  };

  const selectedClasses = isSelected ? 'border-primary bg-red-50' : '';

  const CardComponent = onClick ? motion.div : 'div';
  const motionProps = onClick
    ? {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      }
    : {};

  return (
    <CardComponent
      className={cn(
        baseClasses,
        variants[variant],
        selectedClasses,
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
