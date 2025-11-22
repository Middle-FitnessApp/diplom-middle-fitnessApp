import { FastifyReply } from 'fastify'

export function setRefreshCookie(reply: FastifyReply, token: string, maxAge: number) {
	reply.setCookie('refreshToken', token, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		maxAge,
		// secure: process.env.NODE_ENV === 'production', // добавишь позже
	})
}
