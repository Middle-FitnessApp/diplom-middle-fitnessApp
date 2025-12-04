import { prisma } from '../prisma.js'

export async function getClientNutritionPlan(clientId: string) {
	// Находим последнее назначение плана для клиента
	const assignment = await prisma.clientNutritionPlan.findFirst({
		where: { clientId },
		orderBy: { createdAt: 'desc' },
	})

	if (!assignment) {
		return []
	}

	const { subcatId, dayIds } = assignment

	const days = await prisma.nutritionDay.findMany({
		where: dayIds.length ? { id: { in: dayIds } } : { subcatId },
		orderBy: { dayOrder: 'asc' },
		include: {
			meals: {
				orderBy: { mealOrder: 'asc' },
			},
		},
	})

	return days
}
