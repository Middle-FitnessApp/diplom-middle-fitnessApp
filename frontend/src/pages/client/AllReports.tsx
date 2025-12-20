import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagination, Typography, Empty, Spin, Segmented } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useGetClientReportsQuery } from '../../store/api/progress.api'
import { PERIOD_OPTIONS, type PeriodValue } from '../../utils/progressFunctions.ts'
import { ApiErrorState } from '../../components/errors'
import { useAppSelector } from '../../store/hooks'
import { ReportCard } from '../../components'

const { Title } = Typography

export const AllReports: FC = () => {
	const navigate = useNavigate()
	const [page, setPage] = useState(1)
	const [period, setPeriod] = useState<PeriodValue>('all')
	const pageSize = 5
	const theme = useAppSelector((state) => state.ui.theme)
	const isDark = theme === 'dark'

	// Динамические классы для темы
	const cardBgClass = isDark ? 'bg-slate-800' : 'bg-light'
	const borderClass = isDark ? 'border-slate-700' : 'border-gray-200'
	const titleClass = isDark ? 'text-slate-100' : 'text-gray-800'
	const periodOptions = PERIOD_OPTIONS
	const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(new Set())

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

		if (period === 'month') {
			from.setMonth(now.getMonth() - 1)
		} else if (period === 'year') {
			from.setFullYear(now.getFullYear() - 1)
		}

		from.setHours(0, 0, 0, 0)
		now.setHours(23, 59, 59, 999)
		startDateParam = computeDateParam(from)
		endDateParam = computeDateParam(now)
	}

	const {
		data: serverData,
		isLoading,
		isError,
		error,
	} = useGetClientReportsQuery({
		page,
		limit: pageSize,
		startDate: startDateParam,
		endDate: endDateParam,
	})

	const reports = serverData?.data ?? []
	const totalFromServer = serverData?.meta?.total ?? reports.length

	// На странице клиента используем серверную пагинацию — данные уже отфильтрованы и отсортированы на сервере
	const filteredReports = reports

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

	// Данные уже постраничные — отображаем как есть
	const paginated = filteredReports

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div
				className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} w-full max-w-[1200px]`}
			>
				<div className='flex items-center justify-between gap-4 flex-wrap mb-8'>
					<div className='flex flex-col'>
						<Title
							level={2}
							className={`${titleClass} font-semibold m-0 text-left pb-3 border-b-3 inline-block`}
							style={{ borderColor: 'var(--primary)' }}
						>
							📋 Ваши отчеты
						</Title>
					</div>

					<Segmented<PeriodValue>
						options={PERIOD_OPTIONS.map((opt) => ({
							label: opt.label,
							value: opt.value,
						}))}
						value={period}
						onChange={handlePeriodChange}
						className={
							isDark
								? '[&_.ant-segmented-item-selected]:bg-primary [&_.ant-segmented-item-selected]:text-white'
								: ''
						}
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
								total={totalFromServer}
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
