import { useState, type FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Pagination, Typography, Empty, Tag, Space } from 'antd'
import { useGetTrainerClientReportsQuery } from '../../store/api/progress.api.ts'
import { skipToken } from '@reduxjs/toolkit/query'
import {
	formatDate,
	computeDiffs,
	PERIOD_OPTIONS,
	type PeriodValue,
} from '../../utils/progressFunctions.ts'
import { ApiErrorState } from '../../components/errors'
import { LoadingState } from '../../components'
import { useThemeClasses } from '../../hooks/useThemeClasses'
import { getPhotoUrl } from '../../utils/buildPhotoUrl'

const { Title, Text } = Typography

export const AllReportsAdmin: FC = () => {
	const navigate = useNavigate()
	const { clientId } = useParams<{ clientId: string }>()
	const [page, setPage] = useState(1)
	const [period] = useState<PeriodValue>('all')
	const pageSize = 5
	const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(new Set())
	const classes = useThemeClasses()

	// Вычисляем параметры startDate/endDate для сервера в формате DD/MM/YYYY
	const computeDateParam = (d: Date) => {
		const day = String(d.getDate()).padStart(2, '0')
		const month = String(d.getMonth() + 1).padStart(2, '0')
		const year = d.getFullYear()
		return `${day}/${month}/${year}`
	}

	let startDateParam: string | undefined = undefined
	let endDateParam: string | undefined = undefined
	if (period !== 'all') {
		const now = new Date()
		const from = new Date()

		// Для 'month' берём последний календарный месяц: от той же даты прошлого месяца
		if (period === 'month') {
			from.setMonth(now.getMonth() - 1)
		} else if (period === 'year') {
			// Для 'year' — последний календарный год
			from.setFullYear(now.getFullYear() - 1)
		}

		// Нормализуем границы: с начала дня у from и до конца сегодняшнего дня у now
		from.setHours(0, 0, 0, 0)
		now.setHours(23, 59, 59, 999)
		startDateParam = computeDateParam(from)
		endDateParam = computeDateParam(now)
	}

	const { data, isLoading, isFetching, isError, error } = useGetTrainerClientReportsQuery(
		clientId
			? {
					clientId,
					page,
					limit: pageSize,
					startDate: startDateParam,
					endDate: endDateParam,
			  }
			: skipToken,
	)

	const reports = data?.data ?? []
	const totalFromServer = data?.meta?.total ?? reports.length
	const periodOptions = PERIOD_OPTIONS

	const handleReportClick = (reportId: string) => {
		navigate(`/admin/progress/${clientId}/reports/${reportId}`)
	}

	const handlePhotoError = (reportId: string) => {
		setFailedPhotoIds((prev) => new Set(prev).add(reportId))
	}

	if (!clientId) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10'>
				<ApiErrorState
					error={{
						status: 400,
						data: {
							error: {
								message: 'ID клиента не указан или указан неверно',
								statusCode: 400,
							},
						},
					}}
					title='Ошибка загрузки'
				/>
			</div>
		)
	}

	// Обрабатываем ошибки отдельно
	if (isError || error) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10'>
				<ApiErrorState
					error={error}
					title='Ошибка загрузки'
					message='Не удалось загрузить отчеты'
				/>
			</div>
		)
	}

	// Единый возврат JSX: заголовок страницы + содержимое (лоадер / пустой список / список отчетов)
	return (
		<div className='gradient-bg p-6'>
			<div className='section-header'>
				<Title
					level={2}
					className='section-title border-b-3 border-primary inline-block pb-3 mb-8'
				>
					📋 Отчёты клиента
				</Title>
			</div>

			{isLoading || (isFetching && data?.meta?.page !== page) ? (
				<LoadingState
					inline
					theme='dark'
					message={isLoading ? 'Загрузка отчетов клиента...' : 'Загрузка страницы...'}
				/>
			) : reports.length === 0 ? (
				<Empty
					description={`Нет отчетов за выбранный период: ${
						periodOptions.find((opt) => opt.value === period)?.label
					}`}
				/>
			) : (
				<>
					<div className='space-y-4 mb-8'>
						{reports.map((report, idx) => {
							const globalIdx = (page - 1) * pageSize + idx
							const prev = globalIdx > 0 ? reports[globalIdx - 1] : undefined
							const diffs = computeDiffs(report, prev)
							const imageSrc = getPhotoUrl(report.photoFront)
							const showPhoto = !!imageSrc && !failedPhotoIds.has(report.id)

							return (
								<Card
									key={report.id}
									style={{ marginBottom: 8 }}
									className='report-card cursor-pointer hover:shadow-lg transition-shadow mb-4'
									onClick={() => handleReportClick(report.id)}
								>
									<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
										<div className='flex-1'>
											<div className={`text-lg font-semibold ${classes.textLight} mb-2`}>
												Отчёт от {formatDate(report.date)}
											</div>
											<div
												className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${classes.textLight}`}
											>
												<div>Вес: {report.weight} кг</div>
												<div>Талия: {report.waist} см</div>
												<div>Бёдра: {report.hips} см</div>
												{report.chest && <div>Грудь: {report.chest} см</div>}
												{report.arm && <div>Рука: {report.arm} см</div>}
												{report.leg && <div>Нога: {report.leg} см</div>}
											</div>
										</div>

										<div className='flex flex-col items-start md:items-end gap-2'>
											<Text className={` ${classes.textSecondary} text-sm`}>
												Изменения от предыдущего:
											</Text>
											<Space direction='vertical' size={4}>
												{diffs.map(({ key, label, diff }) => {
													if (diff === null) {
														return (
															<Text key={key} type='secondary' className='text-xs'>
																{label}: —
															</Text>
														)
													}
													const isWeight = key === 'weight'
													const isIncrease = diff > 0
													const color = isWeight
														? isIncrease
															? 'red'
															: 'green'
														: isIncrease
														? 'green'
														: 'red'
													return (
														<Tag key={key} color={color} className='text-xs'>
															{label}: {diff > 0 ? '+' : ''}
															{diff}
														</Tag>
													)
												})}
											</Space>
										</div>

										{showPhoto && (
											<div className={`md:ml-4`} onClick={(e) => e.stopPropagation()}>
												<img
													src={imageSrc}
													alt={`${report.date} - Фото спереди`}
													className='w-20 h-20 object-cover rounded-full border'
													onError={() => handlePhotoError(report.id)}
												/>
											</div>
										)}
									</div>
								</Card>
							)
						})}
					</div>

					<div className='flex justify-center'>
						<Pagination
							current={page}
							pageSize={pageSize}
							total={totalFromServer}
							onChange={setPage}
							showSizeChanger={false}
						/>
					</div>
				</>
			)}
		</div>
	)
}
