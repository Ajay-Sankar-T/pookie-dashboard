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
      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 shrink-0 select-none ${
        selected
          ? 'bg-gradient-to-r from-pookie-primary to-[#FF5E9E] text-white shadow-pookie scale-105 border border-pink-400'
          : 'bg-white text-pookie-text border border-pookie-soft hover:bg-pookie-blush hover:border-pookie-accent'
      }`}
    >
      <span className="text-base sm:text-lg leading-none">{category.emoji}</span>
      <span>{category.label}</span>
    </button>
  );
};

