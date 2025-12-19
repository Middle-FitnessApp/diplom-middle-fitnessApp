import { useState, useMemo, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagination, Select, Typography, Empty, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useGetProgressReportsQuery } from '../../store/api/progress.api'
import type { ProgressReport } from '../../store/types/progress.types'
import { PERIOD_OPTIONS } from '../../utils/progressFunctions.ts'
import { ApiErrorState } from '../../components/errors'
import { useAppSelector } from '../../store/hooks'
import { ReportCard } from '../../components'

const { Title } = Typography

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
	const periodOptions = PERIOD_OPTIONS
	const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(new Set())

	const { data: reports = [], isLoading, isError, error } = useGetProgressReportsQuery()

	const sortedReports = useMemo(
		() =>
			[...reports].sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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
				<div
					className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} w-full max-w-[1200px] flex justify-center items-center min-h-[400px]`}
				>
					<Spin
						indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
						tip='Загрузка отчетов...'
					/>
				</div>
			</div>
		)
	}

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

	if (reports.length === 0) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div
					className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} w-full max-w-[1200px]`}
				>
					<div className='text-center mb-8'>
						<Title
							level={2}
							className={`${titleClass} font-semibold mb-4 pb-3 border-b-3 inline-block`}
							style={{ borderColor: 'var(--primary)' }}
						>
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
			<div
				className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} w-full max-w-[1200px]`}
			>
				<div className='text-center mb-8'>
					<Title
						level={2}
						className={`${titleClass} font-semibold mb-4 pb-3 border-b-3 inline-block`}
						style={{ borderColor: 'var(--primary)' }}
					>
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
						description={`Нет отчетов за выбранный период: ${
							periodOptions.find((opt) => opt.value === period)?.label
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

								return (
									<ReportCard
										key={report.id}
										report={report}
										prevReport={prev}
										onClick={handleReportClick}
										onPhotoError={handlePhotoError}
										failedPhotoIds={failedPhotoIds}
										isDark={isDark}
									/>
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
