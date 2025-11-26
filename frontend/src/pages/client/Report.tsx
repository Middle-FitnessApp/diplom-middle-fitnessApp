import type { FC } from 'react'
import 'antd/dist/reset.css'
import type { ReportType } from '../../types'
import { Card } from 'antd'
import Title from 'antd/es/skeleton/Title'

const mockReport: ReportType = {
	id: '1',
	date: '15.04.2024',
	weight: 74,
	waist: 81,
	chest: 80,
	hips: 74,
	leg: 70,
	arm: 40,
	photoUrl: undefined,
}

export const Report: FC<{ report?: ReportType }> = ({ report = mockReport }) => {
	return (
		<div className='page-container gradient-bg'>
			<div className='page-card' style={{ maxWidth: '600px' }}>
				<Card>
					<div className='section-header'>
						<Title level={2} className='section-title'>
							📄 Отчет за {report.date}
						</Title>
					</div>

					<div className='text-center mb-8'>
						{report.photoUrl ? (
							<img
								src={report.photoUrl}
								alt='Фото отчета'
								className='w-32 h-32 object-cover rounded-full border-4 border-gray-200 mx-auto'
							/>
						) : (
							<div className='w-32 h-32 flex items-center justify-center rounded-full border-4 border-gray-200 bg-gray-100 mx-auto'>
								<span className='text-4xl text-gray-400'>📊</span>
							</div>
						)}
					</div>

					<div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-lg'>
							<div className='flex justify-between py-2 border-b border-gray-200'>
								<span className='font-semibold text-gray-700'>Вес:</span>
								<span className='text-gray-900'>{report.weight} кг</span>
							</div>
							<div className='flex justify-between py-2 border-b border-gray-200'>
								<span className='font-semibold text-gray-700'>Талия:</span>
								<span className='text-gray-900'>{report.waist} см</span>
							</div>
							<div className='flex justify-between py-2 border-b border-gray-200'>
								<span className='font-semibold text-gray-700'>Грудь:</span>
								<span className='text-gray-900'>{report.chest} см</span>
							</div>
							<div className='flex justify-between py-2 border-b border-gray-200'>
								<span className='font-semibold text-gray-700'>Бёдра:</span>
								<span className='text-gray-900'>{report.hips} см</span>
							</div>
							<div className='flex justify-between py-2 border-b border-gray-200'>
								<span className='font-semibold text-gray-700'>Нога:</span>
								<span className='text-gray-900'>{report.leg} см</span>
							</div>
							<div className='flex justify-between py-2'>
								<span className='font-semibold text-gray-700'>Рука:</span>
								<span className='text-gray-900'>{report.arm} см</span>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}
