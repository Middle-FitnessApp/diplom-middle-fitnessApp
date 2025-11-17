import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export type FastifyContext = {
  fastify: FastifyInstance
  req: FastifyRequest
  reply: FastifyReply
}
