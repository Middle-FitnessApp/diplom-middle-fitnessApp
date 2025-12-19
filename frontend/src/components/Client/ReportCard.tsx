import React from 'react'
import { Card, Tag, Space, Typography } from 'antd'
import { computeDiffs, formatDate } from '../../utils/progressFunctions.ts'
import { API_BASE_URL } from '../../config/api.config'
import type { ProgressReport } from '../../store/types/progress.types'

const { Text } = Typography

interface ReportCardProps {
	report: ProgressReport
	prevReport?: ProgressReport
	onClick: (id: string) => void
	onPhotoError: (id: string) => void
	failedPhotoIds: Set<string>
	isDark: boolean
}

export const ReportCard: React.FC<ReportCardProps> = ({
	report,
	prevReport,
	onClick,
	onPhotoError,
	failedPhotoIds,
	isDark,
}) => {
	const diffs = computeDiffs(report, prevReport)
	const shouldShowPhoto = !!report.photoFront && !failedPhotoIds.has(report.id)

	const titleClass = isDark ? 'text-slate-100' : 'text-gray-800'
	const textClass = isDark ? 'text-slate-300' : 'text-gray-700'
	const textMutedClass = isDark ? 'text-slate-400' : 'text-gray-600'

	return (
		<Card
			key={report.id}
			style={{ marginBottom: 8 }}
			className='report-card cursor-pointer hover:shadow-lg transition-shadow mb-4'
			onClick={() => onClick(report.id)}
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
					<div className='shrink-0 md:ml-4' onClick={(e) => e.stopPropagation()}>
						<img
							src={`${API_BASE_URL}${report.photoFront}`}
							alt='Фото отчета'
							className={`w-20 h-20 object-cover rounded-full border-2 ${
								isDark ? 'border-slate-600' : 'border-gray-200'
							}`}
							onError={() => onPhotoError(report.id)}
						/>
					</div>
				)}
			</div>
		</Card>
	)
}
