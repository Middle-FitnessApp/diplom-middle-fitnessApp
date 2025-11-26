import { FastifyRequest, FastifyReply } from 'fastify'
import type { UserRole } from '@prisma/client'

import { ApiError } from '../utils/ApiError.js'
import { ALL_ROLES } from '../consts/role.js'

export function hasRole(roles: UserRole[]) {
	return (req: FastifyRequest, res: FastifyReply, next: () => void) => {
		const userRole = req.user.role

		// Проверка, что роль валидна
		if (!ALL_ROLES.includes(userRole)) {
			throw ApiError.forbidden('Невалидная роль пользователя')
		}

		// Проверка прав доступа
		if (!roles.includes(userRole)) {
			throw ApiError.forbidden('Недостаточно прав!')
		}

		next()
	}
}
