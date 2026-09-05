import { CategoryType } from '@/types';

export interface MenuItem {
  id: string;
  name: string;
  priceRupees: number;
  category: CategoryType;
  section: string;
}

// Transcribed from the canteen's handwritten price list.
export const MENU: MenuItem[] = [
  // South Indian
  { id: 'south-thali-1', name: 'South Ind Thali (Chapathi, Dal, Sabzi, Papad)', priceRupees: 75, category: 'meal', section: 'South Indian' },
  { id: 'south-thali-2', name: 'South Ind Thali (Sambar, Poriyal, Rasam, Papadam)', priceRupees: 60, category: 'meal', section: 'South Indian' },
  { id: 'plain-rice', name: 'Plain Rice', priceRupees: 23, category: 'meal', section: 'South Indian' },
  { id: 'curd', name: 'Curd', priceRupees: 9, category: 'snack', section: 'South Indian' },

  // Fried Rice
  { id: 'chicken-fried-rice', name: 'Chicken Fried Rice', priceRupees: 84, category: 'meal', section: 'Fried Rice' },
  { id: 'egg-fried-rice', name: 'Egg Fried Rice', priceRupees: 62, category: 'meal', section: 'Fried Rice' },
  { id: 'veg-fried-rice', name: 'Veg Fried Rice', priceRupees: 52, category: 'meal', section: 'Fried Rice' },

  // Noodles
  { id: 'chicken-noodles', name: 'Chicken Noodles', priceRupees: 73, category: 'meal', section: 'Noodles' },
  { id: 'egg-noodles', name: 'Egg Noodles', priceRupees: 69, category: 'meal', section: 'Noodles' },
  { id: 'veg-noodles', name: 'Veg Noodles', priceRupees: 54, category: 'meal', section: 'Noodles' },

  // Chicken Specials
  { id: 'chicken-65', name: 'Chicken 65', priceRupees: 86, category: 'meal', section: 'Chicken Specials' },
  { id: 'chicken-manchurian', name: 'Chicken Manchurian', priceRupees: 79, category: 'meal', section: 'Chicken Specials' },
  { id: 'chilly-chicken', name: 'Chilly Chicken', priceRupees: 76, category: 'meal', section: 'Chicken Specials' },
  { id: 'garlic-chicken', name: 'Garlic Chicken', priceRupees: 78, category: 'meal', section: 'Chicken Specials' },
  { id: 'butter-chicken', name: 'Butter Chicken', priceRupees: 78, category: 'meal', section: 'Chicken Specials' },
  { id: 'bengali-chicken', name: 'Bengali Chicken', priceRupees: 78, category: 'meal', section: 'Chicken Specials' },

  // Egg
  { id: 'boiled-egg', name: 'Boiled Egg', priceRupees: 20, category: 'snack', section: 'Egg' },
  { id: 'single-egg-curry', name: 'Single Egg Curry', priceRupees: 14, category: 'snack', section: 'Egg' },
  { id: 'egg-curry', name: 'Egg Curry', priceRupees: 30, category: 'meal', section: 'Egg' },
  { id: 'omelette', name: 'Omelette', priceRupees: 14, category: 'snack', section: 'Egg' },

  // Biryani & Rice
  { id: 'chicken-biryani', name: 'Chicken Biryani', priceRupees: 96, category: 'meal', section: 'Biryani & Rice' },
  { id: 'variety-rice', name: 'Variety Rice (Coconut)', priceRupees: 34, category: 'meal', section: 'Biryani & Rice' },
  { id: 'egg-biryani', name: 'Egg Biryani', priceRupees: 74, category: 'meal', section: 'Biryani & Rice' },
  { id: 'curd-rice', name: 'Curd Rice', priceRupees: 24, category: 'meal', section: 'Biryani & Rice' },
  { id: 'veg-biryani', name: 'Veg Biryani', priceRupees: 61, category: 'meal', section: 'Biryani & Rice' },

  // Roti & Sides
  { id: 'chapathi', name: 'Chapathi (2 nos)', priceRupees: 15, category: 'snack', section: 'Roti & Sides' },
  { id: 'phulka', name: 'Phulka (2 nos)', priceRupees: 18, category: 'snack', section: 'Roti & Sides' },
  { id: 'bindi-roast', name: 'Bindi Roast', priceRupees: 33, category: 'snack', section: 'Roti & Sides' },
  { id: 'aloo-capsicum', name: 'Aloo Capsicum', priceRupees: 40, category: 'snack', section: 'Roti & Sides' },
  { id: 'channa-masala', name: 'M. Channa Masala', priceRupees: 40, category: 'snack', section: 'Roti & Sides' },
  { id: 'moong-dal', name: 'Green Moong Dal', priceRupees: 33, category: 'snack', section: 'Roti & Sides' },

  // Veg Manchurian
  { id: 'gobi-manchurian', name: 'Gobi Manchurian', priceRupees: 45, category: 'snack', section: 'Veg Manchurian' },
  { id: 'babycorn-manchurian', name: 'Baby Corn Manchurian', priceRupees: 47, category: 'snack', section: 'Veg Manchurian' },
];

export const MENU_SECTIONS: string[] = Array.from(new Set(MENU.map((m) => m.section)));
