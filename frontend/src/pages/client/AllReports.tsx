import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Card,
	Pagination,
	Select,
	Typography,
	Spin,
	Alert,
	Empty,
	Tag,
	Space,
} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import type { FC } from 'react'
import {
	useGetProgressReportsQuery,
	type ProgressReport,
} from '../../store/api/progress.api'
import { useAppSelector } from '../../store/hooks'

const { Title, Text } = Typography

const periodOptions = [
	{ label: 'Месяц', value: 'month' },
	{ label: 'Год', value: 'year' },
	{ label: 'Все время', value: 'all' },
]

type MetricKey = 'weight' | 'waist' | 'hips'

interface MetricDiff {
	key: MetricKey
	label: string
	value: number
	diff: number | null
}

const computeDiffs = (current: ProgressReport, prev?: ProgressReport): MetricDiff[] => {
	const keys: Array<{ key: MetricKey; label: string }> = [
		{ key: 'weight', label: 'Вес' },
		{ key: 'waist', label: 'Талия' },
		{ key: 'hips', label: 'Бёдра' },
	]

	return keys.map(({ key, label }) => {
		const value = current[key]
		const prevValue = prev ? prev[key] : undefined

		if (prevValue == null || value == null) {
			return { key, label, value, diff: null }
		}

		const diff = Number((value - prevValue).toFixed(1))
		return { key, label, value, diff }
	})
}

const formatDate = (isoDate: string): string => {
	const date = new Date(isoDate)
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	return `${day}.${month}.${year}`
}

export const AllReports: FC = () => {
	const navigate = useNavigate()
	const [page, setPage] = useState(1)
	const [period, setPeriod] = useState('all')
	const pageSize = 5
	const theme = useAppSelector((state) => state.ui.theme)
	const isDark = theme === 'dark'

	// Динамические классы для темы
	const cardBgClass = isDark ? 'bg-slate-800' : 'bg-light'
	const borderClass = isDark ? 'border-slate-700' : 'border-gray-200'
	const titleClass = isDark ? 'text-slate-100' : 'text-gray-800'
	const textClass = isDark ? 'text-slate-300' : 'text-gray-700'
	const textMutedClass = isDark ? 'text-slate-400' : 'text-gray-600'

	// id отчётов, для которых загрузка фото уже провалилась
	const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(new Set())

	const { data: reports = [], isLoading, isError, error } = useGetProgressReportsQuery()

	const sortedReports = useMemo(
		() =>
			[...reports].sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
			),
		[reports],
	)

	const getFilteredReports = (): ProgressReport[] => {
		if (period === 'all') return sortedReports

		const now = new Date()
		const filterDate = new Date()

		if (period === 'month') {
			filterDate.setDate(now.getDate() - 30)
		} else if (period === 'year') {
			filterDate.setDate(now.getDate() - 365)
		}

		filterDate.setHours(0, 0, 0, 0)

		return sortedReports.filter((report) => {
			const reportDate = new Date(report.date)
			reportDate.setHours(0, 0, 0, 0)
			return reportDate >= filterDate
		})
	}

	const filteredReports = getFilteredReports()

	const handlePeriodChange = (value: string): void => {
		setPeriod(value)
		setPage(1)
	}

	const handlePageChange = (value: number): void => setPage(value)

	const handleReportClick = (reportId: string): void => {
		navigate(`/me/progress/reports/${reportId}`)
	}

	const handlePhotoError = (reportId: string): void => {
		setFailedPhotoIds((prev) => new Set(prev).add(reportId))
	}

	if (isLoading) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} w-full max-w-[1200px] flex justify-center items-center min-h-[400px]`}>
					<Spin
						indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
						tip='Загрузка отчетов...'
					/>
				</div>
			</div>
		)
	}

	if (isError) {
		const errorMessage =
			'data' in error && typeof error.data === 'object' && error.data !== null
				? (error.data as { message?: string }).message || 'Ошибка при загрузке отчетов'
				: 'Ошибка при загрузке отчетов'

		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} w-full max-w-[1200px]`}>
					<Alert
						message='Ошибка загрузки'
						description={errorMessage}
						type='error'
						showIcon
					/>
				</div>
			</div>
		)
	}

	if (reports.length === 0) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} w-full max-w-[1200px]`}>
					<div className='text-center mb-8'>
						<Title level={2} className={`${titleClass} font-semibold mb-4 pb-3 border-b-3 inline-block`} style={{ borderColor: 'var(--primary)' }}>
							📋 Ваши отчеты
						</Title>
					</div>
					<Empty
						description='У вас пока нет отчетов о прогрессе'
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				</div>
			</div>
		)
	}

	const paginated = filteredReports.slice((page - 1) * pageSize, page * pageSize)

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} w-full max-w-[1200px]`}>
				<div className='text-center mb-8'>
					<Title level={2} className={`${titleClass} font-semibold mb-4 pb-3 border-b-3 inline-block`} style={{ borderColor: 'var(--primary)' }}>
						📋 Ваши отчеты
					</Title>
				</div>

				<div className='flex items-center justify-between mb-8'>
					<span className={`text-lg font-semibold ${textClass}`}>Период:</span>
					<Select
						options={periodOptions}
						value={period}
						onChange={handlePeriodChange}
						className='w-48'
						size='large'
					/>
				</div>

				{filteredReports.length === 0 ? (
					<Empty
						description={`Нет отчетов за выбранный период: ${periodOptions.find((opt) => opt.value === period)?.label
							}`}
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				) : (
					<>
						<div className='space-y-4 mb-8'>
							{paginated.map((report, indexInPage) => {
								const globalIndex = (page - 1) * pageSize + indexInPage
								const prev =
									globalIndex > 0 ? filteredReports[globalIndex - 1] : undefined
								const diffs = computeDiffs(report, prev)
								const shouldShowPhoto =
									!!report.photoFront && !failedPhotoIds.has(report.id)

								return (
									<Card
										key={report.id}
										style={{ marginBottom: 8 }}
										className='report-card cursor-pointer hover:shadow-lg transition-shadow mb-4'
										onClick={() => handleReportClick(report.id)}
									>
										<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
											<div className='flex-1'>
												<div className={`text-lg font-semibold ${titleClass} mb-2`}>
													Отчет от {formatDate(report.date)}
												</div>
												<div className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${textClass}`}>
													<div>Вес: {report.weight} кг</div>
													<div>Талия: {report.waist} см</div>
													<div>Бёдра: {report.hips} см</div>
													{report.chest && <div>Грудь: {report.chest} см</div>}
													{report.leg && <div>Нога: {report.leg} см</div>}
													{report.arm && <div>Рука: {report.arm} см</div>}
												</div>
											</div>

											<div className='flex flex-col items-start md:items-end gap-2'>
												<Text className={`${textMutedClass} text-sm`}>
													Изменения относительно предыдущего отчёта
												</Text>
												<Space direction='vertical' size={4}>
													{diffs.map(({ key, label, diff }) => {
														if (diff === null) {
															return (
																<Text key={key} type='secondary' className='text-xs'>
																	{label}: нет данных для сравнения
																</Text>
															)
														}

														if (diff === 0) {
															return (
																<Tag key={key} className='text-xs'>
																	{label}: 0 (без изменений)
																</Tag>
															)
														}

														const isIncrease = diff > 0
														const color = isIncrease ? 'red' : 'green'
														const sign = diff > 0 ? '+' : ''

														return (
															<Tag key={key} color={color} className='text-xs'>
																{label}: {sign}
																{diff}
															</Tag>
														)
													})}
												</Space>
											</div>

											{shouldShowPhoto && (
												<div
													className='flex-shrink-0 md:ml-4'
													onClick={(e) => e.stopPropagation()}
												>
													<img
														src={report.photoFront}
														alt='Фото отчета'
														className={`w-20 h-20 object-cover rounded-full border-2 ${isDark ? 'border-slate-600' : 'border-gray-200'}`}
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
								total={filteredReports.length}
								onChange={handlePageChange}
								showSizeChanger={false}
								className='[&_.ant-pagination-item]:rounded-lg [&_.ant-pagination-item]:border-gray-300'
							/>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
