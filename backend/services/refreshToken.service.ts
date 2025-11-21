import { prisma } from '../prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { RefreshBody } from 'types/auth.js'
import { generateAccessToken, generateRefreshToken } from './token.service.js'

export async function refreshTokenService({ refreshToken }: RefreshBody) {
	const tokenRecord = await prisma.refreshToken.findUnique({
		where: { token: refreshToken },
		include: { user: true },
	})

	if (!tokenRecord) {
		throw ApiError.unauthorized('Неверный или устаревший refresh token')
	}

	const user = tokenRecord.user

	// генерируем новые токены
	const accessToken = generateAccessToken(user.id)
	const newRefreshToken = await generateRefreshToken(user.id)

	// обновляем токен в базе
	await prisma.refreshToken.update({
		where: { token: refreshToken },
		data: { token: newRefreshToken },
	})

	return {
		token: {
			accessToken,
			refreshToken: newRefreshToken,
		},
		user: {
			role: user.role,
		},
	}
}
