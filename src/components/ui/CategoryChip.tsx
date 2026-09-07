import React from 'react';
import { CategoryMeta } from '@/types';

interface CategoryChipProps {
  category: CategoryMeta;
  selected?: boolean;
  onClick: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  selected = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={category.label}
      aria-label={category.label}
      className={`flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl transition-all duration-150 active:scale-95 shrink-0 select-none ${
        selected
          ? 'bg-gradient-to-r from-pookie-primary to-[#FF5E9E] shadow-pookie scale-105 border border-pink-400'
          : 'bg-white border border-pookie-soft hover:bg-pookie-blush hover:border-pookie-accent'
      }`}
    >
      <span className="text-lg sm:text-xl leading-none">{category.emoji}</span>
    </button>
  );
};

