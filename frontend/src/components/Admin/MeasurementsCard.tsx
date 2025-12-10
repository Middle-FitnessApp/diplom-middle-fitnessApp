import { Typography } from 'antd'
import type { ProgressReport } from '../../store/api/progress.api'

const { Title } = Typography

interface MeasurementsCardProps {
	report: ProgressReport
}

export const MeasurementsCard = ({ report }: MeasurementsCardProps) => {
	return (
		<div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
			<Title level={4} className='mb-4'>
				Измерения
			</Title>
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
					<span className='font-semibold text-gray-700'>Бёдра:</span>
					<span className='text-gray-900'>{report.hips} см</span>
				</div>

				{report.height && (
					<div className='flex justify-between py-2 border-b border-gray-200'>
						<span className='font-semibold text-gray-700'>Рост:</span>
						<span className='text-gray-900'>{report.height} см</span>
					</div>
				)}
				{report.chest && (
					<div className='flex justify-between py-2 border-b border-gray-200'>
						<span className='font-semibold text-gray-700'>Грудь:</span>
						<span className='text-gray-900'>{report.chest} см</span>
					</div>
				)}
				{report.arm && (
					<div className='flex justify-between py-2 border-b border-gray-200'>
						<span className='font-semibold text-gray-700'>Рука:</span>
						<span className='text-gray-900'>{report.arm} см</span>
					</div>
				)}
				{report.leg && (
					<div className='flex justify-between py-2'>
						<span className='font-semibold text-gray-700'>Нога:</span>
						<span className='text-gray-900'>{report.leg} см</span>
					</div>
				)}
			</div>
		</div>
	)
}
