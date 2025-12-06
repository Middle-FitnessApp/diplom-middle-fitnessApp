import { z } from 'zod'

// Схема для сравнения параметров прогресса
export const GetComparisonQuerySchema = z.object({
	// ID начального отчета (опционально - если не указан, берется первый)
	startReportId: z.string().min(10, 'Некорректный ID начального отчета').optional(),
	// ID конечного отчета (опционально - если не указан, берется последний)
	endReportId: z.string().min(10, 'Некорректный ID конечного отчета').optional(),
})

export type GetComparisonQueryDTO = z.infer<typeof GetComparisonQuerySchema>
