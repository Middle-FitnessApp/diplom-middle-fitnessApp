import { prisma } from '../prisma.js'
import { ApiError } from '../utils/ApiError.js'

import { generateAccessToken, generateRefreshToken } from './token.service.js'

export async function refreshTokenService({ refreshToken }: { refreshToken: string }) {
	const tokenRecord = await prisma.refreshToken.findUnique({
		where: { token: refreshToken },
		include: { user: true },
	})

	if (!tokenRecord) {
		throw ApiError.unauthorized('Неверный или устаревший refresh token')
	}

	const user = tokenRecord.user

	// удаляем старый refresh token
	await prisma.refreshToken.delete({
		where: { token: refreshToken },
	})

	// генерируем новые токены
	const refreshTokenData = await generateRefreshToken(user.id)
	const accessToken = generateAccessToken(user.id, refreshTokenData.id)

	return {
		token: {
			accessToken,
			refreshToken: refreshTokenData.token,
		},
		user: {
			role: user.role,
		},
	}
}
