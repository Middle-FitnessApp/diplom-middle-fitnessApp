import { FastifyReply } from 'fastify'

export function setRefreshCookie(reply: FastifyReply, token: string, maxAge: number) {
	reply.setCookie('refreshToken', token, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		maxAge,
		// secure: process.env.NODE_ENV === 'production',
	})
}

export function removeRefreshCookie(reply: FastifyReply) {
	reply.clearCookie('refreshToken', {
		path: '/',
		httpOnly: true,
		// secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
	})
}
