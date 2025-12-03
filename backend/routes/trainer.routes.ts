// backend/routes/trainer.routes.ts
import type { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard.js'
import { hasRole } from '../middleware/hasRole.js'
import { getClientsForTrainer } from 'services/trainer.service.js'
// сюда импортни сервис, который вернёт клиентов тренера


export default async function trainerRoutes(app: FastifyInstance) {
  // список клиентов тренера
  app.get(
    '/clients',
    { preHandler: [authGuard, hasRole(['TRAINER'])] },
    async (req, reply) => {
      // тренер уже есть в req.user после authGuard
      const trainerId = req.user.id
      const clients = await getClientsForTrainer(trainerId)

      return reply.status(200).send({ clients })
    },
  )
}
