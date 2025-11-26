import { useState } from 'react'
import { Card, Pagination, Select } from 'antd'
import type { FC } from 'react'
import 'antd/dist/reset.css'
import type { ReportType } from '../../types'
import Title from 'antd/es/skeleton/Title'

const periodOptions = [
	{ label: 'Месяц', value: 'month' },
	{ label: 'Год', value: 'year' },
	{ label: 'Все время', value: 'all' },
	{ label: 'Выбрать интервал', value: 'custom' },
]

const reportsMock: ReportType[] = Array.from({ length: 12 }, (_, index) => ({
	id: String(index + 1),
	date: '15.04.2024',
	weight: 74,
	waist: 81,
	chest: 80,
	hips: 74,
	leg: 70,
	arm: 40,
	photoUrl: undefined,
}))

export const AllReports: FC = () => {
	const [page, setPage] = useState(1)
	const [period, setPeriod] = useState('month')
	const pageSize = 5

	const filteredReports = reportsMock

	const handlePeriodChange = (value: string) => {
		setPeriod(value)
		setPage(1)
	}

	const handlePageChange = (value: number) => setPage(value)

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

				<div className='space-y-4 mb-8'>
					{filteredReports.slice((page - 1) * pageSize, page * pageSize).map((report) => (
						<Card
							key={report.id}
							className='report-card'
							onClick={() => (window.location.href = `/me/progress/reports/${report.id}`)}
						>
							<div className='flex justify-between items-center'>
								<div>
									<div className='text-lg font-semibold text-gray-800 mb-2'>
										Отчет от {report.date}
									</div>
									<div className='grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700'>
										<div>Вес: {report.weight} кг</div>
										<div>Талия: {report.waist} см</div>
										<div>Грудь: {report.chest} см</div>
										<div>Бёдра: {report.hips} см</div>
										<div>Нога: {report.leg} см</div>
										<div>Рука: {report.arm} см</div>
									</div>
								</div>
								<div className='flex-shrink-0'>
									{report.photoUrl ? (
										<img
											src={report.photoUrl}
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
			</div>
		</div>
	)
}
