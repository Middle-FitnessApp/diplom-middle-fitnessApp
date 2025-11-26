import jwt from 'jsonwebtoken'
import { prisma } from '../prisma.js'
import { randomUUID } from 'crypto'
import { ACCESS_EXPIRES, REFRESH_EXPIRES_DAYS } from 'consts/token.js'

export function generateAccessToken(userId: string, refreshTokenId: string) {
	return jwt.sign(
		{ user: { id: userId }, refreshTokenId },
		process.env.JWT_ACCESS_SECRET as string,
		{ expiresIn: ACCESS_EXPIRES },
	)
}

export async function generateRefreshToken(userId: string) {
	const token = randomUUID()
	const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000)

	const createdToken = await prisma.refreshToken.create({
		data: { token, userId, expiresAt },
	})

	return { token: createdToken.token, id: createdToken.id }
}

export function verifyAccessToken(token: string) {
	return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as {
		user: { id: string }
		refreshTokenId: string
	}
}

export async function deleteRefreshToken(token: string) {
	await prisma.refreshToken.deleteMany({
		where: { token },
	})
}
