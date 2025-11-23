import type { BodyMeasurement } from "./user.types";

export interface ProgressComment {
  id: string;
  progressEntryId: string;
  trainerId: string;
  trainerName: string;
  comment: string;
  createdAt: string;
}

export interface ProgressReport {
  id: string;
  userId: string;
  date: string;
  measurements: BodyMeasurement;
  photos: string[];
  notes?: string;
  comments: ProgressComment[];
}

export interface ProgressChartData {
  date: string;
  weight: number;
  waistCircumference?: number;
  chestCircumference?: number;
}