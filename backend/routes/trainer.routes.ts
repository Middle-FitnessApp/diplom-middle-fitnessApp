import type { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard.js'
import { hasRole } from '../middleware/hasRole.js'
import {
	getAllTrainers,
	getTrainerById,
	getClientsForTrainer,
	toggleClientFavorite,
	getTrainerInvites,
	acceptInvite,
	rejectInvite,
	getClientProfileForTrainer,
	assignMealPlanToClient,
} from '../controllers/trainer.js'
import { ApiError } from '../utils/ApiError.js'
import { GetInvitesSchema } from '../validation/zod/trainer/get-invites.dto.js'
import { GetClientsSchema } from '../validation/zod/trainer/get-clients.dto.js'
import { AcceptInviteParamsSchema } from '../validation/zod/trainer/accept-invite.dto.js'
import { RejectInviteParamsSchema } from '../validation/zod/trainer/reject-invite.dto.js'
import { GetClientProfileParamsSchema } from '../validation/zod/trainer/get-client-profile.dto.js'
import { ToggleFavoriteParamsSchema } from '../validation/zod/trainer/toggle-favorite.dto.js'
import {
	AssignMealPlanBodySchema,
	AssignMealPlanParamsSchema,
} from '../validation/zod/trainer/assign-meal-plan.dto.js'

export default async function trainerRoutes(app: FastifyInstance) {
	// Публичный эндпоинт с опциональной авторизацией - просмотр всех тренеров
	// Для авторизованного клиента возвращает также статусы приглашений
	app.get(
		'/all',
		{
			preValidation: async (req) => {
				try {
					await authGuard(req)
				} catch {
					// Игнорируем ошибки авторизации - эндпоинт публичный
				}
			},
		},
		async (req, reply) => {
			// Если пользователь авторизован и это клиент - передаем его ID
			const clientId = req.user?.role === 'CLIENT' ? req.user.id : undefined
			const trainers = await getAllTrainers(clientId)
			return reply.status(200).send({ trainers })
		},
	)

	// Получение приглашений для тренера (должен быть ДО /:id чтобы не конфликтовать)
	app.get(
		'/invites',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		async (req, reply) => {
			const { status, page, limit } = GetInvitesSchema.parse(req.query)

			const invites = await getTrainerInvites(req.user.id, status, page, limit)

			return reply.status(200).send({ invites })
		},
	)

	// Принятие приглашения от клиента
	app.post(
		'/invites/:id/accept',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		async (req, reply) => {
			const { id } = AcceptInviteParamsSchema.parse(req.params)

			const client = await acceptInvite(req.user.id, id)

			return reply.status(200).send({
				message: 'Вы приняли клиента в работу',
				client,
			})
		},
	)

	// Отклонение приглашения от клиента
	app.post(
		'/invites/:id/reject',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		async (req, reply) => {
			const { id } = RejectInviteParamsSchema.parse(req.params)

			const result = await rejectInvite(req.user.id, id)

			return reply.status(200).send(result)
		},
	)

	// список клиентов тренера в работе (должен быть ДО /:id чтобы не конфликтовать)
	app.get(
		'/clients',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		async (req, reply) => {
			const { favorites, search, page, limit } = GetClientsSchema.parse(req.query)

			const clients = await getClientsForTrainer(
				req.user.id,
				favorites,
				search,
				page,
				limit,
			)

			return reply.status(200).send({ clients })
		},
	)

	// Просмотр полного профиля клиента тренером
	app.get(
		'/clients/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		async (req, reply) => {
			const { id } = GetClientProfileParamsSchema.parse(req.params)

			const clientProfile = await getClientProfileForTrainer(req.user.id, id)

			return reply.status(200).send(clientProfile)
		},
	)

	// Публичный эндпоинт с опциональной авторизацией
	// Используем authGuard как preValidation (не блокирует если нет токена)
	app.get(
		'/:id',
		{
			preValidation: async (req, reply) => {
				try {
					await authGuard(req)
				} catch {
					// Игнорируем ошибки авторизации - эндпоинт публичный
				}
			},
		},
		async (req, reply) => {
			const { id } = req.params as { id: string }

			// Если пользователь авторизован и это клиент - передаем его ID
			const clientId = req.user?.role === 'CLIENT' ? req.user.id : undefined

			const trainer = await getTrainerById(id, clientId)

			if (!trainer) {
				throw ApiError.notFound('Тренер не найден')
			}

			return reply.status(200).send({ trainer })
		},
	)

	// Добавление/удаление клиента в избранное
	app.put(
		'/clients/:id/favorite',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		async (req, reply) => {
			const { id } = ToggleFavoriteParamsSchema.parse(req.params)

			const result = await toggleClientFavorite(req.user.id, id)

			return reply.status(200).send(result)
		},
	)

	// Назначение плана питания клиенту
	app.post(
		'/clients/:id/nutrition',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		async (req, reply) => {
			const { id } = AssignMealPlanParamsSchema.parse(req.params)
			const { subcategoryId, dayIds } = AssignMealPlanBodySchema.parse(req.body)

			const assignedPlan = await assignMealPlanToClient(
				req.user.id,
				id,
				subcategoryId,
				dayIds,
			)

			return reply.status(201).send({
				message: 'План питания успешно назначен клиенту',
				plan: assignedPlan,
			})
		},
	)
}
