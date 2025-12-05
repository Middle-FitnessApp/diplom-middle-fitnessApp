/**
 * Конфигурация API
 * 
 * В development: http://localhost:3000
 * В production: берётся из переменной окружения VITE_API_URL или текущий домен
 */

const isDevelopment = import.meta.env.DEV

// Базовый URL API
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isDevelopment 
  ? 'http://localhost:3000' 
  : '')

// Пути к различным API
export const API_ENDPOINTS = {
  base: `${API_BASE_URL}/api`,
  auth: `${API_BASE_URL}/api/auth`,
  user: `${API_BASE_URL}/api/user`,
  trainer: `${API_BASE_URL}/api/trainer`,
  progress: `${API_BASE_URL}/api/progress`,
  nutrition: `${API_BASE_URL}/api/nutrition`,
  chat: `${API_BASE_URL}/api/chat`,
} as const

export default API_ENDPOINTS

