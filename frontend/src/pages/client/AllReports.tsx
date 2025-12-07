import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Pagination, Select, Typography, Spin, Alert, Empty } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import type { FC } from 'react'
import { useGetProgressReportsQuery } from '../../store/api/progress.api'
import type { ProgressReport } from '../../store/api/progress.api'

const { Title } = Typography

const periodOptions = [
	{ label: 'Месяц', value: 'month' },
	{ label: 'Год', value: 'year' },
	{ label: 'Все время', value: 'all' },
	{ label: 'Выбрать интервал', value: 'custom' },
]

export const AllReports: FC = () => {
	const navigate = useNavigate()
	const [page, setPage] = useState(1)
	const [period, setPeriod] = useState('all')
	const pageSize = 5

	// Получаем данные из RTK Query
	const { data: reports = [], isLoading, isError, error } = useGetProgressReportsQuery()

	// Форматирование даты из ISO в ДД.ММ.ГГГГ
	const formatDate = (isoDate: string): string => {
		const date = new Date(isoDate)
		const day = String(date.getDate()).padStart(2, '0')
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const year = date.getFullYear()
		return `${day}.${month}.${year}`
	}

	// Фильтрация по периоду
	// Фильтрация по периоду
	const getFilteredReports = (): ProgressReport[] => {
		if (period === 'all') return reports

		const now = new Date()
		const filterDate = new Date()

		if (period === 'month') {
			// За последние 30 дней
			filterDate.setDate(now.getDate() - 30)
		} else if (period === 'year') {
			// За последние 365 дней
			filterDate.setDate(now.getDate() - 365)
		}

		// Сбрасываем время для корректного сравнения
		filterDate.setHours(0, 0, 0, 0)

		const filtered = reports.filter((report) => {
			const reportDate = new Date(report.date)
			reportDate.setHours(0, 0, 0, 0)

			// 🔍 ВРЕМЕННЫЙ ДЕБАГ - удали потом
			console.log('🔍 Дебаг фильтрации:', {
				period,
				filterDate: filterDate.toISOString(),
				reportDate: reportDate.toISOString(),
				report_date_original: report.date,
				passed: reportDate >= filterDate,
			})

			return reportDate >= filterDate
		})

		// 🔍 ВРЕМЕННЫЙ ДЕБАГ - удали потом
		console.log('📊 Результат фильтрации:', {
			period,
			totalReports: reports.length,
			filteredReports: filtered.length,
			filterDate: filterDate.toISOString(),
		})

		return filtered
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

	// Загрузка
	if (isLoading) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card flex justify-center items-center min-h-[400px]'>
					<Spin
						indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
						tip='Загрузка отчетов...'
					/>
				</div>
			</div>
		)
	}

	// Ошибка
	if (isError) {
		const errorMessage =
			'data' in error && typeof error.data === 'object' && error.data !== null
				? (error.data as { message?: string }).message || 'Ошибка при загрузке отчетов'
				: 'Ошибка при загрузке отчетов'

		return (
			<div className='page-container gradient-bg'>
				<div className='page-card'>
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

	// Нет отчетов
	if (reports.length === 0) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card'>
					<div className='section-header'>
						<Title level={2} className='section-title'>
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

	// Основной контент
	return (
		<div className='page-container gradient-bg'>
			<div className='page-card'>
				<div className='section-header'>
					<Title level={2} className='section-title'>
						📋 Ваши отчеты
					</Title>
				</div>

				<div className='flex items-center justify-between mb-8'>
					<span className='text-lg font-semibold text-gray-700'>Период:</span>
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
							{filteredReports
								.slice((page - 1) * pageSize, page * pageSize)
								.map((report) => (
									<Card
										key={report.id}
										className='report-card cursor-pointer hover:shadow-lg transition-shadow'
										onClick={() => handleReportClick(report.id)}
									>
										<div className='flex justify-between items-center'>
											<div className='flex-1'>
												<div className='text-lg font-semibold text-gray-800 mb-2'>
													Отчет от {formatDate(report.date)}
												</div>
												<div className='grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700'>
													<div>Вес: {report.weight} кг</div>
													<div>Талия: {report.waist} см</div>
													<div>Бёдра: {report.hips} см</div>
													{report.chest && <div>Грудь: {report.chest} см</div>}
													{report.leg && <div>Нога: {report.leg} см</div>}
													{report.arm && <div>Рука: {report.arm} см</div>}
												</div>
											</div>
											<div className='flex-shrink-0 ml-4'>
												{report.photoFront ? (
													<img
														src={report.photoFront}
														alt='Фото отчета'
														className='w-20 h-20 object-cover rounded-full border-2 border-gray-200'
													/>
												) : (
													<div className='w-20 h-20 flex items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100'>
														<span className='text-2xl text-gray-400'>📊</span>
													</div>
												)}
											</div>
										</div>
									</Card>
								))}
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
