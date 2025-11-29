import { prisma } from '../prisma.js'
import { CreateProgressDTO } from 'validation/zod/user/progress.dto.js'
import { parseDateString, checkReportExists } from 'services/progress.service.js'

/**
 * Создание нового отчета о прогрессе
 * @param userId - ID пользователя
 * @param data - Данные отчета (измерения и дата)
 * @param filesMap - Объект с путями к загруженным фотографиям
 * @returns Созданный отчет о прогрессе
 */
export async function createProgress(
	userId: string,
	data: CreateProgressDTO,
	filesMap: Record<string, string>,
) {
	// Парсим дату из формата ДД/ММ/ГГГГ
	const reportDate = parseDateString(data.date)

	// Проверяем, существует ли уже отчет за эту дату
	await checkReportExists(userId, reportDate)

	// Создаем новый отчет о прогрессе
	const progress = await prisma.progress.create({
		data: {
			userId,
			date: reportDate,
			weight: data.weight,
			height: data.height,
			waist: data.waist,
			chest: data.chest,
			hips: data.hips,
			arm: data.arm,
			leg: data.leg,
			photoFront: filesMap.photoFront,
			photoSide: filesMap.photoSide,
			photoBack: filesMap.photoBack,
		},
	})

	return progress
}
