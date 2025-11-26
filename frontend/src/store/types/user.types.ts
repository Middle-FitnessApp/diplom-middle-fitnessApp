export interface UserProfile {
  id: string;
  userId: string;
  age: number;
  weight: number;
  height: number;
  waistCircumference?: number;
  chestCircumference?: number;
  hipCircumference?: number;
  armCircumference?: number;
  legCircumference?: number;
  goal: string;
  expectedResult: string;
  contraindications: string;
  diseases: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  currentDiet: string;
  photos: string[]; // URLs to front, side, back photos
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
  weight: number;
  waistCircumference?: number;
  chestCircumference?: number;
  hipCircumference?: number;
  armCircumference?: number;
  legCircumference?: number;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  measurements: BodyMeasurement;
  notes?: string;
  photos?: string[];
}