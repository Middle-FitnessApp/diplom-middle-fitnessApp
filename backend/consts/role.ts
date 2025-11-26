import type { UserRole } from '@prisma/client'

// Константы для ролей пользователей
// Используют тип из Prisma для типобезопасности
export const CLIENT: UserRole = 'CLIENT'
export const TRAINER: UserRole = 'TRAINER'

// Массив всех доступных ролей для валидации
export const ALL_ROLES: UserRole[] = [CLIENT, TRAINER]
