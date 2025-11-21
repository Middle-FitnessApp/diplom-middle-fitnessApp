import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export type FastifyContext = {
  fastify: FastifyInstance
  req: FastifyRequest
  reply: FastifyReply
}

import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string
      role: 'CLIENT' | 'TRAINER'
    }
  }
}
