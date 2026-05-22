export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  time?: string;
}

export interface Meals {
  breakfast: FoodEntry[];
  lunch: FoodEntry[];
  dinner: FoodEntry[];
  snack: FoodEntry[];
}

export interface DayLog {
  meals: Meals;
  water: number;
}

export interface UserProfile {
  name: string;
  email: string;
  dailyGoal: number;
  dailyWaterGoal?: number;
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
}
