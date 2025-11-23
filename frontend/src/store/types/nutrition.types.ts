export interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string; // "08:00", "13:00" etc
}

export interface NutritionPlan {
  id: string;
  trainerId: string;
  name: string;
  description: string;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
  dailyCalories: number;
  meals: Meal[];
  created_at: string;
}

export interface AssignedNutritionPlan {
  id: string;
  clientId: string;
  planId: string;
  startDate: string;
  endDate?: string;
  plan: NutritionPlan;
}