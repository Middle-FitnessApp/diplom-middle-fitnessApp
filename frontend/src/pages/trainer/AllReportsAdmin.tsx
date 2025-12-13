import { useState, type FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Pagination, Select, Typography, Empty, Tag, Space } from 'antd'
import {
	useGetTrainerClientReportsQuery,
	type ProgressReport,
} from '../../store/api/progress.api.ts'
import { skipToken } from '@reduxjs/toolkit/query'
import {
	formatDate,
	computeDiffs,
	PERIOD_OPTIONS,
} from '../../utils/progressFunctions.ts'
import { ApiErrorState } from '../../components/errors'
import { LoadingState } from '../../components'
import { useThemeClasses } from '../../hooks/useThemeClasses'
import { API_BASE_URL } from '../../config/api.config'

const { Title, Text } = Typography

export const AllReportsAdmin: FC = () => {
	const navigate = useNavigate()
	const { clientId } = useParams<{ clientId: string }>()
	const [page, setPage] = useState(1)
	const [period, setPeriod] = useState('all')
	const pageSize = 5
	const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(new Set())
	const classes = useThemeClasses()

	const { data, isLoading, isError, error } = useGetTrainerClientReportsQuery(
		clientId ? { clientId, page, limit: pageSize } : skipToken,
	)

	const reports = data?.data ?? []
	const periodOptions = PERIOD_OPTIONS

	const getFilteredReports = (): ProgressReport[] => {
		if (period === 'all') return reports

		const now = new Date()
		const filterDate = new Date()

		if (period === 'month') {
			filterDate.setDate(now.getDate() - 30)
		} else if (period === 'year') {
			filterDate.setDate(now.getDate() - 365)
		}

		filterDate.setHours(0, 0, 0, 0)

		return reports.filter((report) => {
			const reportDate = new Date(report.date)
			reportDate.setHours(0, 0, 0, 0)
			return reportDate >= filterDate
		})
	}

	const filteredReports = getFilteredReports()
	const paginated = filteredReports.slice((page - 1) * pageSize, page * pageSize)

	const handlePeriodChange = (value: string) => {
		setPeriod(value)
		setPage(1)
	}

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
					error={{ status: 400, data: { error: { message: 'ID клиента не указан или указан неверно', statusCode: 400 } } }}
					title='Ошибка загрузки'
				/>
			</div>
		)
	}

	if (isLoading) {
		return <LoadingState message='Загрузка отчетов клиента...' />
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
			<div className='gradient-bg p-6'>
				<div className='section-header'>
					<Title
						level={2}
						className='section-title border-b-3 border-primary inline-block pb-3 mb-8'
					>
						📋 Отчёты клиента
					</Title>
				</div>
				<Empty description='Отчетов пока нет' />
			</div>
		)
	}

	return (
		<div
			className={` ${classes.cardBg} min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start`}
		>
			<div
				className={`rounded-2xl p-10 shadow-xl ${classes.border} w-full max-w-[1200px]`}
			>
				<div className='section-header'>
					<Title
						level={2}
						className={`section-title border-b-3 border-primary inline-block pb-3 mb-8 ${classes.title}`}
					>
						📋 Отчёты клиента
					</Title>
				</div>

				<div className={`flex items-center justify-between mb-8 ${classes.textLight}`}>
					<div>
						<span className={`text-lg font-semibold ${classes.textLight}`}>Период:</span>
						<p className='mt-2 md:hidden'>
							(на мобильных устройствах фильтрация по периоду недоступна)
						</p>
					</div>
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
					/>
				) : (
					<>
						<div className='space-y-4 mb-8'>
							{paginated.map((report, idx) => {
								const globalIdx = (page - 1) * pageSize + idx
								const prev = globalIdx > 0 ? filteredReports[globalIdx - 1] : undefined
								const diffs = computeDiffs(report, prev)
								const showPhoto = !!report.photoFront && !failedPhotoIds.has(report.id)

								return (
									<Card
										key={report.id}
										style={{ marginBottom: 8 }}
										className='report-card cursor-pointer hover:shadow-lg transition-shadow mb-4'
										onClick={() => handleReportClick(report.id)}
									>
										<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
											<div className='flex-1'>
												<div
													className={`text-lg font-semibold ${classes.textLight} mb-2`}
												>
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
														src={`${API_BASE_URL}${report.photoFront}`}
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
								total={filteredReports.length}
								onChange={setPage}
								showSizeChanger={false}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
