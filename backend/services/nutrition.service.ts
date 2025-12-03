import { prisma } from '../prisma.js'

export async function getClientNutritionPlan(clientId: string) {
	// Находим последнее назначение плана для клиента
	const assignment = await prisma.assignedNutritionPlan.findFirst({
		where: { clientId },
		orderBy: { createdAt: 'desc' },
	})

	if (!assignment) {
		return []
	}

	const { programId, dayIds } = assignment

	const days = await prisma.programDay.findMany({
		where: dayIds.length ? { id: { in: dayIds } } : { programId },
		orderBy: { dayOrder: 'asc' },
		include: {
			meals: {
				orderBy: { mealOrder: 'asc' },
			},
		},
	})

	return days
}
