// Будем дополнять по мере развития бэкенда
export interface UserProfile {
  id: string
  userId: string
  // Добавим поля когда бэкенд начнет возвращать профиль
}

export interface BodyMeasurement {
  id: string
  userId: string
  date: string
  weight: number
  waistCircumference?: number
  chestCircumference?: number
  hipCircumference?: number
  armCircumference?: number
  legCircumference?: number
}